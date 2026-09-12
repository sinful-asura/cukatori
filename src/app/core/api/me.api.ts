import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { MeStatsDto } from '@ascend-os/shared';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class MeApi {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  stats() {
    return this.http.get<MeStatsDto>(`${this.base}/me/stats`);
  }
}
