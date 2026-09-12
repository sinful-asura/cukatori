import { formatGoalAmount, formatGoalProgress, type GoalDto } from '@ascend-os/shared/goals';

export const GOAL_MONTHS = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

export type GoalMilestone = { label: string; done: boolean };

export type GoalView = GoalDto & {
  category: string;
  color: string;
  note: string;
  series: number[];
  milestones: GoalMilestone[];
  remainingLabel: string;
  deadlineLabel: string;
  progressLabel: string;
};

const KIND_META: Record<GoalDto['kind'], { category: string; color: string }> = {
  count: { category: 'Reading', color: '#0091ff' },
  currency: { category: 'Finance', color: '#34d56b' },
  frequency: { category: 'Training', color: '#eab308' },
};

const TITLE_META: Record<string, { category: string; color: string; note: string }> = {
  'Read 12 books': {
    category: 'Reading',
    color: '#0091ff',
    note: 'Dune is the current title — 240 of 688 pages.',
  },
  'Save €2,000': {
    category: 'Finance',
    color: '#34d56b',
    note: 'Dining is the leak — 22% above last week.',
  },
  'Workout 3× per week': {
    category: 'Training',
    color: '#eab308',
    note: 'Two sessions logged this stretch. One still open.',
  },
};

export function toGoalView(goal: GoalDto): GoalView {
  const titled = TITLE_META[goal.title];
  const kind = KIND_META[goal.kind];
  const remaining = Math.max(0, goal.target - goal.current);
  return {
    ...goal,
    category: titled?.category ?? kind.category,
    color: titled?.color ?? kind.color,
    note: titled?.note ?? 'Log progress to move this forward.',
    series: seriesFor(goal),
    milestones: milestonesFor(goal),
    remainingLabel: `${formatGoalAmount(remaining, goal)} left`,
    deadlineLabel: formatDeadline(goal.deadline),
    progressLabel: formatGoalProgress(goal),
  };
}

export function chartYLabels(goal: Pick<GoalDto, 'kind' | 'unit' | 'target'>): string[] {
  return [formatGoalAmount(goal.target, goal), formatGoalAmount(Math.round(goal.target / 2), goal), '0'];
}

export function formatDeadline(deadline: string | null): string {
  if (!deadline) {
    return 'No date';
  }
  const date = new Date(`${deadline.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return deadline;
  }
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

export function isOnPace(goal: Pick<GoalDto, 'status' | 'percent' | 'deadline'>, now = Date.now()): boolean {
  if (goal.status === 'completed') {
    return true;
  }
  if (!goal.deadline) {
    return goal.percent >= 50;
  }
  const end = Date.parse(`${goal.deadline.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(end)) {
    return goal.percent >= 50;
  }
  const year = new Date(end).getFullYear();
  const start = Date.parse(`${year}-01-01T00:00:00`);
  const span = end - start;
  if (span <= 0) {
    return goal.percent >= 50;
  }
  const expected = Math.min(100, ((now - start) / span) * 100);
  return goal.percent + 5 >= expected;
}

function seriesFor(goal: GoalDto): number[] {
  const n = GOAL_MONTHS.length;
  if (goal.current <= 0) {
    return Array.from({ length: n }, () => 0);
  }
  return Array.from({ length: n }, (_, i) => Math.round((goal.current * (i + 1)) / n));
}

function milestonesFor(goal: GoalDto): GoalMilestone[] {
  if (goal.title === 'Read 12 books') {
    return [
      { label: 'First 4 books', done: goal.current >= 4 },
      { label: 'Halfway · 6 books', done: goal.current >= 6 },
      { label: 'Finish Dune', done: goal.status === 'completed' },
      { label: 'Hit 12 by December', done: goal.current >= 12 },
    ];
  }
  if (goal.title === 'Save €2,000') {
    return [
      { label: 'Open the pot', done: goal.current > 0 },
      { label: '€1,000 parked', done: goal.current >= 1000 },
      { label: '€2,000 target', done: goal.current >= 2000 },
    ];
  }
  if (goal.title === 'Workout 3× per week') {
    return [
      { label: 'First 4 sessions', done: goal.current >= 4 },
      { label: 'Eight sessions', done: goal.current >= 8 },
      { label: 'Ten sessions this stretch', done: goal.current >= 10 },
    ];
  }
  const mid = Math.max(1, Math.round(goal.target / 2));
  return [
    { label: 'Started', done: goal.current > 0 },
    { label: 'Halfway', done: goal.current >= mid },
    { label: 'Target', done: goal.current >= goal.target },
  ];
}
