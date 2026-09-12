import { centsToEuros } from './money.js';
import type {
  BudgetDto,
  FinanceCategoryDto,
  TransactionDto,
  TransactionKind,
  TransactionSource,
} from './finance.contracts.js';
import { Budget } from './budget.entity.js';
import { FinanceCategory } from './finance-category.entity.js';
import { Transaction } from './transaction.entity.js';

export function toCategoryDto(category: FinanceCategory): FinanceCategoryDto {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    color: category.color,
    kind: category.kind as TransactionKind,
  };
}

export function toTransactionDto(
  txn: Transaction,
  extras?: { budgetOvershoot?: boolean; overBy?: number },
): TransactionDto {
  const category = toCategoryDto(txn.category);
  return {
    id: txn.id,
    amount: centsToEuros(txn.amountCents),
    currency: 'EUR',
    merchant: txn.merchant,
    occurredAt: txn.occurredAt.toISOString(),
    source: txn.source as TransactionSource,
    kind: txn.kind as TransactionKind,
    categoryId: category.id,
    category,
    note: txn.note,
    ...extras,
  };
}

export function toBudgetDto(budget: Budget, spentCents: number): BudgetDto {
  const category = toCategoryDto(budget.category);
  const spent = centsToEuros(spentCents);
  const limit = centsToEuros(budget.limitCents);
  const remaining = centsToEuros(budget.limitCents - spentCents);
  const utilization =
    budget.limitCents <= 0 ? 0 : Math.round((spentCents / budget.limitCents) * 1000) / 10;
  return {
    id: budget.id,
    categoryId: category.id,
    category,
    month: budget.month,
    limit,
    spent,
    remaining,
    utilization,
    overLimit: spentCents > budget.limitCents,
  };
}
