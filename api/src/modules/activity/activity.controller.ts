import { Controller, Get, Query } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { ActivityCategory, ActivityType } from '../../contracts/activity.js';
import { ActivityEvent } from './activity-event.entity.js';

@Controller()
export class ActivityController {
  constructor(private readonly em: EntityManager) {}

  @Get('activity')
  async list(
    @Query('category') category?: ActivityCategory,
    @Query('type') type?: ActivityType,
    @Query('tag') tag?: string,
  ) {
    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category;
    }
    if (type) {
      where.type = type;
    }
    const events = await this.em.find(ActivityEvent, where, {
      orderBy: { occurredAt: 'DESC' },
      limit: 100,
    });
    return events
      .filter((event) => (tag ? event.tags.includes(tag) : true))
      .map((event) => ({
        id: event.id,
        category: event.category,
        type: event.type,
        occurredAt: event.occurredAt.toISOString(),
        title: event.title,
        summary: event.summary,
        xpAwarded: event.xpAwarded,
        payload: event.payload ?? {},
        tags: event.tags,
      }));
  }

  @Get('timeline')
  async timeline(
    @Query('category') category?: ActivityCategory,
    @Query('type') type?: ActivityType,
    @Query('tag') tag?: string,
  ) {
    return this.list(category, type, tag);
  }
}
