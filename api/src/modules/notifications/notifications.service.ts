import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { NotificationDto } from '../../contracts/notifications.js';
import { User } from '../users/user.entity.js';
import { Notification } from './notification.entity.js';

export type NotificationWrite = {
  kind: string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly em: EntityManager) {}

  toDto(row: Notification): NotificationDto {
    return {
      id: row.id,
      kind: row.kind,
      title: row.title,
      body: row.body,
      readAt: row.readAt ? row.readAt.toISOString() : null,
      payload: row.payload ?? {},
      createdAt: row.createdAt.toISOString(),
    };
  }

  async create(em: EntityManager, user: User, input: NotificationWrite): Promise<Notification> {
    const row = em.create(Notification, {
      user,
      kind: input.kind,
      title: input.title,
      body: input.body,
      payload: input.payload ?? null,
    });
    await em.flush();
    return row;
  }

  async list(userId: string, unreadOnly = false): Promise<NotificationDto[]> {
    const em = this.em.fork();
    const rows = await em.find(
      Notification,
      unreadOnly ? { user: userId, readAt: null } : { user: userId },
      { orderBy: { createdAt: 'DESC' }, limit: 100 },
    );
    return rows.map((row) => this.toDto(row));
  }

  async markRead(userId: string, id: string): Promise<NotificationDto> {
    const em = this.em.fork();
    const row = await em.findOne(Notification, { id, user: userId });
    if (!row) {
      throw new NotFoundException('Notification not found');
    }
    if (!row.readAt) {
      row.readAt = new Date();
      await em.flush();
    }
    return this.toDto(row);
  }
}
