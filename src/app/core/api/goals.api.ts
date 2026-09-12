import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  CreateGoalRequest,
  GoalDto,
  ProgressGoalRequest,
  ProgressGoalResponse,
  UpdateGoalRequest,
} from '@ascend-os/shared/goals';
import { Observable } from 'rxjs';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class GoalsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/goals`;

  list(): Observable<GoalDto[]> {
    return this.http.get<GoalDto[]>(this.base);
  }

  get(id: string): Observable<GoalDto> {
    return this.http.get<GoalDto>(`${this.base}/${id}`);
  }

  create(body: CreateGoalRequest): Observable<GoalDto> {
    return this.http.post<GoalDto>(this.base, body);
  }

  update(id: string, body: UpdateGoalRequest): Observable<GoalDto> {
    return this.http.patch<GoalDto>(`${this.base}/${id}`, body);
  }

  remove(id: string): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`${this.base}/${id}`);
  }

  progress(id: string, body: ProgressGoalRequest): Observable<ProgressGoalResponse> {
    return this.http.post<ProgressGoalResponse>(`${this.base}/${id}/progress`, body);
  }
}
