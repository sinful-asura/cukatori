import type { ExerciseDto, PersonalRecordDto, WorkoutDto } from '@ascend-os/shared/exercise';

/** Shown when the API module is not wired yet so the Train smarter card still matches the mockup. */
export const FALLBACK_LAST_SESSION: WorkoutDto = {
  id: 'fallback-back-biceps',
  title: 'Back & Biceps',
  status: 'completed',
  notes: null,
  startedAt: '2026-09-10T16:00:00.000Z',
  completedAt: '2026-09-10T16:48:00.000Z',
  durationMin: 48,
  volumeKg: 6420,
  setCount: 14,
  prCount: 3,
  summary: {
    durationMin: 48,
    setCount: 14,
    exerciseCount: 6,
    volumeKg: 6420,
    previousVolumeKg: 5944,
    volumeChangePct: 8,
    prCount: 3,
    xpEarned: 300,
    bestE1rmKg: 106.7,
    copy: 'Back & Biceps — 48 min, 14 sets, 6,420 kg total volume, possible +8% vs last equivalent session, 3 personal records logged.',
    muscleMix: [
      { muscle: 'upper-back', label: 'Upper Back', volumeKg: 3360, percent: 36 },
      { muscle: 'lats', label: 'Lats', volumeKg: 2716, percent: 29 },
      { muscle: 'biceps', label: 'Biceps', volumeKg: 2239, percent: 24 },
      { muscle: 'rear-delts', label: 'Rear Delts', volumeKg: 660, percent: 7 },
    ],
  },
  sets: [
    row('Lat Pulldown', 'lat-pulldown', 'lats', 1, 70, 8),
    row('Lat Pulldown', 'lat-pulldown', 'lats', 2, 70, 8),
    row('Lat Pulldown', 'lat-pulldown', 'lats', 3, 70, 6),
    row('Barbell Row', 'barbell-row', 'upper-back', 1, 80, 10),
    row('Barbell Row', 'barbell-row', 'upper-back', 2, 80, 10),
    row('Barbell Row', 'barbell-row', 'upper-back', 3, 80, 10),
    row('Seated Cable Row', 'seated-cable-row', 'upper-back', 1, 60, 8),
    row('Seated Cable Row', 'seated-cable-row', 'upper-back', 2, 60, 8),
    row('Face Pull', 'face-pull', 'rear-delts', 1, 22, 15),
    row('Face Pull', 'face-pull', 'rear-delts', 2, 22, 15),
    row('Barbell Curl', 'barbell-curl', 'biceps', 1, 30, 10),
    row('Barbell Curl', 'barbell-curl', 'biceps', 2, 30, 8),
    row('Hammer Curl', 'hammer-curl', 'biceps', 1, 16, 10),
    row('Hammer Curl', 'hammer-curl', 'biceps', 2, 16, 10),
  ],
};

export const FALLBACK_PREVIOUS_SESSION: WorkoutDto = {
  ...FALLBACK_LAST_SESSION,
  id: 'fallback-back-biceps-prev',
  startedAt: '2026-09-03T16:00:00.000Z',
  completedAt: '2026-09-03T16:46:00.000Z',
  durationMin: 46,
  volumeKg: 5944,
  prCount: 0,
  summary: {
    ...FALLBACK_LAST_SESSION.summary!,
    durationMin: 46,
    volumeKg: 5944,
    previousVolumeKg: null,
    volumeChangePct: null,
    prCount: 0,
    xpEarned: 180,
    copy: 'Back & Biceps — 46 min, 14 sets, 5,944 kg total volume, no prior equivalent session to compare, no new personal records logged.',
  },
};

export const FALLBACK_PRS: PersonalRecordDto[] = [
  {
    id: 'pr-row-weight',
    exerciseId: 'barbell-row',
    exerciseName: 'Barbell Row',
    kind: 'weight',
    value: 80,
    unit: 'kg',
    workoutId: FALLBACK_LAST_SESSION.id,
    occurredAt: FALLBACK_LAST_SESSION.completedAt!,
  },
  {
    id: 'pr-lat-e1rm',
    exerciseId: 'lat-pulldown',
    exerciseName: 'Lat Pulldown',
    kind: 'e1rm',
    value: 88.7,
    unit: 'kg',
    workoutId: FALLBACK_LAST_SESSION.id,
    occurredAt: FALLBACK_LAST_SESSION.completedAt!,
  },
  {
    id: 'pr-curl-volume',
    exerciseId: 'barbell-curl',
    exerciseName: 'Barbell Curl',
    kind: 'volume',
    value: 540,
    unit: 'kg',
    workoutId: FALLBACK_LAST_SESSION.id,
    occurredAt: FALLBACK_LAST_SESSION.completedAt!,
  },
];

export const FALLBACK_CATALOG: ExerciseDto[] = [
  catalog('Lat Pulldown', 'lat-pulldown', 'lats', 'cable', 'vertical-pull'),
  catalog('Barbell Row', 'barbell-row', 'upper-back', 'barbell', 'horizontal-pull'),
  catalog('Seated Cable Row', 'seated-cable-row', 'upper-back', 'cable', 'horizontal-pull'),
  catalog('Face Pull', 'face-pull', 'rear-delts', 'cable', 'horizontal-pull'),
  catalog('Barbell Curl', 'barbell-curl', 'biceps', 'barbell', 'isolation'),
  catalog('Hammer Curl', 'hammer-curl', 'biceps', 'dumbbell', 'isolation'),
  catalog('Barbell Bench Press', 'barbell-bench-press', 'chest', 'barbell', 'horizontal-push'),
  catalog('Back Squat', 'back-squat', 'quads', 'barbell', 'squat'),
];

function row(
  name: string,
  slug: string,
  muscle: WorkoutDto['sets'][number]['primaryMuscle'],
  setIndex: number,
  weightKg: number,
  reps: number,
): WorkoutDto['sets'][number] {
  return {
    id: `${slug}-${setIndex}`,
    exerciseId: slug,
    exerciseName: name,
    exerciseSlug: slug,
    primaryMuscle: muscle,
    setIndex,
    reps,
    weightKg,
    rpe: null,
    e1rmKg: Math.round(weightKg * (1 + reps / 30) * 10) / 10,
    volumeKg: weightKg * reps,
  };
}

function catalog(
  name: string,
  slug: string,
  primary: ExerciseDto['primaryMuscle'],
  equipment: ExerciseDto['equipment'],
  pattern: ExerciseDto['pattern'],
): ExerciseDto {
  return {
    id: slug,
    name,
    slug,
    primaryMuscle: primary,
    secondaryMuscles: [],
    equipment,
    pattern,
    kind: pattern === 'isolation' ? 'isolation' : 'compound',
    difficulty: 'beginner',
    aliases: [],
  };
}
