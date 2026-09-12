import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ActivityEvent } from '../activity/activity-event.entity.js';

export type TrainingSet = {
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  volume: number;
  e1rm: number;
  occurredAt: Date;
};

export type SessionPoint = {
  occurredAt: Date;
  volume: number;
  e1rmAvg: number;
  sets: TrainingSet[];
};

const JOIN_SQL = [
  `SELECT e.id::text AS id, e.name AS name, s.weight::float AS weight, s.reps::int AS reps,
          COALESCE(w.completed_at, w."completedAt") AS occurred
   FROM workout_sets s
   INNER JOIN workouts w ON w.id = s.workout_id
   INNER JOIN exercises e ON e.id = s.exercise_id
   WHERE w.user_id = ? AND COALESCE(w.completed_at, w."completedAt") >= ?`,
  `SELECT e.id::text AS id, e.name AS name, s.weight::float AS weight, s.reps::int AS reps,
          w."completedAt" AS occurred
   FROM workout_sets s
   INNER JOIN workouts w ON w.id = s."workout"
   INNER JOIN exercises e ON e.id = s."exercise"
   WHERE w.user_id = ? AND w."completedAt" >= ?`,
];

@Injectable()
export class TrainingReader {
  constructor(private readonly em: EntityManager) {}

  async sets(userId: string, since: Date): Promise<TrainingSet[]> {
    for (const sql of JOIN_SQL) {
      try {
        const rows = (await this.em.getConnection().execute(sql, [userId, since])) as Record<
          string,
          unknown
        >[];
        if (Array.isArray(rows) && rows.length) {
          return rows.map((row) => toSet(row)).filter((row): row is TrainingSet => row !== null);
        }
      } catch {
        // exercise-core tables may not exist yet
      }
    }
    return this.fromActivity(userId, since);
  }

  async sessions(userId: string, since: Date): Promise<SessionPoint[]> {
    const sets = await this.sets(userId, since);
    const buckets = new Map<string, TrainingSet[]>();
    for (const set of sets) {
      const key = set.occurredAt.toISOString().slice(0, 13);
      const list = buckets.get(key) ?? [];
      list.push(set);
      buckets.set(key, list);
    }
    return [...buckets.values()].map((group) => {
      const volume = group.reduce((sum, item) => sum + item.volume, 0);
      const e1rmAvg = group.reduce((sum, item) => sum + item.e1rm, 0) / group.length;
      return { occurredAt: group[0].occurredAt, volume, e1rmAvg, sets: group };
    });
  }

  private async fromActivity(userId: string, since: Date): Promise<TrainingSet[]> {
    const events = await this.em.find(
      ActivityEvent,
      { user: userId, category: 'exercise', occurredAt: { $gte: since } },
      { orderBy: { occurredAt: 'ASC' } },
    );
    const out: TrainingSet[] = [];
    for (const event of events) {
      if (event.type !== 'WORKOUT_COMPLETED' && event.type !== 'PERSONAL_RECORD') {
        continue;
      }
      out.push(...liftsFromPayload(event.payload, event.occurredAt));
    }
    return out;
  }
}

function toSet(row: Record<string, unknown>): TrainingSet | null {
  const name = String(row.name ?? row.exerciseName ?? '').trim();
  const weight = Number(row.weight ?? 0);
  const reps = Number(row.reps ?? 0);
  if (!name || !Number.isFinite(weight) || !Number.isFinite(reps) || reps <= 0) {
    return null;
  }
  const occurred = row.occurred instanceof Date ? row.occurred : new Date(String(row.occurred));
  return {
    exerciseId: String(row.id ?? slug(name)),
    exerciseName: name,
    weight,
    reps,
    volume: weight * reps,
    e1rm: e1rm(weight, reps),
    occurredAt: occurred,
  };
}

function liftsFromPayload(payload: Record<string, unknown> | null, occurredAt: Date): TrainingSet[] {
  if (!payload) {
    return [];
  }
  const lifts: TrainingSet[] = [];
  const exercises = payload.exercises;
  if (Array.isArray(exercises)) {
    for (const raw of exercises) {
      if (!raw || typeof raw !== 'object') {
        continue;
      }
      const item = raw as Record<string, unknown>;
      const name = String(item.name ?? item.exerciseName ?? '').trim();
      if (!name) {
        continue;
      }
      const weight = Number(item.weight ?? item.load ?? 0);
      const reps = Number(item.reps ?? 0);
      const estimated = Number(item.e1rm ?? item.estimated1rm ?? 0);
      const volume = Number(item.volume ?? weight * reps);
      lifts.push({
        exerciseId: String(item.id ?? item.exerciseId ?? slug(name)),
        exerciseName: name,
        weight,
        reps,
        volume: Number.isFinite(volume) ? volume : 0,
        e1rm: Number.isFinite(estimated) && estimated > 0 ? estimated : e1rm(weight, reps),
        occurredAt,
      });
    }
  }
  const sets = payload.sets;
  if (Array.isArray(sets)) {
    for (const raw of sets) {
      if (!raw || typeof raw !== 'object') {
        continue;
      }
      const parsed = toSet({ ...(raw as Record<string, unknown>), occurred: occurredAt });
      if (parsed) {
        lifts.push(parsed);
      }
    }
  }
  return lifts;
}

function e1rm(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
