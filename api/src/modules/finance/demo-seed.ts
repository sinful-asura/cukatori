import type { EntityManager } from '@mikro-orm/postgresql';
import { User } from '../users/user.entity.js';
import { Budget } from './budget.entity.js';
import { FinanceCategory } from './finance-category.entity.js';
import { Transaction } from './transaction.entity.js';

const DEMO_MONTH = '2026-09';
const PRIOR_MONTH = '2026-08';

type SeedTxn = {
  slug: string;
  merchant: string;
  cents: number;
  month: '2026-08' | '2026-09';
  day: number;
  hour?: number;
  kind?: 'expense' | 'income';
};

/** Personal OS September mix (€2,431) plus August (€2,096) so the KPI reads ↑ 16%. */
const DEMO_TXNS: SeedTxn[] = [
  { slug: 'food', merchant: "McDonald's", cents: 1450, month: DEMO_MONTH, day: 11 },
  { slug: 'food', merchant: 'Merkur', cents: 3220, month: DEMO_MONTH, day: 10, hour: 18 },
  { slug: 'food', merchant: 'Konzum', cents: 1450, month: DEMO_MONTH, day: 8 },
  { slug: 'food', merchant: 'Lidl', cents: 8000, month: DEMO_MONTH, day: 5 },
  { slug: 'food', merchant: 'Spar', cents: 12000, month: DEMO_MONTH, day: 4 },
  { slug: 'food', merchant: 'Dinner out', cents: 8000, month: DEMO_MONTH, day: 3 },
  { slug: 'food', merchant: 'Dolac market', cents: 7880, month: DEMO_MONTH, day: 2 },
  { slug: 'transport', merchant: 'NIS', cents: 6000, month: DEMO_MONTH, day: 10, hour: 12 },
  { slug: 'transport', merchant: 'ZET monthly', cents: 4700, month: DEMO_MONTH, day: 1 },
  { slug: 'transport', merchant: 'INA', cents: 6200, month: DEMO_MONTH, day: 6 },
  { slug: 'transport', merchant: 'HŽ', cents: 1840, month: DEMO_MONTH, day: 2 },
  { slug: 'transport', merchant: 'Uber', cents: 1420, month: DEMO_MONTH, day: 4 },
  { slug: 'transport', merchant: 'Parking', cents: 840, month: DEMO_MONTH, day: 3 },
  { slug: 'entertainment', merchant: 'Steam', cents: 2499, month: DEMO_MONTH, day: 9 },
  { slug: 'entertainment', merchant: 'Spotify', cents: 999, month: DEMO_MONTH, day: 7 },
  { slug: 'entertainment', merchant: 'Netflix', cents: 1399, month: DEMO_MONTH, day: 2 },
  { slug: 'entertainment', merchant: 'Kino Europa', cents: 3603, month: DEMO_MONTH, day: 5 },
  { slug: 'entertainment', merchant: 'Concert', cents: 6000, month: DEMO_MONTH, day: 4 },
  { slug: 'shopping', merchant: 'Zara', cents: 6400, month: DEMO_MONTH, day: 5 },
  { slug: 'shopping', merchant: 'IKEA', cents: 12400, month: DEMO_MONTH, day: 3 },
  { slug: 'shopping', merchant: 'Amazon', cents: 4750, month: DEMO_MONTH, day: 4 },
  { slug: 'shopping', merchant: 'H&M', cents: 5460, month: DEMO_MONTH, day: 2 },
  { slug: 'shopping', merchant: 'DM', cents: 2890, month: DEMO_MONTH, day: 6 },
  { slug: 'shopping', merchant: 'Knjižara', cents: 6100, month: DEMO_MONTH, day: 1 },
  { slug: 'bills', merchant: 'Rent', cents: 45000, month: DEMO_MONTH, day: 1 },
  { slug: 'bills', merchant: 'HEP', cents: 8400, month: DEMO_MONTH, day: 6 },
  { slug: 'bills', merchant: 'A1', cents: 5000, month: DEMO_MONTH, day: 5 },
  { slug: 'health', merchant: 'Ljekarna', cents: 4500, month: DEMO_MONTH, day: 8 },
  { slug: 'health', merchant: 'Stomatolog', cents: 15000, month: DEMO_MONTH, day: 5 },
  { slug: 'other', merchant: 'Gym', cents: 3900, month: DEMO_MONTH, day: 1 },
  { slug: 'other', merchant: 'Gift', cents: 8000, month: DEMO_MONTH, day: 4 },
  { slug: 'other', merchant: 'Bauhaus', cents: 12000, month: DEMO_MONTH, day: 3 },
  { slug: 'other', merchant: 'Pet supplies', cents: 5000, month: DEMO_MONTH, day: 6 },
  { slug: 'other', merchant: 'Frizer', cents: 2200, month: DEMO_MONTH, day: 2 },
  { slug: 'other', merchant: 'Bank fee', cents: 250, month: DEMO_MONTH, day: 1 },
  { slug: 'other', merchant: 'Misc', cents: 18350, month: DEMO_MONTH, day: 5 },
  { slug: 'income', merchant: 'Salary', cents: 210000, month: DEMO_MONTH, day: 1, kind: 'income' },
  { slug: 'food', merchant: 'August groceries', cents: 36200, month: PRIOR_MONTH, day: 15 },
  { slug: 'transport', merchant: 'August transit', cents: 18100, month: PRIOR_MONTH, day: 15 },
  { slug: 'shopping', merchant: 'August shopping', cents: 32800, month: PRIOR_MONTH, day: 15 },
  { slug: 'entertainment', merchant: 'August media', cents: 12500, month: PRIOR_MONTH, day: 15 },
  { slug: 'bills', merchant: 'August bills', cents: 50400, month: PRIOR_MONTH, day: 15 },
  { slug: 'health', merchant: 'August health', cents: 16800, month: PRIOR_MONTH, day: 15 },
  { slug: 'other', merchant: 'August other', cents: 42800, month: PRIOR_MONTH, day: 15 },
];

const DEMO_BUDGETS: { slug: string; limitCents: number }[] = [
  { slug: 'food', limitCents: 60000 },
  { slug: 'entertainment', limitCents: 20000 },
  { slug: 'shopping', limitCents: 40000 },
  { slug: 'transport', limitCents: 25000 },
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
    const monthIndex = row.month === PRIOR_MONTH ? 7 : 8;
    em.create(Transaction, {
      user,
      category,
      amountCents: row.cents,
      merchant: row.merchant,
      occurredAt: new Date(Date.UTC(2026, monthIndex, row.day, row.hour ?? 12, 0, 0)),
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

export async function replaceTakeControlDemo(
  em: EntityManager,
  user: User,
  bySlug: Map<string, FinanceCategory>,
): Promise<void> {
  const txns = await em.find(Transaction, { user });
  const budgets = await em.find(Budget, { user });
  for (const row of txns) {
    em.remove(row);
  }
  for (const row of budgets) {
    em.remove(row);
  }
  await em.flush();
  await seedTakeControlDemo(em, user, bySlug);
}
