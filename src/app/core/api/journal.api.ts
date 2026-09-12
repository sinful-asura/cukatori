import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  CreateJournalEntryRequest,
  CreateJournalVaultRequest,
  JournalEntryDto,
  JournalVaultStatusDto,
  UpdateJournalEntryRequest,
} from '@ascend-os/shared/journal';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class JournalApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/journal`;

  vault() {
    return this.http.get<JournalVaultStatusDto>(`${this.base}/vault`);
  }

  createVault(body: CreateJournalVaultRequest) {
    return this.http.post<Extract<JournalVaultStatusDto, { configured: true }>>(
      `${this.base}/vault`,
      body,
    );
  }

  list(q?: string) {
    const params = q?.trim() ? new HttpParams().set('q', q.trim()) : undefined;
    return this.http.get<JournalEntryDto[]>(this.base, { params });
  }

  get(id: string) {
    return this.http.get<JournalEntryDto>(`${this.base}/${id}`);
  }

  create(body: CreateJournalEntryRequest) {
    return this.http.post<JournalEntryDto>(this.base, body);
  }

  update(id: string, body: UpdateJournalEntryRequest) {
    return this.http.patch<JournalEntryDto>(`${this.base}/${id}`, body);
  }

  remove(id: string) {
    return this.http.delete<{ ok: true }>(`${this.base}/${id}`);
  }
}
