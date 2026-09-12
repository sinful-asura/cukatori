import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { CelebrationHint, ParsedQuickLog } from '@ascend-os/shared/nlp';
import { environment } from '../environment';

export interface QuickLogActivity {
  id: string;
  category: string;
  type: string;
  occurredAt: string;
  title: string;
  summary: string;
  xpAwarded: number;
  payload: Record<string, unknown>;
  tags: string[];
}

export interface QuickLogResponse {
  parsed: ParsedQuickLog;
  preview: string;
  stub: {
    id: string;
    dispatched: boolean;
    dispatchedTo: string | null;
  };
  activity: QuickLogActivity | null;
  celebrations: CelebrationHint[];
}

export interface QuickLogRecent {
  id: string;
  rawText: string;
  kind: string;
  parsed: Record<string, unknown>;
  dispatched: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class QuickLogApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/quick-log`;

  submit(text: string) {
    return this.http.post<QuickLogResponse>(this.base, { text });
  }

  preview(text: string) {
    return this.http.get<{ parsed: ParsedQuickLog; preview: string }>(`${this.base}/preview`, {
      params: { text },
    });
  }

  recent() {
    return this.http.get<QuickLogRecent[]>(`${this.base}/recent`);
  }

  demo() {
    return this.http.get<Record<string, unknown>>(`${this.base}/demo`);
  }
}
