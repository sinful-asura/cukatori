import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  BudgetDto,
  CreateBudgetRequest,
  CreateTransactionRequest,
  FinanceCategoryDto,
  FinanceOverviewDto,
  ImportResultDto,
  TransactionDto,
  UpdateBudgetRequest,
  UpdateTransactionRequest,
} from '@ascend-os/shared/finance';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class FinanceApi {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  overview(month: string) {
    return this.http.get<FinanceOverviewDto>(`${this.api}/finance/overview`, {
      params: new HttpParams().set('month', month),
    });
  }

  listCategories() {
    return this.http.get<FinanceCategoryDto[]>(`${this.api}/finance/categories`);
  }

  listTransactions(query: { month?: string; categoryId?: string; source?: string } = {}) {
    let params = new HttpParams();
    if (query.month) {
      params = params.set('month', query.month);
    }
    if (query.categoryId) {
      params = params.set('categoryId', query.categoryId);
    }
    if (query.source) {
      params = params.set('source', query.source);
    }
    return this.http.get<TransactionDto[]>(`${this.api}/transactions`, { params });
  }

  createTransaction(body: CreateTransactionRequest) {
    return this.http.post<TransactionDto>(`${this.api}/transactions`, body);
  }

  updateTransaction(id: string, body: UpdateTransactionRequest) {
    return this.http.patch<TransactionDto>(`${this.api}/transactions/${id}`, body);
  }

  deleteTransaction(id: string) {
    return this.http.delete<{ ok: true }>(`${this.api}/transactions/${id}`);
  }

  listBudgets(month?: string) {
    let params = new HttpParams();
    if (month) {
      params = params.set('month', month);
    }
    return this.http.get<BudgetDto[]>(`${this.api}/budgets`, { params });
  }

  createBudget(body: CreateBudgetRequest) {
    return this.http.post<BudgetDto>(`${this.api}/budgets`, body);
  }

  updateBudget(id: string, body: UpdateBudgetRequest) {
    return this.http.patch<BudgetDto>(`${this.api}/budgets/${id}`, body);
  }

  deleteBudget(id: string) {
    return this.http.delete<{ ok: true }>(`${this.api}/budgets/${id}`);
  }

  importXml(file: File) {
    const body = new FormData();
    body.append('file', file);
    return this.http.post<ImportResultDto>(`${this.api}/finance/import`, body);
  }
}
