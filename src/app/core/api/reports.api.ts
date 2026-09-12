import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { CoachReportDto, WeekRecapDto } from '@ascend-os/shared/recap';
import { Observable } from 'rxjs';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class ReportsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reports`;

  week(start?: string): Observable<WeekRecapDto> {
    return this.http.get<WeekRecapDto>(`${this.base}/week`, {
      params: start ? { start } : {},
    });
  }

  coach(): Observable<CoachReportDto> {
    return this.http.get<CoachReportDto>(`${this.base}/coach`);
  }
}
