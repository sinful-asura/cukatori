import type { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../users/user.entity.js';
import { Budget } from './budget.entity.js';
import { FinanceCategory } from './finance-category.entity.js';
import { Transaction } from './transaction.entity.js';

const DEMO_MONTH = '2026-09';

type SeedTxn = {
  slug: string;
  merchant: string;
  cents: number;
  day: number;
  kind?: 'expense' | 'income';
};

const DEMO_TXNS: SeedTxn[] = [
  { slug: 'food', merchant: "McDonald's", cents: 1450, day: 3 },
  { slug: 'food', merchant: 'Konzum', cents: 6280, day: 5 },
  { slug: 'food', merchant: 'Lidl', cents: 4820, day: 8 },
  { slug: 'food', merchant: 'Restoran Dva Ribara', cents: 3800, day: 10 },
  { slug: 'food', merchant: 'Pekara Dubravica', cents: 1240, day: 12 },
  { slug: 'food', merchant: 'Pizza Express', cents: 2290, day: 14 },
  { slug: 'food', merchant: 'Cogito Coffee', cents: 850, day: 16 },
  { slug: 'food', merchant: 'Dolac market', cents: 3120, day: 18 },
  { slug: 'food', merchant: 'Dinner out', cents: 4500, day: 21 },
  { slug: 'food', merchant: 'Spar', cents: 13650, day: 24 },
  { slug: 'shopping', merchant: 'Zara', cents: 8900, day: 4 },
  { slug: 'shopping', merchant: 'IKEA', cents: 12400, day: 7 },
  { slug: 'shopping', merchant: 'Amazon', cents: 4750, day: 11 },
  { slug: 'shopping', merchant: 'DM', cents: 2890, day: 15 },
  { slug: 'shopping', merchant: 'H&M', cents: 5460, day: 19 },
  { slug: 'shopping', merchant: 'Knjižara', cents: 3600, day: 23 },
  { slug: 'transport', merchant: 'HŽ', cents: 1840, day: 2 },
  { slug: 'transport', merchant: 'INA', cents: 6200, day: 6 },
  { slug: 'transport', merchant: 'Uber', cents: 1420, day: 9 },
  { slug: 'transport', merchant: 'ZET monthly', cents: 4700, day: 1 },
  { slug: 'transport', merchant: 'Parking', cents: 1200, day: 13 },
  { slug: 'transport', merchant: 'INA', cents: 5640, day: 22 },
  { slug: 'health', merchant: 'Ljekarna', cents: 2480, day: 8 },
  { slug: 'health', merchant: 'Stomatolog', cents: 8000, day: 17 },
  { slug: 'housing', merchant: 'Rent', cents: 85000, day: 1 },
  { slug: 'housing', merchant: 'HEP', cents: 9640, day: 6 },
  { slug: 'entertainment', merchant: 'Netflix', cents: 1399, day: 2 },
  { slug: 'entertainment', merchant: 'Kino Europa', cents: 1600, day: 20 },
  { slug: 'other', merchant: 'Gym', cents: 3900, day: 1 },
  { slug: 'other', merchant: 'A1', cents: 2999, day: 5 },
  { slug: 'other', merchant: 'Gift', cents: 4500, day: 14 },
  { slug: 'other', merchant: 'Bank fee', cents: 250, day: 3 },
  { slug: 'other', merchant: 'Bauhaus', cents: 7832, day: 16 },
  { slug: 'other', merchant: 'Pet supplies', cents: 3500, day: 18 },
  { slug: 'other', merchant: 'Frizer', cents: 2200, day: 25 },
  { slug: 'other', merchant: 'Misc', cents: 8800, day: 27 },
  { slug: 'income', merchant: 'Salary', cents: 285000, day: 1, kind: 'income' },
  { slug: 'income', merchant: 'Freelance', cents: 42000, day: 15, kind: 'income' },
];

const DEMO_BUDGETS: { slug: string; limitCents: number }[] = [
  { slug: 'food', limitCents: 55000 },
  { slug: 'shopping', limitCents: 50000 },
  { slug: 'transport', limitCents: 25000 },
  { slug: 'health', limitCents: 15000 },
  { slug: 'housing', limitCents: 100000 },
  { slug: 'entertainment', limitCents: 8000 },
  { slug: 'other', limitCents: 40000 },
];

export async function seedTakeControlDemo(
  em: EntityManager,
  user: User,
  bySlug: Map<string, FinanceCategory>,
): Promise<void> {
  for (const row of DEMO_TXNS) {
    const category = bySlug.get(row.slug);
    if (!category) {
      continue;
    }
    em.create(Transaction, {
      user,
      category,
      amountCents: row.cents,
      merchant: row.merchant,
      occurredAt: new Date(Date.UTC(2026, 8, row.day, 12, 0, 0)),
      source: 'manual',
      kind: row.kind ?? 'expense',
    });
  }
  for (const row of DEMO_BUDGETS) {
    const category = bySlug.get(row.slug);
    if (!category) {
      continue;
    }
    em.create(Budget, {
      user,
      category,
      month: DEMO_MONTH,
      limitCents: row.limitCents,
    });
  }
  await em.flush();
}
