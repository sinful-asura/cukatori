import type { TransactionKind } from './finance.contracts.js';

export type DefaultCategory = {
  name: string;
  slug: string;
  color: string;
  kind: TransactionKind;
  sortOrder: number;
};

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Food', slug: 'food', color: '#8b5cf6', kind: 'expense', sortOrder: 1 },
  { name: 'Shopping', slug: 'shopping', color: '#3b82f6', kind: 'expense', sortOrder: 2 },
  { name: 'Transport', slug: 'transport', color: '#38bdf8', kind: 'expense', sortOrder: 3 },
  { name: 'Health', slug: 'health', color: '#60a5fa', kind: 'expense', sortOrder: 4 },
  { name: 'Housing', slug: 'housing', color: '#f43f5e', kind: 'expense', sortOrder: 5 },
  { name: 'Entertainment', slug: 'entertainment', color: '#22d3ee', kind: 'expense', sortOrder: 6 },
  { name: 'Other', slug: 'other', color: '#6b7280', kind: 'expense', sortOrder: 7 },
  { name: 'Income', slug: 'income', color: '#34d56b', kind: 'income', sortOrder: 8 },
];
