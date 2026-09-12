import { EntityManager } from '@mikro-orm/postgresql';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ActivityBus } from '../activity/activity.bus.js';
import { User } from '../users/user.entity.js';
import { Budget } from './budget.entity.js';
import { DEFAULT_CATEGORIES } from './default-categories.js';
import { seedTakeControlDemo } from './demo-seed.js';
import type {
  BudgetDto,
  FinanceCategoryDto,
  FinanceOverviewDto,
  TransactionDto,
  TransactionKind,
  TransactionSource,
} from './finance.contracts.js';
import type { CreateBudgetDto, CreateTransactionDto, UpdateBudgetDto, UpdateTransactionDto } from './finance.dto.js';
import { FinanceCategory } from './finance-category.entity.js';
import { toBudgetDto, toCategoryDto, toTransactionDto } from './finance.mapper.js';
import { centsToEuros, eurosToCents, monthBounds, monthKey } from './money.js';
import { Transaction } from './transaction.entity.js';

const KPI_SLUGS = ['food', 'shopping', 'transport'] as const;

@Injectable()
export class FinanceService {
  constructor(
    private readonly em: EntityManager,
    private readonly activity: ActivityBus,
  ) {}

  async listCategories(user: User): Promise<FinanceCategoryDto[]> {
    const categories = await this.ensureReady(user);
    return categories.map(toCategoryDto);
  }

  async overview(user: User, month = monthKey(new Date())): Promise<FinanceOverviewDto> {
    await this.ensureReady(user);
    const { start, end } = monthBounds(month);
    const txns = await this.em.find(
      Transaction,
      { user, occurredAt: { $gte: start, $lt: end } },
      { populate: ['category'], orderBy: { occurredAt: 'DESC' } },
    );
    const expenses = txns.filter((txn) => txn.kind === 'expense');
    const income = txns.filter((txn) => txn.kind === 'income');
    const totalSpentCents = expenses.reduce((sum, txn) => sum + txn.amountCents, 0);
    const totalIncomeCents = income.reduce((sum, txn) => sum + txn.amountCents, 0);

    const grouped = new Map<string, { category: FinanceCategory; cents: number }>();
    for (const txn of expenses) {
      const current = grouped.get(txn.category.id);
      if (current) {
        current.cents += txn.amountCents;
      } else {
        grouped.set(txn.category.id, { category: txn.category, cents: txn.amountCents });
      }
    }

    const byCategory = [...grouped.values()]
      .sort((a, b) => b.cents - a.cents)
      .map((row) => ({
        category: toCategoryDto(row.category),
        amount: centsToEuros(row.cents),
        percent: totalSpentCents === 0 ? 0 : Math.round((row.cents / totalSpentCents) * 1000) / 10,
      }));

    const spentBySlug = new Map<string, number>();
    for (const row of grouped.values()) {
      spentBySlug.set(row.category.slug, row.cents);
    }

    const kpis = [
      { key: 'spent', label: 'Spent', amount: centsToEuros(totalSpentCents) },
      ...KPI_SLUGS.map((slug) => ({
        key: slug,
        label: slug.charAt(0).toUpperCase() + slug.slice(1),
        amount: centsToEuros(spentBySlug.get(slug) ?? 0),
      })),
    ];

    return {
      month,
      currency: 'EUR',
      totalSpent: centsToEuros(totalSpentCents),
      totalIncome: centsToEuros(totalIncomeCents),
      kpis,
      byCategory,
      recent: expenses.slice(0, 8).map((txn) => toTransactionDto(txn)),
      budgets: await this.listBudgets(user, month, false),
    };
  }

  async listTransactions(
    user: User,
    query: { month?: string; categoryId?: string; source?: string },
  ): Promise<TransactionDto[]> {
    await this.ensureReady(user);
    const where: Record<string, unknown> = { user };
    if (query.month) {
      const { start, end } = monthBounds(query.month);
      where.occurredAt = { $gte: start, $lt: end };
    }
    if (query.categoryId) {
      where.category = query.categoryId;
    }
    if (query.source) {
      where.source = query.source;
    }
    const rows = await this.em.find(Transaction, where, {
      populate: ['category'],
      orderBy: { occurredAt: 'DESC' },
    });
    return rows.map((txn) => toTransactionDto(txn));
  }

  async createTransaction(
    user: User,
    dto: CreateTransactionDto,
    options?: { emit?: boolean },
  ): Promise<TransactionDto> {
    await this.ensureReady(user);
    const category = await this.requireCategory(user, dto.categoryId);
    const kind = (dto.kind ?? category.kind ?? 'expense') as TransactionKind;
    const source = (dto.source ?? 'manual') as TransactionSource;
    const txn = this.em.create(Transaction, {
      user,
      category,
      amountCents: eurosToCents(dto.amount),
      merchant: dto.merchant.trim(),
      occurredAt: new Date(dto.occurredAt),
      source,
      kind,
      note: dto.note?.trim() || null,
    });
    await this.em.persist(txn).flush();

    const overshoot = kind === 'expense' ? await this.budgetOvershoot(user, category, txn.occurredAt) : null;
    const extras = overshoot
      ? { budgetOvershoot: true as const, overBy: centsToEuros(overshoot.overByCents) }
      : undefined;

    if (options?.emit !== false) {
      await this.emitCreated(user.id, txn, extras);
    }
    return toTransactionDto(txn, extras);
  }

  async updateTransaction(user: User, id: string, dto: UpdateTransactionDto): Promise<TransactionDto> {
    const txn = await this.requireTransaction(user, id);
    if (dto.categoryId) {
      txn.category = await this.requireCategory(user, dto.categoryId);
    }
    if (dto.amount !== undefined) {
      txn.amountCents = eurosToCents(dto.amount);
    }
    if (dto.merchant !== undefined) {
      txn.merchant = dto.merchant.trim();
    }
    if (dto.occurredAt !== undefined) {
      txn.occurredAt = new Date(dto.occurredAt);
    }
    if (dto.kind !== undefined) {
      txn.kind = dto.kind;
    }
    if (dto.note !== undefined) {
      txn.note = dto.note?.trim() || null;
    }
    await this.em.flush();
    await this.em.populate(txn, ['category']);
    return toTransactionDto(txn);
  }

  async deleteTransaction(user: User, id: string): Promise<{ ok: true }> {
    const txn = await this.requireTransaction(user, id);
    this.em.remove(txn);
    await this.em.flush();
    return { ok: true };
  }

  async listBudgets(user: User, month?: string, ensure = true): Promise<BudgetDto[]> {
    if (ensure) {
      await this.ensureReady(user);
    }
    const where: Record<string, unknown> = { user };
    if (month) {
      where.month = month;
    }
    const budgets = await this.em.find(Budget, where, {
      populate: ['category'],
      orderBy: { month: 'DESC' },
    });
    const result: BudgetDto[] = [];
    for (const budget of budgets) {
      const spent = await this.spentCents(user, budget.category, budget.month);
      result.push(toBudgetDto(budget, spent));
    }
    return result;
  }

  async createBudget(user: User, dto: CreateBudgetDto): Promise<BudgetDto> {
    await this.ensureReady(user);
    const category = await this.requireCategory(user, dto.categoryId);
    const existing = await this.em.findOne(Budget, { user, category, month: dto.month });
    if (existing) {
      throw new ConflictException('A budget for that category and month already exists');
    }
    const budget = this.em.create(Budget, {
      user,
      category,
      month: dto.month,
      limitCents: eurosToCents(dto.limit),
    });
    await this.em.persist(budget).flush();
    const spent = await this.spentCents(user, category, dto.month);
    return toBudgetDto(budget, spent);
  }

  async updateBudget(user: User, id: string, dto: UpdateBudgetDto): Promise<BudgetDto> {
    const budget = await this.requireBudget(user, id);
    if (dto.categoryId) {
      budget.category = await this.requireCategory(user, dto.categoryId);
    }
    if (dto.month) {
      budget.month = dto.month;
    }
    if (dto.limit !== undefined) {
      budget.limitCents = eurosToCents(dto.limit);
    }
    await this.em.flush();
    await this.em.populate(budget, ['category']);
    const spent = await this.spentCents(user, budget.category, budget.month);
    return toBudgetDto(budget, spent);
  }

  async deleteBudget(user: User, id: string): Promise<{ ok: true }> {
    const budget = await this.requireBudget(user, id);
    this.em.remove(budget);
    await this.em.flush();
    return { ok: true };
  }

  async findDuplicate(
    user: User,
    input: { merchant: string; amountCents: number; occurredAt: Date },
  ): Promise<Transaction | null> {
    const day = input.occurredAt.toISOString().slice(0, 10);
    const { start, end } = {
      start: new Date(`${day}T00:00:00.000Z`),
      end: new Date(`${day}T23:59:59.999Z`),
    };
    return this.em.findOne(Transaction, {
      user,
      merchant: input.merchant,
      amountCents: input.amountCents,
      occurredAt: { $gte: start, $lte: end },
    });
  }

  async resolveCategoryByName(user: User, name?: string): Promise<FinanceCategory> {
    const categories = await this.ensureReady(user);
    if (!name) {
      return categories.find((item) => item.slug === 'other') ?? categories[0];
    }
    const needle = name.trim().toLowerCase();
    return (
      categories.find((item) => item.name.toLowerCase() === needle || item.slug === needle) ??
      categories.find((item) => item.slug === 'other') ??
      categories[0]
    );
  }

  async budgetOvershoot(
    user: User,
    category: FinanceCategory,
    occurredAt: Date,
  ): Promise<{ overByCents: number; limitCents: number; spentCents: number } | null> {
    const month = monthKey(occurredAt.toISOString());
    const budget = await this.em.findOne(Budget, { user, category, month });
    if (!budget) {
      return null;
    }
    const spentCents = await this.spentCents(user, category, month);
    if (spentCents <= budget.limitCents) {
      return null;
    }
    return {
      overByCents: spentCents - budget.limitCents,
      limitCents: budget.limitCents,
      spentCents,
    };
  }

  private async spentCents(user: User, category: FinanceCategory, month: string): Promise<number> {
    const { start, end } = monthBounds(month);
    const rows = await this.em.find(Transaction, {
      user,
      category,
      kind: 'expense',
      occurredAt: { $gte: start, $lt: end },
    });
    return rows.reduce((sum, txn) => sum + txn.amountCents, 0);
  }

  private async emitCreated(
    userId: string,
    txn: Transaction,
    extras?: { budgetOvershoot?: boolean; overBy?: number },
  ): Promise<void> {
    const amount = centsToEuros(txn.amountCents);
    const overshoot = extras?.budgetOvershoot;
    const type = txn.kind === 'income' ? 'INCOME_CREATED' : 'EXPENSE_CREATED';
    const title = txn.kind === 'income' ? `Income · ${txn.merchant}` : txn.merchant;
    const summary = `€${amount.toFixed(2)} · ${txn.category.name}`;
    await this.activity.emit(userId, {
      category: 'finance',
      type,
      title,
      summary,
      occurredAt: txn.occurredAt.toISOString(),
      tags: [
        txn.kind,
        txn.category.slug,
        txn.source,
        ...(overshoot ? ['budget-overshoot'] : []),
      ],
      payload: {
        transactionId: txn.id,
        amount,
        categoryId: txn.category.id,
        categoryName: txn.category.name,
        source: txn.source,
        ...(overshoot
          ? {
              budgetOvershoot: true,
              overBy: extras?.overBy,
              notify: {
                kind: 'budget_overshoot',
                message: `${txn.category.name} is over the ${monthKey(txn.occurredAt.toISOString())} limit.`,
              },
            }
          : {}),
      },
    });
  }

  private async requireCategory(user: User, id: string): Promise<FinanceCategory> {
    const category = await this.em.findOne(FinanceCategory, { id, user });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  private async requireTransaction(user: User, id: string): Promise<Transaction> {
    const txn = await this.em.findOne(Transaction, { id, user }, { populate: ['category'] });
    if (!txn) {
      throw new NotFoundException('Transaction not found');
    }
    return txn;
  }

  private async requireBudget(user: User, id: string): Promise<Budget> {
    const budget = await this.em.findOne(Budget, { id, user }, { populate: ['category'] });
    if (!budget) {
      throw new NotFoundException('Budget not found');
    }
    return budget;
  }

  private async ensureReady(user: User): Promise<FinanceCategory[]> {
    let categories = await this.em.find(FinanceCategory, { user }, { orderBy: { sortOrder: 'ASC' } });
    if (categories.length === 0) {
      for (const def of DEFAULT_CATEGORIES) {
        this.em.create(FinanceCategory, { user, ...def });
      }
      await this.em.flush();
      categories = await this.em.find(FinanceCategory, { user }, { orderBy: { sortOrder: 'ASC' } });
    }

    const txnCount = await this.em.count(Transaction, { user });
    if (txnCount === 0) {
      const bySlug = new Map(categories.map((item) => [item.slug, item]));
      await seedTakeControlDemo(this.em, user, bySlug);
    }
    return categories;
  }
}

export function assertMonth(month?: string): string | undefined {
  if (!month) {
    return undefined;
  }
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new BadRequestException('month must be YYYY-MM');
  }
  return month;
}
