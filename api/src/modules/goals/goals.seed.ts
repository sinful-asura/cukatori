/** Keep in sync with `shared/goals/demo.ts`. Nest cannot import repo-root shared/. */
export const DEMO_GOAL_SEEDS = [
  {
    title: 'Read 12 books',
    kind: 'count',
    target: 12,
    current: 8,
    unit: 'books',
    deadline: '2026-12-31',
    sortOrder: 0,
  },
  {
    title: 'Save €2,000',
    kind: 'currency',
    target: 2000,
    current: 960,
    unit: 'EUR',
    deadline: '2026-12-31',
    sortOrder: 1,
  },
  {
    title: 'Workout 3× per week',
    kind: 'frequency',
    target: 10,
    current: 8,
    unit: 'sessions',
    deadline: '2026-12-31',
    sortOrder: 2,
  },
] as const;
