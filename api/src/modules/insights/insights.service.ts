import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import type { ActivityType } from '../../contracts/activity.js';
import { ActivityBus } from '../activity/activity.bus.js';
import type { User } from '../users/user.entity.js';
import { CatalogReader } from './catalog.reader.js';
import { MUSCLE_IDS } from './catalog.fallback.js';
import { DeloadDismissal } from './deload-dismissal.entity.js';
import { Discomfort } from './discomfort.entity.js';
import type { CreateDiscomfortDto, UpdateDiscomfortDto } from './discomfort.dto.js';
import { TrainingReader } from './training.reader.js';

const PLATEAU_WEEKS = 4;
const FLAT_RATIO = 0.03;
const DELOAD_COPY = 'Consider a lighter week.';
const PLATEAU_COPY = 'Possible plateau';

@Injectable()
export class InsightsService {
  constructor(
    private readonly em: EntityManager,
    private readonly bus: ActivityBus,
    private readonly catalogReader: CatalogReader,
    private readonly training: TrainingReader,
  ) {}

  async catalog() {
    const exercises = await this.catalogReader.list();
    return { muscles: [...MUSCLE_IDS], exercises };
  }

  async listDiscomfort(user: User, region?: string) {
    const where: Record<string, unknown> = { user };
    if (region) {
      where.region = region;
    }
    const rows = await this.em.find(Discomfort, where, { orderBy: { createdAt: 'DESC' } });
    return rows.map((row) => this.toDiscomfort(row));
  }

  async createDiscomfort(user: User, dto: CreateDiscomfortDto) {
    const tags = mergeTags(dto.tags, dto.description);
    const note = this.em.create(Discomfort, {
      user,
      region: slug(dto.region),
      side: dto.side ?? 'both',
      description: dto.description.trim(),
      severity: dto.severity ?? null,
      exerciseId: dto.exerciseId ?? null,
      tags,
    });
    await this.em.persist(note).flush();
    await this.bus.emit(user.id, {
      category: 'exercise',
      type: 'DISCOMFORT_LOGGED' as ActivityType,
      title: 'Discomfort noted',
      summary: `You marked ${label(note.region)} discomfort.`,
      xp: 0,
      payload: { discomfortId: note.id, region: note.region, side: note.side },
      tags: ['discomfort', note.region, ...tags],
    });
    return this.toDiscomfort(note);
  }

  async updateDiscomfort(user: User, id: string, dto: UpdateDiscomfortDto) {
    const note = await this.requireDiscomfort(user, id);
    if (dto.region) {
      note.region = slug(dto.region);
    }
    if (dto.side) {
      note.side = dto.side;
    }
    if (dto.description) {
      note.description = dto.description.trim();
    }
    if (dto.severity !== undefined) {
      note.severity = dto.severity;
    }
    if (dto.exerciseId !== undefined) {
      note.exerciseId = dto.exerciseId;
    }
    if (dto.tags) {
      note.tags = mergeTags(dto.tags, note.description);
    }
    await this.em.flush();
    await this.bus.emit(user.id, {
      category: 'exercise',
      type: 'DISCOMFORT_LOGGED' as ActivityType,
      title: 'Discomfort updated',
      summary: `You marked ${label(note.region)} discomfort.`,
      xp: 0,
      payload: { discomfortId: note.id, region: note.region, side: note.side },
      tags: ['discomfort', note.region, ...note.tags],
    });
    return this.toDiscomfort(note);
  }

  async removeDiscomfort(user: User, id: string) {
    const note = await this.requireDiscomfort(user, id);
    await this.em.remove(note).flush();
    await this.bus.emit(user.id, {
      category: 'exercise',
      type: 'DISCOMFORT_LOGGED' as ActivityType,
      title: 'Discomfort note removed',
      summary: `You removed a ${label(note.region)} discomfort note.`,
      xp: 0,
      payload: { discomfortId: id, region: note.region },
      tags: ['discomfort', note.region],
    });
    return { ok: true };
  }

  async plateaus(user: User) {
    const since = weeksAgo(PLATEAU_WEEKS + 1);
    const sets = await this.training.sets(user.id, since);
    const byExercise = new Map<string, { name: string; weekly: Map<string, number> }>();
    for (const set of sets) {
      const bucket = byExercise.get(set.exerciseId) ?? {
        name: set.exerciseName,
        weekly: new Map<string, number>(),
      };
      const week = isoWeek(set.occurredAt);
      const current = bucket.weekly.get(week) ?? 0;
      bucket.weekly.set(week, Math.max(current, set.e1rm));
      byExercise.set(set.exerciseId, bucket);
    }

    const items = [...byExercise.entries()]
      .map(([exerciseId, info]) => {
        const weeks = [...info.weekly.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-PLATEAU_WEEKS);
        if (weeks.length < PLATEAU_WEEKS) {
          return null;
        }
        const values = weeks.map(([, value]) => value);
        const peak = Math.max(...values);
        const trough = Math.min(...values);
        if (peak <= 0 || (peak - trough) / peak > FLAT_RATIO) {
          return null;
        }
        return {
          exerciseId,
          exerciseName: info.name,
          weeksFlat: weeks.length,
          message: PLATEAU_COPY,
          detail: `${weeks.length} weeks without meaningful progression.`,
          options: [
            'Change the rep range',
            'Modify volume',
            'Use a variation',
            'Attempt a small load increase',
            'Consider a lighter week',
          ],
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return { items };
  }

  async deload(user: User) {
    const dismissed = await this.isDismissed(user);
    const now = new Date();
    const last7 = daysAgo(now, 7);
    const prior7 = daysAgo(now, 14);
    const recent = await this.training.sessions(user.id, prior7);
    const current = recent.filter((session) => session.occurredAt >= last7);
    const previous = recent.filter((session) => session.occurredAt < last7);
    const currentVolume = sum(current.map((session) => session.volume));
    const previousVolume = sum(previous.map((session) => session.volume));
    const currentE1rm = avg(current.map((session) => session.e1rmAvg));
    const previousE1rm = avg(previous.map((session) => session.e1rmAvg));

    const signals: string[] = [];
    if (previousVolume > 0 && currentVolume >= previousVolume * 1.25) {
      signals.push('Training volume rose sharply versus the prior week.');
    }
    if (current.length >= 5 || (previous.length > 0 && current.length >= previous.length + 2)) {
      signals.push('Session frequency is higher than usual.');
    }
    if (previousE1rm > 0 && currentE1rm > 0 && currentE1rm <= previousE1rm * 0.97) {
      signals.push('Recent estimated 1RM looks a little lower.');
    }

    const suggest = signals.length >= 2 && !dismissed;
    return {
      suggest,
      dismissed,
      message: DELOAD_COPY,
      detail: suggest
        ? 'Training load has increased significantly recently. Consider a lighter week.'
        : 'No lighter-week suggestion right now.',
      signals,
    };
  }

  async dismissDeload(user: User) {
    const weekKey = isoWeek(new Date());
    const existing = await this.em.findOne(DeloadDismissal, { user, weekKey });
    if (!existing) {
      this.em.create(DeloadDismissal, { user, weekKey, dismissedAt: new Date() });
      await this.em.flush();
    }
    await this.bus.emit(user.id, {
      category: 'exercise',
      type: 'DELOAD_DISMISSED' as ActivityType,
      title: 'Lighter-week note dismissed',
      summary: DELOAD_COPY,
      xp: 0,
      payload: { weekKey },
      tags: ['deload'],
    });
    return this.deload(user);
  }

  private async requireDiscomfort(user: User, id: string) {
    const note = await this.em.findOne(Discomfort, { id, user });
    if (!note) {
      throw new NotFoundException('Discomfort note not found.');
    }
    return note;
  }

  private async isDismissed(user: User): Promise<boolean> {
    const weekKey = isoWeek(new Date());
    const row = await this.em.findOne(DeloadDismissal, { user, weekKey });
    return Boolean(row);
  }

  private toDiscomfort(note: Discomfort) {
    return {
      id: note.id,
      region: note.region,
      side: note.side,
      description: note.description,
      severity: note.severity,
      exerciseId: note.exerciseId,
      tags: note.tags,
      createdAt: note.createdAt.toISOString(),
      summary: `You marked ${label(note.region)} discomfort.`,
    };
  }
}

function mergeTags(tags: string[] | undefined, description: string): string[] {
  const fromCopy = [...description.matchAll(/#([a-z0-9_-]+)/gi)].map((match) => match[1].toLowerCase());
  return [...new Set([...(tags ?? []).map((tag) => tag.replace(/^#/, '').toLowerCase()), ...fromCopy])];
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function label(region: string): string {
  if (region === 'shoulders') {
    return 'shoulder';
  }
  return region.replace(/-/g, ' ');
}

function weeksAgo(weeks: number): Date {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - weeks * 7);
  return date;
}

function daysAgo(now: Date, days: number): Date {
  return new Date(now.getTime() - days * 86_400_000);
}

function isoWeek(date: Date): string {
  const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function avg(values: number[]): number {
  return values.length ? sum(values) / values.length : 0;
}
