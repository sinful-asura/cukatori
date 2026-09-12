import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { XP_AWARDS, type ActivityEmitInput, type ActivityEventDto, type ActivityType } from '../../contracts/activity.js';
import { AchievementService } from '../gamification/achievement.service.js';
import { StreakService } from '../gamification/streak.service.js';
import { XpService } from '../gamification/xp.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { User } from '../users/user.entity.js';
import { ActivityEvent } from './activity-event.entity.js';

const DERIVED_TYPES = new Set<ActivityType>([
  'ACHIEVEMENT_UNLOCKED',
  'LEVEL_UP',
  'STREAK_UPDATED',
]);

@Injectable()
export class ActivityBus {
  constructor(
    private readonly em: EntityManager,
    private readonly xp: XpService,
    private readonly streaks: StreakService,
    private readonly achievements: AchievementService,
    private readonly notifications: NotificationsService,
  ) {}

  async emit(userId: string, input: ActivityEmitInput): Promise<ActivityEventDto> {
    const em = this.em.fork();
    return em.transactional(async () => {
      const user = await em.findOneOrFail(User, { id: userId });
      const event = await this.persistEvent(em, user, input);
      if (DERIVED_TYPES.has(input.type) && input.type !== 'ACHIEVEMENT_UNLOCKED') {
        return this.toDto(event);
      }

      let leveledUp = false;
      if (event.xpAwarded > 0) {
        const awarded = await this.xp.award(em, user, event.xpAwarded, event);
        leveledUp = awarded.leveledUp;
      }

      if (input.type === 'ACHIEVEMENT_UNLOCKED') {
        if (leveledUp) {
          await this.recordLevelUp(em, user);
        }
        return this.toDto(event);
      }

      const streaks = await this.streaks.touch(em, user, input, event.occurredAt);
      const unlocked = await this.achievements.evaluate(em, user, event, { leveledUp, streaks });

      for (const def of unlocked) {
        const unlockEvent = await this.persistEvent(em, user, {
          category: 'system',
          type: 'ACHIEVEMENT_UNLOCKED',
          title: def.title,
          summary: def.summary,
          tags: ['achievement', def.key],
          payload: { achievementKey: def.key },
        });
        if (unlockEvent.xpAwarded > 0) {
          const extra = await this.xp.award(em, user, unlockEvent.xpAwarded, unlockEvent);
          if (extra.leveledUp) {
            leveledUp = true;
          }
        }
        await this.notifications.create(em, user, {
          kind: 'achievement',
          title: def.title,
          body: def.summary,
          payload: { achievementKey: def.key, eventId: unlockEvent.id },
        });
      }

      if (leveledUp) {
        await this.recordLevelUp(em, user);
      }

      if (this.isPersonalRecord(event)) {
        await this.notifications.create(em, user, {
          kind: 'pr',
          title: event.title,
          body: event.summary,
          payload: { eventId: event.id },
        });
      }

      const streakHit = streaks.find(
        (row) => row.current === 7 && (row.kind === 'training' || row.kind === 'overall'),
      );
      if (streakHit) {
        await this.persistEvent(em, user, {
          category: 'system',
          type: 'STREAK_UPDATED',
          title: '7-day streak',
          summary: `Your ${streakHit.kind} streak is 7 days.`,
          tags: ['streak', streakHit.kind],
          payload: { kind: streakHit.kind, current: streakHit.current },
          xp: 0,
        });
        await this.notifications.create(em, user, {
          kind: 'streak',
          title: '7-day streak',
          body: `Your ${streakHit.kind} streak is 7 days.`,
          payload: { kind: streakHit.kind, current: streakHit.current },
        });
      }

      return this.toDto(event);
    });
  }

  private async recordLevelUp(em: EntityManager, user: User): Promise<void> {
    const progress = await this.xp.progress(em, user.id);
    await this.persistEvent(em, user, {
      category: 'system',
      type: 'LEVEL_UP',
      title: `Level ${progress.level}`,
      summary: `You reached level ${progress.level}.`,
      tags: ['level'],
      payload: { level: progress.level },
      xp: 0,
    });
    const leveled = await this.achievements.unlockByKey(em, user, 'level_up');
    if (leveled) {
      const unlockEvent = await this.persistEvent(em, user, {
        category: 'system',
        type: 'ACHIEVEMENT_UNLOCKED',
        title: leveled.title,
        summary: leveled.summary,
        tags: ['achievement', leveled.key],
        payload: { achievementKey: leveled.key },
      });
      if (unlockEvent.xpAwarded > 0) {
        await this.xp.award(em, user, unlockEvent.xpAwarded, unlockEvent);
      }
      await this.notifications.create(em, user, {
        kind: 'achievement',
        title: leveled.title,
        body: leveled.summary,
        payload: { achievementKey: leveled.key, eventId: unlockEvent.id },
      });
    }
    await this.notifications.create(em, user, {
      kind: 'level_up',
      title: `Level ${progress.level}`,
      body: `You reached level ${progress.level}.`,
      payload: { level: progress.level },
    });
  }

  private isPersonalRecord(event: ActivityEvent): boolean {
    return (
      event.type === 'PERSONAL_RECORD' ||
      event.payload?.pr === true ||
      event.payload?.personalRecord === true
    );
  }

  private async persistEvent(
    em: EntityManager,
    user: User,
    input: ActivityEmitInput,
  ): Promise<ActivityEvent> {
    const event = em.create(ActivityEvent, {
      user,
      category: input.category,
      type: input.type,
      title: input.title,
      summary: input.summary,
      xpAwarded: input.xp ?? XP_AWARDS[input.type] ?? 0,
      payload: input.payload ?? null,
      tags: input.tags ?? [],
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
    });
    await em.persist(event).flush();
    return event;
  }

  private toDto(event: ActivityEvent): ActivityEventDto {
    return {
      id: event.id,
      category: event.category as ActivityEventDto['category'],
      type: event.type as ActivityEventDto['type'],
      occurredAt: event.occurredAt.toISOString(),
      title: event.title,
      summary: event.summary,
      xpAwarded: event.xpAwarded,
      payload: event.payload ?? {},
      tags: event.tags,
    };
  }
}
