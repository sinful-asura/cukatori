import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  LibraryExerciseDto,
  LibraryFiltersDto,
  LibraryPageDto,
  LibraryQuery,
} from '@ascend-os/shared/exercise';
import { environment } from '../environment';

/**
 * The browser never calls api.musclewiki.com directly: the key is metered and
 * upstream sends no CORS headers, so Nest proxies and normalises it.
 */
@Injectable({ providedIn: 'root' })
export class ExerciseLibraryApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/exercise-library`;

  list(query: LibraryQuery): Observable<LibraryPageDto> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<LibraryPageDto>(this.base, { params });
  }

  filters(): Observable<LibraryFiltersDto> {
    return this.http.get<LibraryFiltersDto>(`${this.base}/filters`);
  }

  byId(id: string): Observable<LibraryExerciseDto> {
    return this.http.get<LibraryExerciseDto>(`${this.base}/${id}`);
  }
}
