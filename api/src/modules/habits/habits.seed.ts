/** Keep in sync with `shared/habits/demo.ts`. Nest cannot import repo-root shared/. */
export const DEMO_HABIT_SEEDS = [
  { title: 'Gym time', schedule: 'daily', xpHint: 100, sortOrder: 0 },
  { title: 'Read 20 pages', schedule: 'daily', xpHint: 20, sortOrder: 1 },
  { title: "Log today's expenses", schedule: 'daily', xpHint: 10, sortOrder: 2 },
  { title: 'Drink 2L of water', schedule: 'daily', xpHint: 10, sortOrder: 3 },
] as const;
