import type { GoalDto } from './types';

export function goalPercent(current: number, target: number): number {
  if (!target || target <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((current / target) * 100));
}

export function formatGoalAmount(value: number, goal: Pick<GoalDto, 'kind' | 'unit'>): string {
  if (goal.kind === 'currency' || goal.unit === 'EUR') {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(value);
}

export function formatGoalProgress(goal: Pick<GoalDto, 'kind' | 'unit' | 'current' | 'target'>): string {
  if (goal.kind === 'currency' || goal.unit === 'EUR') {
    return `${formatGoalAmount(goal.current, goal)} / ${formatGoalAmount(goal.target, goal)}`;
  }
  return `${formatGoalAmount(goal.current, goal)}/${formatGoalAmount(goal.target, goal)}`;
}
