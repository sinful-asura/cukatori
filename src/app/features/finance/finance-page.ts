import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import type {
  BudgetDto,
  CategorySpendDto,
  FinanceCategoryDto,
  FinanceOverviewDto,
  ImportResultDto,
  TransactionDto,
  TransactionKind,
} from '@ascend-os/shared/finance';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmPopup } from 'primeng/confirmpopup';
import { DatePicker } from 'primeng/datepicker';
import { FileUpload } from 'primeng/fileupload';
import type { FileUploadHandlerEvent } from 'primeng/types/fileupload';
import { InputNumber } from 'primeng/inputnumber';
import { InputText } from 'primeng/inputtext';
import { ProgressBar } from 'primeng/progressbar';
import { Select } from 'primeng/select';
import { Table } from 'primeng/table';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { FinanceApi } from '../../core/api/finance.api';
import { PageHeader, PosBarChart, PosDonutChart, PosPanelHeader, type PosDonutSegment } from '../../shared/ui/pos';

const DEMO_MONTH = new Date(2026, 8, 1);
const CHART_ORDER = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'health', 'other'] as const;
const CHART_LABELS: Record<(typeof CHART_ORDER)[number], string> = {
  food: 'Food',
  transport: 'Transport',
  shopping: 'Shopping',
  entertainment: 'Entertainment',
  bills: 'Bills',
  health: 'Health',
  other: 'Other',
};
const HIGHLIGHTS = [
  { slug: 'food', label: 'Food & Dining', meter: '#f43f5e' },
  { slug: 'shopping', label: 'Shopping', meter: '#f43f5e' },
  { slug: 'entertainment', label: 'Entertainment', meter: '#f43f5e' },
  { slug: 'transport', label: 'Transport', meter: '#3b82f6' },
] as const;
const BUDGET_TONES: Record<string, string> = {
  food: '#34d56b',
  entertainment: '#22d3ee',
  shopping: '#f43f5e',
  transport: '#eab308',
};
const MERCHANT_MARKS: Record<string, { mark: string; color: string }> = {
  "mcdonald's": { mark: 'M', color: '#ef4444' },
  merkur: { mark: 'M', color: '#f43f5e' },
  nis: { mark: 'N', color: '#6366f1' },
  steam: { mark: 'S', color: '#2563eb' },
  konzum: { mark: 'K', color: '#16a34a' },
  spotify: { mark: 'S', color: '#22c55e' },
  zara: { mark: 'Z', color: '#111110' },
};
const GROCERY_MERCHANTS = new Set(['merkur']);

type FinanceTab = 'overview' | 'transactions' | 'budgets' | 'categories' | 'import';

@Component({
  selector: 'app-finance-page',
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Card,
    ConfirmPopup,
    DatePicker,
    FileUpload,
    InputNumber,
    InputText,
    PageHeader,
    PosBarChart,
    PosDonutChart,
    PosPanelHeader,
    ProgressBar,
    Select,
    Table,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    Tag,
  ],
  providers: [ConfirmationService],
  templateUrl: './finance-page.html',
  styleUrl: './finance-page.scss',
})
export class FinancePage implements OnInit {
  private readonly api = inject(FinanceApi);
  private readonly messages = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  activeTab: FinanceTab | string | number = 'overview';
  readonly monthDate = signal<Date>(DEMO_MONTH);
  readonly loading = signal(false);
  readonly overview = signal<FinanceOverviewDto | null>(null);
  readonly prevSpent = signal<number | null>(null);
  readonly transactions = signal<TransactionDto[]>([]);
  readonly budgets = signal<BudgetDto[]>([]);
  readonly categories = signal<FinanceCategoryDto[]>([]);
  readonly importResult = signal<ImportResultDto | null>(null);

  readonly monthKey = computed(() => toMonthKey(this.monthDate()));
  readonly highlightSpend = computed(() => {
    const rows = this.overview()?.byCategory ?? [];
    return HIGHLIGHTS.map((item) => {
      const row = rows.find((entry) => entry.category.slug === item.slug);
      return {
        slug: item.slug,
        label: item.label,
        meter: item.meter,
        amount: row?.amount ?? 0,
        percent: row?.percent ?? 0,
      };
    });
  });
  readonly spendDelta = computed(() => {
    const current = this.overview()?.totalSpent ?? 0;
    const prev = this.prevSpent();
    if (prev == null || prev <= 0) {
      return '';
    }
    const pct = Math.round(((current - prev) / prev) * 100);
    const arrow = pct >= 0 ? '↑' : '↓';
    return `${arrow} ${Math.abs(pct)}% vs last month`;
  });
  readonly spendDeltaUp = computed(() => this.spendDelta().startsWith('↑'));
  readonly recentExpenses = computed(() => (this.overview()?.recent ?? []).slice(0, 4));
  readonly chartRows = computed(() => {
    const rows = this.overview()?.byCategory ?? [];
    const bySlug = new Map(rows.map((row) => [row.category.slug, row]));
    const ordered = CHART_ORDER.map((slug) => bySlug.get(slug)).filter(
      (row): row is CategorySpendDto => !!row && row.amount > 0,
    );
    return ordered.length ? ordered : rows;
  });
  readonly spendValues = computed(() => this.chartRows().map((row) => row.amount));
  readonly spendLabels = computed(() =>
    this.chartRows().map((row) => CHART_LABELS[row.category.slug as (typeof CHART_ORDER)[number]] ?? row.category.name),
  );
  readonly spendColors = computed(() => this.chartRows().map((row) => row.category.color));
  readonly spendAxis = computed(() => euroAxis(Math.max(0, ...this.spendValues())));
  readonly donutSegments = computed<PosDonutSegment[]>(() =>
    this.chartRows().map((row) => ({
      label: CHART_LABELS[row.category.slug as (typeof CHART_ORDER)[number]] ?? row.category.name,
      value: row.amount,
      color: row.category.color,
      pct: Math.round(row.percent),
    })),
  );
  readonly donutTotal = computed(() => this.euro(this.overview()?.totalSpent ?? 0));
  readonly overviewBudgets = computed(() => {
    const rows = this.budgets();
    const preferred = ['food', 'entertainment', 'shopping', 'transport'];
    const picked = preferred
      .map((slug) => rows.find((row) => row.category.slug === slug))
      .filter((row): row is BudgetDto => !!row);
    return picked.length ? picked : rows.slice(0, 4);
  });
  readonly expenseCategories = computed(() => this.categories().filter((item) => item.kind === 'expense'));
  readonly kindOptions = [
    { label: 'Expense', value: 'expense' },
    { label: 'Income', value: 'income' },
  ];

  txnMerchant = '';
  txnAmount: number | null = null;
  txnCategoryId: string | null = null;
  txnDate = new Date();
  txnKind: TransactionKind = 'expense';

  budgetCategoryId: string | null = null;
  budgetMonth = new Date(2026, 8, 1);
  budgetLimit: number | null = null;

  ngOnInit(): void {
    this.refresh();
  }

  private loadPrevSpent(month: string): void {
    const [year, part] = month.split('-').map(Number);
    const prev = new Date(year, part - 2, 1);
    this.api.overview(toMonthKey(prev)).subscribe({
      next: (row) => this.prevSpent.set(row.totalSpent),
      error: () => this.prevSpent.set(null),
    });
  }

  showTab(tab: FinanceTab): void {
    this.activeTab = tab;
  }

  onMonthChange(value: Date | null): void {
    if (!value) {
      return;
    }
    this.monthDate.set(value);
    this.refresh();
  }

  refresh(): void {
    const month = this.monthKey();
    this.loading.set(true);
    forkJoin({
      overview: this.api.overview(month),
      transactions: this.api.listTransactions({ month }),
      budgets: this.api.listBudgets(month),
      categories: this.api.listCategories(),
    }).subscribe({
      next: ({ overview, transactions, budgets, categories }) => {
        this.overview.set(overview);
        this.transactions.set(transactions);
        this.budgets.set(budgets);
        this.categories.set(categories);
        this.loadPrevSpent(month);
        if (!this.txnCategoryId && categories.length) {
          this.txnCategoryId = categories.find((item) => item.kind === 'expense')?.id ?? categories[0].id;
        }
        if (!this.budgetCategoryId && categories.length) {
          this.budgetCategoryId =
            categories.find((item) => item.kind === 'expense')?.id ?? categories[0].id;
        }
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.messages.add({
          severity: 'error',
          summary: 'Finance',
          detail: httpDetail(error, 'Could not load finance'),
        });
      },
    });
  }

  addTransaction(): void {
    if (!this.txnMerchant.trim() || !this.txnAmount || !this.txnCategoryId || !this.txnDate) {
      this.messages.add({
        severity: 'warn',
        summary: 'Finance',
        detail: 'Merchant, amount, category and date are required',
      });
      return;
    }
    this.api
      .createTransaction({
        merchant: this.txnMerchant.trim(),
        amount: this.txnAmount,
        categoryId: this.txnCategoryId,
        occurredAt: this.txnDate.toISOString(),
        kind: this.txnKind,
      })
      .subscribe({
        next: (created) => {
          this.txnMerchant = '';
          this.txnAmount = null;
          this.messages.add({
            severity: created.budgetOvershoot ? 'warn' : 'success',
            summary: created.budgetOvershoot ? 'Budget overshoot' : 'Logged',
            detail: created.budgetOvershoot
              ? `${created.category.name} is over the ${this.monthKey()} limit by ${this.euro(created.overBy ?? 0, 2)}`
              : `${created.merchant} · ${this.euro(created.amount, 2)}`,
          });
          this.refresh();
        },
        error: (error: unknown) =>
          this.messages.add({
            severity: 'error',
            summary: 'Finance',
            detail: httpDetail(error, 'Could not save transaction'),
          }),
      });
  }

  confirmDeleteTxn(event: Event, row: TransactionDto): void {
    this.confirm.confirm({
      target: event.currentTarget as EventTarget,
      message: `Remove ${row.merchant}?`,
      icon: 'pi pi-exclamation-circle',
      acceptButtonProps: { severity: 'danger', label: 'Remove' },
      accept: () => {
        this.api.deleteTransaction(row.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Removed', detail: row.merchant });
            this.refresh();
          },
          error: (error: unknown) =>
            this.messages.add({
              severity: 'error',
              summary: 'Finance',
              detail: httpDetail(error, 'Could not remove transaction'),
            }),
        });
      },
    });
  }

  addBudget(): void {
    if (!this.budgetCategoryId || !this.budgetLimit || !this.budgetMonth) {
      this.messages.add({
        severity: 'warn',
        summary: 'Finance',
        detail: 'Category, month and limit are required',
      });
      return;
    }
    this.api
      .createBudget({
        categoryId: this.budgetCategoryId,
        month: toMonthKey(this.budgetMonth),
        limit: this.budgetLimit,
      })
      .subscribe({
        next: (budget) => {
          this.budgetLimit = null;
          this.messages.add({
            severity: 'success',
            summary: 'Budget',
            detail: `${budget.category.name} · ${this.euro(budget.limit)}`,
          });
          this.refresh();
        },
        error: (error: unknown) =>
          this.messages.add({
            severity: 'error',
            summary: 'Finance',
            detail: httpDetail(error, 'Could not save budget'),
          }),
      });
  }

  confirmDeleteBudget(event: Event, row: BudgetDto): void {
    this.confirm.confirm({
      target: event.currentTarget as EventTarget,
      message: `Remove the ${row.category.name} budget?`,
      icon: 'pi pi-exclamation-circle',
      acceptButtonProps: { severity: 'danger', label: 'Remove' },
      accept: () => {
        this.api.deleteBudget(row.id).subscribe({
          next: () => {
            this.messages.add({ severity: 'success', summary: 'Removed', detail: row.category.name });
            this.refresh();
          },
          error: (error: unknown) =>
            this.messages.add({
              severity: 'error',
              summary: 'Finance',
              detail: httpDetail(error, 'Could not remove budget'),
            }),
        });
      },
    });
  }

  importStatement(event: FileUploadHandlerEvent): void {
    const file = event.files[0];
    if (!file) {
      return;
    }
    this.api.importXml(file).subscribe({
      next: (result) => {
        this.importResult.set(result);
        const over = result.alerts[0];
        this.messages.add({
          severity: over ? 'warn' : 'success',
          summary: 'Imported',
          detail: over
            ? `${result.imported} booked · ${over.category} is over budget`
            : `${result.imported} booked, ${result.skipped} skipped`,
        });
        this.refresh();
      },
      error: (error: unknown) =>
        this.messages.add({
          severity: 'error',
          summary: 'Import',
          detail: httpDetail(error, 'XML import failed'),
        }),
    });
  }

  euro(value: number, digits?: number): string {
    const fraction = digits ?? (Number.isInteger(value) ? 0 : 2);
    return `€${Math.abs(value).toLocaleString('en-IE', {
      minimumFractionDigits: fraction,
      maximumFractionDigits: fraction,
    })}`;
  }

  signedEuro(row: TransactionDto): string {
    const signed = row.kind === 'income' ? row.amount : -row.amount;
    const abs = this.euro(row.amount, Number.isInteger(row.amount) ? 0 : 2);
    if (signed < 0) {
      return `−${abs}`;
    }
    if (signed > 0) {
      return `+${abs}`;
    }
    return abs;
  }

  when(iso: string): string {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  }

  mark(row: TransactionDto): string {
    if (row.kind === 'income') {
      return '€';
    }
    return this.merchantMark(row).mark;
  }

  markColor(row: TransactionDto): string {
    if (row.kind === 'income') {
      return '#10a142';
    }
    return this.merchantMark(row).color;
  }

  categoryLabel(row: TransactionDto): string {
    if (GROCERY_MERCHANTS.has(row.merchant.trim().toLowerCase())) {
      return 'Groceries';
    }
    return row.category.name;
  }

  private merchantMark(row: TransactionDto): { mark: string; color: string } {
    const known = MERCHANT_MARKS[row.merchant.trim().toLowerCase()];
    if (known) {
      return known;
    }
    return {
      mark: row.merchant.trim().charAt(0).toUpperCase() || '·',
      color: row.category.color,
    };
  }

  pct(value: number): number {
    return Math.min(100, Math.max(0, Math.round(value)));
  }

  barStyle(color: string): Record<string, string> {
    return {
      '--p-progressbar-value-background': color,
      '--p-progressbar-value-bg': color,
      '--p-progressbar-background': '#2a2a28',
      '--p-progressbar-border-radius': '999px',
      '--p-progressbar-height': '4px',
      height: '4px',
    };
  }

  budgetColor(row: BudgetDto): string {
    return BUDGET_TONES[row.category.slug] ?? row.category.color;
  }
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function euroAxis(max: number): string[] {
  const top = niceCeil(max || 100);
  return [`€${whole(top)}`, `€${whole((top * 2) / 3)}`, `€${whole(top / 3)}`, '€0'];
}

function niceCeil(value: number): number {
  if (value <= 0) {
    return 100;
  }
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  const nice = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : normalized <= 6 ? 6 : 10;
  return nice * magnitude;
}

function whole(value: number): string {
  return Math.round(value).toLocaleString('en-IE', { maximumFractionDigits: 0 });
}

function httpDetail(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    const message = (error.error as { message?: string | string[] } | null)?.message;
    if (Array.isArray(message)) {
      return message.join(', ');
    }
    if (typeof message === 'string' && message) {
      return message;
    }
  }
  return fallback;
}
