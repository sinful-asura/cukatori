/** Keep in sync with `shared/xp`. Inlined so Nest rootDir stays `api/`. */

export { XP_AWARDS } from './activity.js';

export function xpForLevel(level: number): number {
  return Math.round(100 * level * 1.15 ** (level - 1));
}

export const xpFor = xpForLevel;

export function totalXpBeforeLevel(level: number): number {
  let total = 0;
  for (let current = 1; current < level; current += 1) {
    total += xpForLevel(current);
  }
  return total;
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

export const SEED_LEVEL = 18;
export const SEED_XP_INTO = 2840;

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
