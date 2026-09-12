import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { ActivityEventDto, ActivityQuery } from '@ascend-os/shared';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class ActivityApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  list(query: ActivityQuery = {}) {
    return this.http.get<ActivityEventDto[]>(`${this.base}/activity`, {
      params: this.params(query),
    });
  }

  timeline(query: ActivityQuery = {}) {
    return this.http.get<ActivityEventDto[]>(`${this.base}/timeline`, {
      params: this.params(query),
    });
  }

  private params(query: ActivityQuery): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value) {
        params = params.set(key, value);
      }
    }
    return params;
  }
}
