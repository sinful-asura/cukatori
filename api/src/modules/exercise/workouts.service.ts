import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { ActivityBus } from '../activity/activity.bus.js';
import { CatalogService } from '../catalog/catalog.service.js';
import { Exercise } from '../catalog/exercise.entity.js';
import { User } from '../users/user.entity.js';
import {
  CompleteWorkoutDto,
  CreateWorkoutDto,
  CreateWorkoutSetDto,
  PatchWorkoutDto,
} from './exercise.dto.js';
import { PersonalRecord } from './personal-record.entity.js';
import {
  buildMuscleMix,
  estimated1Rm,
  sessionCopy,
  setVolume,
  volumeChangePct,
  type MuscleMixItem,
} from './workout-math.js';
import { Workout } from './workout.entity.js';
import { WorkoutSet } from './workout-set.entity.js';

const SECONDARY_WEIGHT = 0.35;
const WORKOUT_XP = 180;
const PR_XP = 40;

function iso(value: Date | string | null | undefined): string | null {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const LAST_SESSION_SETS: Array<{ slug: string; sets: Array<[number, number]> }> = [
  { slug: 'lat-pulldown', sets: [[70, 8], [70, 8], [70, 6]] },
  { slug: 'barbell-row', sets: [[80, 10], [80, 10], [80, 10]] },
  { slug: 'seated-cable-row', sets: [[60, 8], [60, 8]] },
  { slug: 'face-pull', sets: [[22, 15], [22, 15]] },
  { slug: 'barbell-curl', sets: [[30, 10], [30, 8]] },
  { slug: 'hammer-curl', sets: [[16, 10], [16, 10]] },
];

const PREVIOUS_SESSION_SETS: Array<{ slug: string; sets: Array<[number, number]> }> = [
  { slug: 'lat-pulldown', sets: [[70, 10], [70, 10], [70, 8]] },
  { slug: 'barbell-row', sets: [[72, 8], [72, 8], [72, 8]] },
  { slug: 'seated-cable-row', sets: [[55, 10], [55, 8]] },
  { slug: 'face-pull', sets: [[20, 15], [20, 12]] },
  { slug: 'barbell-curl', sets: [[27, 10], [27, 8]] },
  { slug: 'hammer-curl', sets: [[12, 10], [12, 10]] },
];

/** Baselines so the last session logs exactly three new PRs. */
const DEMO_PR_BASELINES: Array<{ slug: string; kind: PersonalRecord['kind']; value: number; unit: string }> =
  [
    { slug: 'lat-pulldown', kind: 'weight', value: 70, unit: 'kg' },
    { slug: 'lat-pulldown', kind: 'reps', value: 10, unit: 'reps' },
    { slug: 'lat-pulldown', kind: 'e1rm', value: 85, unit: 'kg' },
    { slug: 'lat-pulldown', kind: 'volume', value: 1600, unit: 'kg' },
    { slug: 'barbell-row', kind: 'weight', value: 75, unit: 'kg' },
    { slug: 'barbell-row', kind: 'reps', value: 10, unit: 'reps' },
    { slug: 'barbell-row', kind: 'e1rm', value: 110, unit: 'kg' },
    { slug: 'barbell-row', kind: 'volume', value: 2500, unit: 'kg' },
    { slug: 'seated-cable-row', kind: 'weight', value: 60, unit: 'kg' },
    { slug: 'seated-cable-row', kind: 'reps', value: 10, unit: 'reps' },
    { slug: 'seated-cable-row', kind: 'e1rm', value: 80, unit: 'kg' },
    { slug: 'seated-cable-row', kind: 'volume', value: 1000, unit: 'kg' },
    { slug: 'face-pull', kind: 'weight', value: 22, unit: 'kg' },
    { slug: 'face-pull', kind: 'reps', value: 15, unit: 'reps' },
    { slug: 'face-pull', kind: 'e1rm', value: 35, unit: 'kg' },
    { slug: 'face-pull', kind: 'volume', value: 700, unit: 'kg' },
    { slug: 'barbell-curl', kind: 'weight', value: 30, unit: 'kg' },
    { slug: 'barbell-curl', kind: 'reps', value: 10, unit: 'reps' },
    { slug: 'barbell-curl', kind: 'e1rm', value: 40, unit: 'kg' },
    { slug: 'barbell-curl', kind: 'volume', value: 400, unit: 'kg' },
    { slug: 'hammer-curl', kind: 'weight', value: 16, unit: 'kg' },
    { slug: 'hammer-curl', kind: 'reps', value: 12, unit: 'reps' },
    { slug: 'hammer-curl', kind: 'e1rm', value: 22, unit: 'kg' },
    { slug: 'hammer-curl', kind: 'volume', value: 320, unit: 'kg' },
  ];

@Injectable()
export class WorkoutsService {
  constructor(
    private readonly em: EntityManager,
    private readonly bus: ActivityBus,
    private readonly catalog: CatalogService,
  ) {}

  async list(userId: string, status?: 'draft' | 'completed') {
    await this.ensureReady(userId);
    const where: Record<string, unknown> = { user: userId };
    if (status) {
      where.status = status;
    }
    const workouts = await this.em.find(Workout, where, {
      orderBy: { startedAt: 'DESC' },
      populate: ['sets', 'sets.exercise'],
    });
    return workouts.map((workout) => this.toDto(workout));
  }

  async get(userId: string, id: string) {
    await this.ensureReady(userId);
    const workout = await this.loadWorkout(userId, id);
    return this.toDto(workout);
  }

  async create(user: User, input: CreateWorkoutDto) {
    await this.ensureReady(user.id);
    const workout = this.em.create(Workout, {
      user,
      title: input.title.trim() || 'Workout',
      notes: input.notes?.trim() || null,
      startedAt: input.startedAt ? new Date(input.startedAt) : new Date(),
      status: 'draft',
    });
    for (const set of input.sets ?? []) {
      await this.appendSet(workout, set);
    }
    await this.em.persist(workout).flush();
    await this.em.populate(workout, ['sets', 'sets.exercise']);
    return this.toDto(workout);
  }

  async patch(userId: string, id: string, input: PatchWorkoutDto) {
    const workout = await this.loadWorkout(userId, id);
    if (workout.status !== 'draft') {
      throw new BadRequestException('Completed sessions cannot be edited');
    }
    if (input.title !== undefined) {
      workout.title = input.title.trim() || workout.title;
    }
    if (input.notes !== undefined) {
      workout.notes = input.notes.trim() || null;
    }
    await this.em.flush();
    return this.toDto(workout);
  }

  async addSet(userId: string, id: string, input: CreateWorkoutSetDto) {
    const workout = await this.loadWorkout(userId, id);
    if (workout.status !== 'draft') {
      throw new BadRequestException('Completed sessions cannot be edited');
    }
    await this.appendSet(workout, input);
    await this.em.flush();
    await this.em.populate(workout, ['sets', 'sets.exercise']);
    return this.toDto(workout);
  }

  async removeSet(userId: string, workoutId: string, setId: string) {
    const workout = await this.loadWorkout(userId, workoutId);
    if (workout.status !== 'draft') {
      throw new BadRequestException('Completed sessions cannot be edited');
    }
    const set = workout.sets.getItems().find((row) => row.id === setId);
    if (!set) {
      throw new NotFoundException('Set not found');
    }
    this.em.remove(set);
    await this.em.flush();
    await this.em.populate(workout, ['sets', 'sets.exercise']);
    return this.toDto(workout);
  }

  async complete(user: User, id: string, input: CompleteWorkoutDto) {
    await this.ensureReady(user.id);
    const workout = await this.loadWorkout(user.id, id);
    if (workout.status === 'completed') {
      return this.toDto(workout);
    }
    if (workout.sets.length === 0) {
      throw new BadRequestException('Add at least one set before completing');
    }

    const completedAt = input.completedAt ? new Date(input.completedAt) : new Date();
    const durationMin =
      input.durationMin ??
      Math.max(1, Math.round((completedAt.getTime() - workout.startedAt.getTime()) / 60_000));

    const previous = await this.em.findOne(
      Workout,
      {
        user: user.id,
        status: 'completed',
        title: workout.title,
        id: { $ne: workout.id },
      },
      { orderBy: { completedAt: 'DESC' } },
    );

    const volumeKg = workout.sets
      .getItems()
      .reduce((sum, set) => sum + setVolume(set.weightKg, set.reps), 0);
    const previousVolumeKg = previous?.volumeKg ?? null;
    const changePct =
      previousVolumeKg == null ? null : volumeChangePct(volumeKg, previousVolumeKg);
    const muscleMix = this.muscleMixFor(workout);
    const prs = await this.detectAndStorePrs(user, workout, completedAt);
    const bestE1rmKg = workout.sets
      .getItems()
      .reduce((best, set) => Math.max(best, estimated1Rm(set.weightKg, set.reps)), 0);

    const copy = sessionCopy({
      title: workout.title,
      durationMin,
      setCount: workout.sets.length,
      volumeKg,
      volumeChangePct: changePct,
      prCount: prs.length,
    });

    workout.status = 'completed';
    workout.completedAt = completedAt;
    workout.durationMin = durationMin;
    workout.volumeKg = volumeKg;
    workout.setCount = workout.sets.length;
    workout.prCount = prs.length;
    workout.summaryCopy = copy;
    workout.summary = {
      durationMin,
      setCount: workout.sets.length,
      exerciseCount: new Set(workout.sets.getItems().map((set) => set.exercise.id)).size,
      volumeKg,
      previousVolumeKg,
      volumeChangePct: changePct,
      prCount: prs.length,
      xpEarned: WORKOUT_XP + prs.length * PR_XP,
      muscleMix,
      bestE1rmKg,
      copy,
    };
    workout.tags = [...new Set(muscleMix.map((item) => item.muscle))];
    await this.em.flush();

    await this.bus.emit(user.id, {
      category: 'exercise',
      type: 'WORKOUT_COMPLETED',
      title: workout.title,
      summary: copy,
      payload: {
        workoutId: workout.id,
        volumeKg,
        setCount: workout.sets.length,
        durationMin,
        volumeChangePct: changePct,
        prCount: prs.length,
        muscleMix,
      },
      tags: ['workout', ...workout.tags],
    });

    for (const pr of prs) {
      await this.bus.emit(user.id, {
        category: 'exercise',
        type: 'PERSONAL_RECORD',
        title: `${pr.exerciseName} ${pr.kindLabel}`,
        summary: `You logged a new ${pr.kindLabel} on ${pr.exerciseName}.`,
        payload: {
          workoutId: workout.id,
          exerciseId: pr.exerciseId,
          kind: pr.kind,
          value: pr.value,
        },
        tags: ['pr', pr.kind, pr.muscle],
      });
    }

    return this.toDto(workout);
  }

  async listPrs(userId: string) {
    await this.ensureReady(userId);
    const rows = await this.em.find(
      PersonalRecord,
      { user: userId },
      { orderBy: { occurredAt: 'DESC' }, populate: ['exercise', 'workout'] },
    );
    return rows.map((row) => ({
      id: row.id,
      exerciseId: row.exercise.id,
      exerciseName: row.exercise.name,
      kind: row.kind,
      value: row.value,
      unit: row.unit,
      workoutId: row.workout?.id ?? null,
      occurredAt: iso(row.occurredAt) ?? new Date().toISOString(),
    }));
  }

  private async appendSet(workout: Workout, input: CreateWorkoutSetDto) {
    const exercise = await this.em.findOne(Exercise, { id: input.exerciseId });
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
    if (!workout.sets.isInitialized()) {
      await workout.sets.init();
    }
    const siblings = workout.sets.getItems().filter((set) => set.exercise.id === exercise.id);
    const set = this.em.create(WorkoutSet, {
      workout,
      exercise,
      setIndex: input.setIndex ?? siblings.length + 1,
      reps: input.reps,
      weightKg: input.weightKg,
      rpe: input.rpe ?? null,
    });
    workout.sets.add(set);
  }

  private async loadWorkout(userId: string, id: string): Promise<Workout> {
    const workout = await this.em.findOne(
      Workout,
      { id, user: userId },
      { populate: ['sets', 'sets.exercise'] },
    );
    if (!workout) {
      throw new NotFoundException('Workout not found');
    }
    return workout;
  }

  private muscleMixFor(workout: Workout): MuscleMixItem[] {
    const contributions: Array<{ muscle: string; volumeKg: number }> = [];
    for (const set of workout.sets.getItems()) {
      const volume = setVolume(set.weightKg, set.reps);
      contributions.push({ muscle: set.exercise.primaryMuscle, volumeKg: volume });
      for (const muscle of set.exercise.secondaryMuscles) {
        contributions.push({ muscle, volumeKg: volume * SECONDARY_WEIGHT });
      }
    }
    return buildMuscleMix(contributions);
  }

  private async detectAndStorePrs(user: User, workout: Workout, occurredAt: Date) {
    const grouped = new Map<string, WorkoutSet[]>();
    for (const set of workout.sets.getItems()) {
      const list = grouped.get(set.exercise.id) ?? [];
      list.push(set);
      grouped.set(set.exercise.id, list);
    }

    const unlocked: Array<{
      exerciseId: string;
      exerciseName: string;
      muscle: string;
      kind: PersonalRecord['kind'];
      kindLabel: string;
      value: number;
    }> = [];

    for (const sets of grouped.values()) {
      const exercise = sets[0].exercise;
      const candidates: Array<{ kind: PersonalRecord['kind']; value: number; unit: string; label: string }> =
        [
          {
            kind: 'weight',
            value: Math.max(...sets.map((set) => set.weightKg)),
            unit: 'kg',
            label: 'max weight',
          },
          {
            kind: 'reps',
            value: Math.max(...sets.map((set) => set.reps)),
            unit: 'reps',
            label: 'max reps',
          },
          {
            kind: 'e1rm',
            value: Math.max(...sets.map((set) => estimated1Rm(set.weightKg, set.reps))),
            unit: 'kg',
            label: 'estimated 1RM',
          },
          {
            kind: 'volume',
            value: sets.reduce((sum, set) => sum + setVolume(set.weightKg, set.reps), 0),
            unit: 'kg',
            label: 'lift volume',
          },
        ];

      for (const candidate of candidates) {
        let record = await this.em.findOne(PersonalRecord, {
          user: user.id,
          exercise: exercise.id,
          kind: candidate.kind,
        });
        if (record && candidate.value <= record.value) {
          continue;
        }
        if (!record) {
          record = this.em.create(PersonalRecord, {
            user,
            exercise,
            kind: candidate.kind,
            value: candidate.value,
            unit: candidate.unit,
            workout,
            occurredAt,
          });
        } else {
          record.value = candidate.value;
          record.unit = candidate.unit;
          record.workout = workout;
          record.occurredAt = occurredAt;
        }
        unlocked.push({
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          muscle: exercise.primaryMuscle,
          kind: candidate.kind,
          kindLabel: candidate.label,
          value: candidate.value,
        });
      }
    }

    return unlocked;
  }

  private toDto(workout: Workout) {
    const sets = workout.sets.isInitialized()
      ? [...workout.sets.getItems()]
          .sort((a, b) => a.exercise.name.localeCompare(b.exercise.name) || a.setIndex - b.setIndex)
          .map((set) => ({
            id: set.id,
            exerciseId: set.exercise.id,
            exerciseName: set.exercise.name,
            exerciseSlug: set.exercise.slug,
            primaryMuscle: set.exercise.primaryMuscle,
            setIndex: set.setIndex,
            reps: set.reps,
            weightKg: set.weightKg,
            rpe: set.rpe,
            e1rmKg: estimated1Rm(set.weightKg, set.reps),
            volumeKg: setVolume(set.weightKg, set.reps),
          }))
      : [];
    const summary = workout.summary as Record<string, unknown> | null;
    return {
      id: workout.id,
      title: workout.title,
      status: workout.status,
      notes: workout.notes,
      startedAt: iso(workout.startedAt) ?? new Date().toISOString(),
      completedAt: iso(workout.completedAt),
      durationMin: workout.durationMin,
      volumeKg: workout.volumeKg,
      setCount: workout.setCount || sets.length,
      prCount: workout.prCount,
      summary: workout.status === 'completed' && summary
        ? {
            durationMin: Number(summary['durationMin'] ?? workout.durationMin ?? 0),
            setCount: Number(summary['setCount'] ?? workout.setCount),
            exerciseCount: Number(summary['exerciseCount'] ?? new Set(sets.map((set) => set.exerciseId)).size),
            volumeKg: Number(summary['volumeKg'] ?? workout.volumeKg),
            previousVolumeKg: (summary['previousVolumeKg'] as number | null) ?? null,
            volumeChangePct: (summary['volumeChangePct'] as number | null) ?? null,
            prCount: Number(summary['prCount'] ?? workout.prCount),
            xpEarned: Number(summary['xpEarned'] ?? WORKOUT_XP),
            muscleMix: (summary['muscleMix'] as MuscleMixItem[]) ?? [],
            bestE1rmKg: Number(summary['bestE1rmKg'] ?? 0),
            copy: String(summary['copy'] ?? workout.summaryCopy ?? ''),
          }
        : null,
      sets,
    };
  }

  private async ensureReady(userId: string) {
    await this.catalog.ensureSeeded();
    await this.ensureDemo(userId);
  }

  private async ensureDemo(userId: string) {
    const existing = await this.em.count(Workout, { user: userId });
    if (existing > 0) {
      return;
    }
    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      return;
    }

    const previous = await this.persistSession(user, {
      title: 'Back & Biceps',
      startedAt: new Date('2026-09-03T16:00:00.000Z'),
      completedAt: new Date('2026-09-03T16:46:00.000Z'),
      durationMin: 46,
      notes: 'Earlier equivalent session used for volume comparison.',
      plan: PREVIOUS_SESSION_SETS,
      complete: true,
    });

    for (const baseline of DEMO_PR_BASELINES) {
      const exercise = await this.em.findOne(Exercise, { slug: baseline.slug });
      if (!exercise) {
        continue;
      }
      const already = await this.em.findOne(PersonalRecord, {
        user,
        exercise,
        kind: baseline.kind,
      });
      if (already) {
        continue;
      }
      this.em.create(PersonalRecord, {
        user,
        exercise,
        kind: baseline.kind,
        value: baseline.value,
        unit: baseline.unit,
        workout: previous,
        occurredAt: previous.completedAt ?? previous.startedAt,
      });
    }
    await this.em.flush();

    const latest = await this.persistSession(user, {
      title: 'Back & Biceps',
      startedAt: new Date('2026-09-10T16:00:00.000Z'),
      completedAt: new Date('2026-09-10T16:48:00.000Z'),
      durationMin: 48,
      notes: null,
      plan: LAST_SESSION_SETS,
      complete: false,
    });

    await this.complete(user, latest.id, {
      completedAt: '2026-09-10T16:48:00.000Z',
      durationMin: 48,
    });
  }

  private async persistSession(
    user: User,
    input: {
      title: string;
      startedAt: Date;
      completedAt: Date;
      durationMin: number;
      notes: string | null;
      plan: Array<{ slug: string; sets: Array<[number, number]> }>;
      complete: boolean;
    },
  ) {
    const workout = this.em.create(Workout, {
      user,
      title: input.title,
      notes: input.notes,
      startedAt: input.startedAt,
      status: 'draft',
    });
    for (const lift of input.plan) {
      const exercise = await this.em.findOne(Exercise, { slug: lift.slug });
      if (!exercise) {
        continue;
      }
      lift.sets.forEach(([weightKg, reps], index) => {
        this.em.create(WorkoutSet, {
          workout,
          exercise,
          setIndex: index + 1,
          reps,
          weightKg,
        });
      });
    }
    await this.em.persist(workout).flush();
    await this.em.populate(workout, ['sets', 'sets.exercise']);

    if (!input.complete) {
      return workout;
    }

    const volumeKg = workout.sets
      .getItems()
      .reduce((sum, set) => sum + setVolume(set.weightKg, set.reps), 0);
    const muscleMix = this.muscleMixFor(workout);
    const copy = sessionCopy({
      title: workout.title,
      durationMin: input.durationMin,
      setCount: workout.sets.length,
      volumeKg,
      volumeChangePct: null,
      prCount: 0,
    });
    workout.status = 'completed';
    workout.completedAt = input.completedAt;
    workout.durationMin = input.durationMin;
    workout.volumeKg = volumeKg;
    workout.setCount = workout.sets.length;
    workout.prCount = 0;
    workout.summaryCopy = copy;
    workout.summary = {
      durationMin: input.durationMin,
      setCount: workout.sets.length,
      exerciseCount: new Set(workout.sets.getItems().map((set) => set.exercise.id)).size,
      volumeKg,
      previousVolumeKg: null,
      volumeChangePct: null,
      prCount: 0,
      xpEarned: WORKOUT_XP,
      muscleMix,
      bestE1rmKg: workout.sets
        .getItems()
        .reduce((best, set) => Math.max(best, estimated1Rm(set.weightKg, set.reps)), 0),
      copy,
    };
    workout.tags = [...new Set(muscleMix.map((item) => item.muscle))];
    await this.em.flush();
    return workout;
  }
}
