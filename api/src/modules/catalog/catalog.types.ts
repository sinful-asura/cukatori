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
