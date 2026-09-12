export type ActivityCategory =
  | 'exercise'
  | 'finance'
  | 'entertainment'
  | 'habit'
  | 'goal'
  | 'journal'
  | 'system';

export type ActivityType =
  | 'WORKOUT_COMPLETED'
  | 'PERSONAL_RECORD'
  | 'HABIT_COMPLETED'
  | 'GOAL_PROGRESSED'
  | 'GOAL_COMPLETED'
  | 'EXPENSE_CREATED'
  | 'INCOME_CREATED'
  | 'MEDIA_PROGRESS'
  | 'MEDIA_COMPLETED'
  | 'JOURNAL_CREATED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'LEVEL_UP'
  | 'STREAK_UPDATED';

export interface ActivityEventDto {
  id: string;
  category: ActivityCategory;
  type: ActivityType;
  occurredAt: string;
  title: string;
  summary: string;
  xpAwarded: number;
  payload: Record<string, unknown>;
  tags: string[];
}

export interface ActivityEmitInput {
  category: ActivityCategory;
  type: ActivityType;
  title: string;
  summary: string;
  payload?: Record<string, unknown>;
  tags?: string[];
  occurredAt?: string;
  xp?: number;
}

export interface ActivityQuery {
  category?: ActivityCategory;
  type?: ActivityType;
  from?: string;
  to?: string;
  tag?: string;
}
