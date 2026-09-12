import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { CoachReportDto, PeriodRecapDto, RecapPeriodRange, WeekRecapDto } from '@ascend-os/shared/recap';
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

  period(range: RecapPeriodRange, start?: string): Observable<PeriodRecapDto> {
    return this.http.get<PeriodRecapDto>(`${this.base}/period`, {
      params: start ? { range, start } : { range },
    });
  }

  coach(): Observable<CoachReportDto> {
    return this.http.get<CoachReportDto>(`${this.base}/coach`);
  }
}
