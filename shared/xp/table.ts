import type { ActivityType } from '../activity/types';

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
  PHOTO_UPLOADED: 0,
  DISCOMFORT_LOGGED: 0,
  DELOAD_DISMISSED: 0,
  ACHIEVEMENT_UNLOCKED: 30,
  LEVEL_UP: 0,
  STREAK_UPDATED: 0,
};

export function xpForLevel(level: number): number {
  return Math.round(100 * level * 1.15 ** (level - 1));
}

/** Alias used by the activity-xp skill (`xpFor(level)`). */
export const xpFor = xpForLevel;

/** Total XP consumed by levels `[1, level)`. */
export function totalXpBeforeLevel(level: number): number {
  let total = 0;
  for (let current = 1; current < level; current += 1) {
    total += xpForLevel(current);
  }
  return total;
}

/** Assist seeder target: Kristijan at this level, this far into the current bar. */
export const SEED_LEVEL = 18;
export const SEED_XP_INTO = 2840;

export function levelForXp(total: number): { level: number; into: number; next: number } {
  let level = 1;
  let consumed = 0;
  while (true) {
    const need = xpForLevel(level);
    if (consumed + need > total) {
      return { level, into: total - consumed, next: need };
    }
    consumed += need;
    level += 1;
  }
}

export interface StreakDto {
  kind: string;
  current: number;
  longest: number;
  lastActiveAt: string | null;
}

export interface MeStatsDto {
  level: number;
  xp: number;
  xpNext: number;
  totalXp: number;
  streaks: StreakDto[];
}

export interface AchievementDto {
  id: string;
  key: string;
  title: string;
  summary: string;
  unlockedAt: string | null;
}
