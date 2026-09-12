import type { TransactionKind } from './finance.contracts.js';

export type DefaultCategory = {
  name: string;
  slug: string;
  color: string;
  kind: TransactionKind;
  sortOrder: number;
};

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  { name: 'Food', slug: 'food', color: '#4ea8de', kind: 'expense', sortOrder: 1 },
  { name: 'Shopping', slug: 'shopping', color: '#f4a261', kind: 'expense', sortOrder: 2 },
  { name: 'Transport', slug: 'transport', color: '#2ec4b6', kind: 'expense', sortOrder: 3 },
  { name: 'Health', slug: 'health', color: '#9b8afb', kind: 'expense', sortOrder: 4 },
  { name: 'Housing', slug: 'housing', color: '#e76f51', kind: 'expense', sortOrder: 5 },
  { name: 'Entertainment', slug: 'entertainment', color: '#7bdff2', kind: 'expense', sortOrder: 6 },
  { name: 'Other', slug: 'other', color: '#8b8b93', kind: 'expense', sortOrder: 7 },
  { name: 'Income', slug: 'income', color: '#6ee7b7', kind: 'income', sortOrder: 8 },
];
