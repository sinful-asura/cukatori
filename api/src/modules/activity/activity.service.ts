import { FilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import type { ActivityEventDto, ActivityQuery } from '../../contracts/activity.js';
import { ActivityEvent } from './activity-event.entity.js';

@Injectable()
export class ActivityService {
  constructor(private readonly em: EntityManager) {}

  async list(userId: string, query: ActivityQuery = {}): Promise<ActivityEventDto[]> {
    const em = this.em.fork();
    const where: FilterQuery<ActivityEvent> = { user: userId };
    if (query.category) {
      where.category = query.category;
    }
    if (query.type) {
      where.type = query.type;
    }
    const occurredAt: { $gte?: Date; $lte?: Date } = {};
    if (query.from) {
      occurredAt.$gte = new Date(query.from);
    }
    if (query.to) {
      occurredAt.$lte = parseTo(query.to);
    }
    if (occurredAt.$gte || occurredAt.$lte) {
      where.occurredAt = occurredAt;
    }
    if (query.tag) {
      where.tags = { $contains: [query.tag] };
    }
    const events = await em.find(ActivityEvent, where, {
      orderBy: { occurredAt: 'DESC' },
      limit: 100,
    });
    return events.map((event) => ({
      id: event.id,
      category: event.category as ActivityEventDto['category'],
      type: event.type as ActivityEventDto['type'],
      occurredAt: event.occurredAt.toISOString(),
      title: event.title,
      summary: event.summary,
      xpAwarded: event.xpAwarded,
      payload: event.payload ?? {},
      tags: event.tags,
    }));
  }
}

function parseTo(value: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T23:59:59.999Z`);
  }
  return new Date(value);
}
