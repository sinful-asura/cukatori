/** Keep in sync with shared/xp/table.ts. Nest cannot import repo-root shared/. */

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
