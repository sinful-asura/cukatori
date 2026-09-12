export type QuickLogKind =
  | 'workout_set'
  | 'workout_complete'
  | 'expense'
  | 'media_complete'
  | 'media_progress'
  | 'habit'
  | 'journal'
  | 'unknown';

export type MediaVerb = 'watching' | 'reading';

export interface WorkoutSet {
  weightKg: number;
  reps: number;
}

export interface WorkoutSetIntent {
  kind: 'workout_set';
  exercise: string;
  sets: WorkoutSet[];
}

export interface WorkoutCompleteIntent {
  kind: 'workout_complete';
}

export interface ExpenseIntent {
  kind: 'expense';
  amount: number;
  currency: 'EUR';
  merchant?: string;
}

export interface MediaCompleteIntent {
  kind: 'media_complete';
  title: string;
  verb: MediaVerb;
}

export interface MediaProgressIntent {
  kind: 'media_progress';
  pages?: number;
  title?: string;
}

export interface HabitIntent {
  kind: 'habit';
  title: string;
}

export interface JournalIntent {
  kind: 'journal';
  title?: string;
}

export interface UnknownIntent {
  kind: 'unknown';
  text: string;
}

export type ParsedQuickLog =
  | WorkoutSetIntent
  | WorkoutCompleteIntent
  | ExpenseIntent
  | MediaCompleteIntent
  | MediaProgressIntent
  | HabitIntent
  | JournalIntent
  | UnknownIntent;

export type CelebrationKind =
  | 'personal_record'
  | 'first_workout'
  | 'tenth_workout'
  | 'streak_7'
  | 'level_up';

export interface CelebrationHint {
  kind: CelebrationKind;
  title: string;
  detail: string;
}
