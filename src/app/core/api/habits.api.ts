import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type {
  CompleteHabitResponse,
  CreateHabitRequest,
  HabitDto,
  UpdateHabitRequest,
} from '@ascend-os/shared/habits';
import { Observable } from 'rxjs';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class HabitsApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/habits`;

  list(): Observable<HabitDto[]> {
    return this.http.get<HabitDto[]>(this.base);
  }

  get(id: string): Observable<HabitDto> {
    return this.http.get<HabitDto>(`${this.base}/${id}`);
  }

  create(body: CreateHabitRequest): Observable<HabitDto> {
    return this.http.post<HabitDto>(this.base, body);
  }

  update(id: string, body: UpdateHabitRequest): Observable<HabitDto> {
    return this.http.patch<HabitDto>(`${this.base}/${id}`, body);
  }

  remove(id: string): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`${this.base}/${id}`);
  }

  complete(id: string): Observable<CompleteHabitResponse> {
    return this.http.post<CompleteHabitResponse>(`${this.base}/${id}/complete`, {});
  }
}
