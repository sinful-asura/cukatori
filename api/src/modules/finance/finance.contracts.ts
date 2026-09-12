/** Keep in sync with `shared/finance`. Inlined so Nest rootDir stays `api/`. */

export type TransactionSource = 'manual' | 'xml';
export type TransactionKind = 'expense' | 'income';

export interface FinanceCategoryDto {
  id: string;
  name: string;
  slug: string;
  color: string;
  kind: TransactionKind;
}

export interface TransactionDto {
  id: string;
  amount: number;
  currency: 'EUR';
  merchant: string;
  occurredAt: string;
  source: TransactionSource;
  kind: TransactionKind;
  categoryId: string;
  category: FinanceCategoryDto;
  note: string | null;
  budgetOvershoot?: boolean;
  overBy?: number;
}

export interface BudgetDto {
  id: string;
  categoryId: string;
  category: FinanceCategoryDto;
  month: string;
  limit: number;
  spent: number;
  remaining: number;
  utilization: number;
  overLimit: boolean;
}

export interface CategorySpendDto {
  category: FinanceCategoryDto;
  amount: number;
  percent: number;
}

export interface FinanceKpiDto {
  key: string;
  label: string;
  amount: number;
}

export interface FinanceOverviewDto {
  month: string;
  currency: 'EUR';
  totalSpent: number;
  totalIncome: number;
  kpis: FinanceKpiDto[];
  byCategory: CategorySpendDto[];
  recent: TransactionDto[];
  budgets: BudgetDto[];
}

export interface ParsedBankRow {
  date: string;
  amount: number;
  merchant: string;
  category?: string;
}

export interface ImportBudgetAlertDto {
  category: string;
  overBy: number;
}

export interface ImportResultDto {
  imported: number;
  skipped: number;
  transactions: TransactionDto[];
  alerts: ImportBudgetAlertDto[];
}
