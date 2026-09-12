export type MuscleSlug =
  | 'chest'
  | 'front-delts'
  | 'side-delts'
  | 'rear-delts'
  | 'lats'
  | 'traps'
  | 'upper-back'
  | 'lower-back'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'adductors'
  | 'abductors';

export type EquipmentSlug =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'band'
  | 'smith';

export type MovementPattern =
  | 'horizontal-push'
  | 'vertical-push'
  | 'horizontal-pull'
  | 'vertical-pull'
  | 'hinge'
  | 'squat'
  | 'lunge'
  | 'carry'
  | 'isolation'
  | 'rotation'
  | 'core';

export type ExerciseKind = 'compound' | 'isolation';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type WorkoutStatus = 'draft' | 'completed';
export type PersonalRecordKind = 'weight' | 'reps' | 'e1rm' | 'volume';

export const MUSCLE_LABELS: Record<MuscleSlug, string> = {
  chest: 'Chest',
  'front-delts': 'Front Delts',
  'side-delts': 'Side Delts',
  'rear-delts': 'Rear Delts',
  lats: 'Lats',
  traps: 'Traps',
  'upper-back': 'Upper Back',
  'lower-back': 'Lower Back',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  obliques: 'Obliques',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  adductors: 'Adductors',
  abductors: 'Abductors',
};

export interface ExerciseDto {
  id: string;
  name: string;
  slug: string;
  primaryMuscle: MuscleSlug;
  secondaryMuscles: MuscleSlug[];
  equipment: EquipmentSlug;
  pattern: MovementPattern;
  kind: ExerciseKind;
  difficulty: Difficulty;
  aliases: string[];
}

export interface WorkoutSetDto {
  id: string;
  exerciseId: string;
  exerciseName: string;
  exerciseSlug: string;
  primaryMuscle: MuscleSlug;
  setIndex: number;
  reps: number;
  weightKg: number;
  rpe: number | null;
  e1rmKg: number;
  volumeKg: number;
}

export interface MuscleMixItem {
  muscle: MuscleSlug;
  label: string;
  volumeKg: number;
  percent: number;
}

export interface WorkoutSummaryDto {
  durationMin: number;
  setCount: number;
  exerciseCount: number;
  volumeKg: number;
  previousVolumeKg: number | null;
  volumeChangePct: number | null;
  prCount: number;
  xpEarned: number;
  muscleMix: MuscleMixItem[];
  bestE1rmKg: number;
  copy: string;
}

export interface WorkoutDto {
  id: string;
  title: string;
  status: WorkoutStatus;
  notes: string | null;
  startedAt: string;
  completedAt: string | null;
  durationMin: number | null;
  volumeKg: number;
  setCount: number;
  prCount: number;
  summary: WorkoutSummaryDto | null;
  sets: WorkoutSetDto[];
}

export interface PersonalRecordDto {
  id: string;
  exerciseId: string | null;
  exerciseName: string | null;
  kind: PersonalRecordKind;
  value: number;
  unit: string;
  workoutId: string | null;
  occurredAt: string;
}

export interface CreateWorkoutRequest {
  title: string;
  notes?: string;
  startedAt?: string;
  sets?: CreateWorkoutSetRequest[];
}

export interface CreateWorkoutSetRequest {
  exerciseId: string;
  setIndex?: number;
  reps: number;
  weightKg: number;
  rpe?: number;
}

export interface CompleteWorkoutRequest {
  completedAt?: string;
  durationMin?: number;
}

export interface WorkoutListQuery {
  status?: WorkoutStatus;
}

export interface ExerciseListQuery {
  muscle?: string;
  q?: string;
}
