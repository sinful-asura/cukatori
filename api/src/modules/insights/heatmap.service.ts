import { BadRequestException, Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ActivityEvent } from '../activity/activity-event.entity.js';
import type { User } from '../users/user.entity.js';

export const HEATMAP_KINDS = ['training', 'habits', 'activity'] as const;
export type HeatmapKind = (typeof HEATMAP_KINDS)[number];

@Injectable()
export class HeatmapService {
  constructor(private readonly em: EntityManager) {}

  async get(user: User, kind: string, yearRaw?: string) {
    if (!HEATMAP_KINDS.includes(kind as HeatmapKind)) {
      throw new BadRequestException('Heatmap kind must be training, habits, or activity.');
    }
    const year = parseYear(yearRaw);
    const zone = user.timezone || 'Europe/Belgrade';
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59));

    const where: Record<string, unknown> = {
      user,
      occurredAt: { $gte: start, $lte: end },
    };
    if (kind === 'training') {
      where.category = 'exercise';
    } else if (kind === 'habits') {
      where.category = 'habit';
    }

    const events = await this.em.find(ActivityEvent, where, { orderBy: { occurredAt: 'ASC' } });
    const counts = new Map<string, number>();
    for (const event of events) {
      if (kind === 'training' && event.type !== 'WORKOUT_COMPLETED') {
        continue;
      }
      const key = dayKey(event.occurredAt, zone);
      const extra = volumeOf(event.payload);
      counts.set(key, (counts.get(key) ?? 0) + (extra > 0 ? Math.max(1, Math.round(extra / 2000)) : 1));
    }

    const days: { date: string; count: number; intensity: number }[] = [];
    for (let cursor = new Date(start); cursor.getUTCFullYear() === year; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const date = cursor.toISOString().slice(0, 10);
      const count = counts.get(date) ?? 0;
      days.push({ date, count, intensity: intensityOf(count) });
    }

    return {
      kind,
      year,
      days,
      streak: streakEndingToday(counts, zone),
    };
  }
}

function parseYear(raw?: string): number {
  const year = raw ? Number(raw) : new Date().getUTCFullYear();
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    return new Date().getUTCFullYear();
  }
  return year;
}

function dayKey(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function intensityOf(count: number): number {
  if (count <= 0) {
    return 0;
  }
  if (count === 1) {
    return 1;
  }
  if (count <= 3) {
    return 2;
  }
  if (count <= 5) {
    return 3;
  }
  return 4;
}

function volumeOf(payload: Record<string, unknown> | null): number {
  if (!payload) {
    return 0;
  }
  const volume = Number(payload.volume ?? payload.totalVolume ?? 0);
  return Number.isFinite(volume) ? volume : 0;
}

function streakEndingToday(counts: Map<string, number>, timeZone: string): number {
  let cursor = new Date();
  let streak = 0;
  const today = dayKey(cursor, timeZone);
  if ((counts.get(today) ?? 0) === 0) {
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  for (let i = 0; i < 400; i += 1) {
    const key = dayKey(cursor, timeZone);
    if ((counts.get(key) ?? 0) <= 0) {
      break;
    }
    streak += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}
