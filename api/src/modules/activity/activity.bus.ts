import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { XP_AWARDS, type ActivityEmitInput, type ActivityEventDto } from '../../contracts/activity.js';
import { User } from '../users/user.entity.js';
import { ActivityEvent } from './activity-event.entity.js';

@Injectable()
export class ActivityBus {
  constructor(private readonly em: EntityManager) {}

  async emit(userId: string, input: ActivityEmitInput): Promise<ActivityEventDto> {
    const user = await this.em.findOneOrFail(User, { id: userId });
    const xp = input.xp ?? XP_AWARDS[input.type] ?? 0;
    const event = this.em.create(ActivityEvent, {
      user,
      category: input.category,
      type: input.type,
      title: input.title,
      summary: input.summary,
      xpAwarded: xp,
      payload: input.payload ?? null,
      tags: input.tags ?? [],
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
    });
    await this.em.persist(event).flush();
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
