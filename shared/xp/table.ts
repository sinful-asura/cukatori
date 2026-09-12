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
  ACHIEVEMENT_UNLOCKED: 30,
  LEVEL_UP: 0,
  STREAK_UPDATED: 0,
};

export function xpForLevel(level: number): number {
  return Math.round(100 * level * 1.15 ** (level - 1));
}

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
