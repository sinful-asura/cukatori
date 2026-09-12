import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import type { ActivityEmitInput, ActivityType } from '../../contracts/activity.js';
import type { StreakDto } from '../../contracts/xp.js';
import { User } from '../users/user.entity.js';
import { Streak } from './streak.entity.js';

const NO_STREAK_TYPES = new Set<ActivityType>([
  'ACHIEVEMENT_UNLOCKED',
  'LEVEL_UP',
  'STREAK_UPDATED',
]);

function asDate(value: Date | string | null | undefined): Date | null {
  if (!value) {
    return null;
  }
  return value instanceof Date ? value : new Date(value);
}

function calendarKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function shiftKey(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return shifted.toISOString().slice(0, 10);
}

function payloadId(payload: Record<string, unknown> | undefined, key: string): string | null {
  const value = payload?.[key];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function streakKindsFor(input: ActivityEmitInput): string[] {
  if (NO_STREAK_TYPES.has(input.type)) {
    return [];
  }
  const kinds = new Set<string>(['overall']);
  if (input.type === 'WORKOUT_COMPLETED') {
    kinds.add('training');
  }
  if (input.type === 'HABIT_COMPLETED') {
    const habitId = payloadId(input.payload, 'habitId') ?? payloadId(input.payload, 'habit_id');
    if (habitId) {
      kinds.add(`habit:${habitId}`);
    }
  }
  return [...kinds];
}

@Injectable()
export class StreakService {
  constructor(private readonly em: EntityManager) {}

  toDto(row: Streak): StreakDto {
    return {
      kind: row.kind,
      current: row.current,
      longest: row.longest,
      lastActiveAt: asDate(row.lastActiveAt)?.toISOString() ?? null,
    };
  }

  async list(em: EntityManager, userId: string): Promise<StreakDto[]> {
    const rows = await em.find(Streak, { user: userId }, { orderBy: { kind: 'ASC' } });
    return rows.map((row) => this.toDto(row));
  }

  async listFor(userId: string): Promise<StreakDto[]> {
    return this.list(this.em.fork(), userId);
  }

  async touch(
    em: EntityManager,
    user: User,
    input: ActivityEmitInput,
    occurredAt: Date,
  ): Promise<StreakDto[]> {
    const kinds = streakKindsFor(input);
    if (kinds.length === 0) {
      return this.list(em, user.id);
    }
    const timeZone = user.timezone || 'Europe/Belgrade';
    const eventKey = calendarKey(occurredAt, timeZone);
    const updated: StreakDto[] = [];
    for (const kind of kinds) {
      let row = await em.findOne(Streak, { user: user.id, kind });
      if (!row) {
        row = em.create(Streak, { user, kind, current: 0, longest: 0, lastActiveAt: null });
      }
      const lastKey = asDate(row.lastActiveAt) ? calendarKey(asDate(row.lastActiveAt)!, timeZone) : null;
      if (lastKey === eventKey) {
        updated.push(this.toDto(row));
        continue;
      }
      if (lastKey === shiftKey(eventKey, -1)) {
        row.current += 1;
      } else {
        row.current = 1;
      }
      row.longest = Math.max(row.longest, row.current);
      row.lastActiveAt = occurredAt;
      updated.push(this.toDto(row));
    }
    await em.flush();
    return updated;
  }
}
