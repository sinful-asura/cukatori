/** Keep in sync with `shared/activity` and `shared/xp`. Inlined so Nest rootDir stays `api/`. */

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

export const XP_AWARDS: Record<ActivityType, number> = {
  WORKOUT_COMPLETED: 180,
  PERSONAL_RECORD: 40,
  HABIT_COMPLETED: 25,
  GOAL_PROGRESSED: 10,
  GOAL_COMPLETED: 60,
  EXPENSE_CREATED: 10,
  INCOME_CREATED: 10,
  MEDIA_PROGRESS: 20,
  MEDIA_COMPLETED: 50,
  JOURNAL_CREATED: 15,
  ACHIEVEMENT_UNLOCKED: 30,
  LEVEL_UP: 0,
  STREAK_UPDATED: 0,
};
