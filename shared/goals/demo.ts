import { goalPercent } from './format';
import type { GoalDto } from './types';

/** Landing Goals meters: 8/12 books (67%), €960/€2,000 (48%), 8/10 sessions (80%). */
export const DEMO_GOALS: GoalDto[] = [
  {
    id: 'goal-books',
    title: 'Read 12 books',
    kind: 'count',
    target: 12,
    current: 8,
    unit: 'books',
    deadline: '2026-12-31',
    status: 'active',
    percent: goalPercent(8, 12),
    sortOrder: 0,
  },
  {
    id: 'goal-save',
    title: 'Save €2,000',
    kind: 'currency',
    target: 2000,
    current: 960,
    unit: 'EUR',
    deadline: '2026-12-31',
    status: 'active',
    percent: goalPercent(960, 2000),
    sortOrder: 1,
  },
  {
    id: 'goal-workout',
    title: 'Workout 3× per week',
    kind: 'frequency',
    target: 10,
    current: 8,
    unit: 'sessions',
    deadline: '2026-12-31',
    status: 'active',
    percent: goalPercent(8, 10),
    sortOrder: 2,
  },
];
