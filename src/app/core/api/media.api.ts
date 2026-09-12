import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  CreateMediaItemRequest,
  LogMediaProgressRequest,
  LogMediaProgressResponse,
  MediaItemDto,
  MediaLibraryDto,
  MediaProgressDto,
  MediaStatus,
  MediaType,
  UpdateMediaItemRequest,
} from '@ascend-os/shared/media';
import { environment } from '../environment';

@Injectable({ providedIn: 'root' })
export class MediaApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/media`;

  list(filters?: { type?: MediaType; status?: MediaStatus }): Observable<MediaItemDto[]> {
    let params = new HttpParams();
    if (filters?.type) {
      params = params.set('type', filters.type);
    }
    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    return this.http.get<MediaItemDto[]>(this.base, { params });
  }

  library(): Observable<MediaLibraryDto> {
    return this.http.get<MediaLibraryDto>(`${this.base}/library`);
  }

  get(id: string): Observable<MediaItemDto> {
    return this.http.get<MediaItemDto>(`${this.base}/${id}`);
  }

  create(body: CreateMediaItemRequest): Observable<MediaItemDto> {
    return this.http.post<MediaItemDto>(this.base, body);
  }

  update(id: string, body: UpdateMediaItemRequest): Observable<MediaItemDto> {
    return this.http.patch<MediaItemDto>(`${this.base}/${id}`, body);
  }

  remove(id: string): Observable<{ ok: true }> {
    return this.http.delete<{ ok: true }>(`${this.base}/${id}`);
  }

  listProgress(id: string): Observable<MediaProgressDto[]> {
    return this.http.get<MediaProgressDto[]>(`${this.base}/${id}/progress`);
  }

  logProgress(id: string, body: LogMediaProgressRequest): Observable<LogMediaProgressResponse> {
    return this.http.post<LogMediaProgressResponse>(`${this.base}/${id}/progress`, body);
  }
}
