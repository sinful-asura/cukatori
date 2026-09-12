import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import type {
  BudgetDto,
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
import { MeterGroup } from 'primeng/metergroup';
import { Select } from 'primeng/select';
import { Table } from 'primeng/table';
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Tag } from 'primeng/tag';
import { FinanceApi } from '../../core/api/finance.api';

type MeterItem = { label: string; value: number; color: string };

const DEMO_MONTH = new Date(2026, 8, 1);

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
    MeterGroup,
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

  activeTab: string | number = 'overview';
  readonly monthDate = signal<Date>(DEMO_MONTH);
  readonly loading = signal(false);
  readonly overview = signal<FinanceOverviewDto | null>(null);
  readonly transactions = signal<TransactionDto[]>([]);
  readonly budgets = signal<BudgetDto[]>([]);
  readonly categories = signal<FinanceCategoryDto[]>([]);
  readonly importResult = signal<ImportResultDto | null>(null);

  readonly monthKey = computed(() => toMonthKey(this.monthDate()));
  readonly spendMeter = computed<MeterItem[]>(() =>
    (this.overview()?.byCategory ?? []).map((row) => ({
      label: row.category.name,
      value: row.percent,
      color: row.category.color,
    })),
  );
  readonly donutStyle = computed(() => conicFrom(this.overview()?.byCategory ?? []));
  readonly expenseCategories = computed(() =>
    this.categories().filter((item) => item.kind === 'expense'),
  );
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
              ? `${created.category.name} is over the ${this.monthKey()} limit by ${this.eur(created.overBy ?? 0, 2)}`
              : `${created.merchant} · ${this.eur(created.amount, 2)}`,
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
            detail: `${budget.category.name} · ${this.eur(budget.limit)}`,
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

  budgetMeter(row: BudgetDto): MeterItem[] {
    return [
      {
        label: row.category.name,
        value: Math.min(row.utilization, 100),
        color: row.overLimit ? '#ff4d3a' : row.category.color,
      },
    ];
  }

  eur(value: number, digits = 0): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);
  }

  when(iso: string): string {
    return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short' }).format(new Date(iso));
  }
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function conicFrom(rows: FinanceOverviewDto['byCategory']): string {
  if (!rows.length) {
    return 'conic-gradient(#1b1b22 0deg 360deg)';
  }
  const total = rows.reduce((sum, row) => sum + row.amount, 0) || 1;
  let cursor = 0;
  const stops = rows.map((row) => {
    const start = (cursor / total) * 360;
    cursor += row.amount;
    const end = (cursor / total) * 360;
    return `${row.category.color} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${stops.join(', ')})`;
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
