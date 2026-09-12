import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import type { AchievementDto, StreakDto } from '../../contracts/xp.js';
import { ActivityEvent } from '../activity/activity-event.entity.js';
import { User } from '../users/user.entity.js';
import { AchievementDef } from './achievement-def.entity.js';
import { ACHIEVEMENT_DEFS } from './achievement.defs.js';
import { UserAchievement } from './user-achievement.entity.js';

export type AchievementContext = {
  leveledUp: boolean;
  streaks: StreakDto[];
};

@Injectable()
export class AchievementService {
  constructor(private readonly em: EntityManager) {}

  async ensureDefs(em: EntityManager): Promise<void> {
    for (const def of ACHIEVEMENT_DEFS) {
      const existing = await em.findOne(AchievementDef, { key: def.key });
      if (!existing) {
        em.create(AchievementDef, def);
      }
    }
    await em.flush();
  }

  async listForUser(em: EntityManager, userId: string): Promise<AchievementDto[]> {
    await this.ensureDefs(em);
    const defs = await em.find(AchievementDef, {}, { orderBy: { title: 'ASC' } });
    const unlocked = await em.find(
      UserAchievement,
      { user: userId },
      { populate: ['achievement'] },
    );
    const unlockedAt = new Map(unlocked.map((row) => [row.achievement.key, row.unlockedAt]));
    return defs.map((def) => ({
      id: def.id,
      key: def.key,
      title: def.title,
      summary: def.summary,
      unlockedAt: unlockedAt.get(def.key)?.toISOString() ?? null,
    }));
  }

  async listFor(userId: string): Promise<AchievementDto[]> {
    return this.listForUser(this.em.fork(), userId);
  }

  async unlockByKey(em: EntityManager, user: User, key: string): Promise<AchievementDef | null> {
    await this.ensureDefs(em);
    const def = await em.findOne(AchievementDef, { key });
    if (!def) {
      return null;
    }
    return this.unlock(em, user, def);
  }

  async evaluate(
    em: EntityManager,
    user: User,
    event: ActivityEvent,
    context: AchievementContext,
  ): Promise<AchievementDef[]> {
    await this.ensureDefs(em);
    const defs = await em.find(AchievementDef, {});
    const unlocked: AchievementDef[] = [];
    for (const def of defs) {
      if (!(await this.matches(em, user, event, def.rule, context))) {
        continue;
      }
      const created = await this.unlock(em, user, def);
      if (created) {
        unlocked.push(created);
      }
    }
    return unlocked;
  }

  private async unlock(
    em: EntityManager,
    user: User,
    def: AchievementDef,
  ): Promise<AchievementDef | null> {
    const existing = await em.findOne(UserAchievement, { user: user.id, achievement: def.id });
    if (existing) {
      return null;
    }
    em.create(UserAchievement, { user, achievement: def });
    await em.flush();
    return def;
  }

  private async matches(
    em: EntityManager,
    user: User,
    event: ActivityEvent,
    rule: string,
    context: AchievementContext,
  ): Promise<boolean> {
    switch (rule) {
      case 'first_workout':
        return (await this.workoutCount(em, user.id)) >= 1;
      case 'ten_workouts':
        return (await this.workoutCount(em, user.id)) >= 10;
      case 'seven_day_streak':
        return context.streaks.some((streak) => streak.current >= 7);
      case 'level_up':
        return context.leveledUp;
      case 'personal_record':
        return (
          event.type === 'PERSONAL_RECORD' ||
          event.payload?.pr === true ||
          event.payload?.personalRecord === true
        );
      default:
        return false;
    }
  }

  private workoutCount(em: EntityManager, userId: string): Promise<number> {
    return em.count(ActivityEvent, { user: userId, type: 'WORKOUT_COMPLETED' });
  }
}
