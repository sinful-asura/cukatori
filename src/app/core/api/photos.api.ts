import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../environment';

export const PHOTO_TYPES = ['front', 'back', 'side', 'other'] as const;
export type PhotoType = (typeof PHOTO_TYPES)[number];

export type PhotoDto = {
  id: string;
  type: PhotoType | string;
  takenAt: string;
  bodyweight: number | null;
  notes: string | null;
  mimeType: string;
  fileUrl: string;
  createdAt: string;
};

export type PhotoDraft = {
  type: PhotoType;
  bodyweight?: number | null;
  notes?: string;
  takenAt?: string;
};

@Injectable({ providedIn: 'root' })
export class PhotosApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/photos`;

  list() {
    return this.http.get<PhotoDto[]>(this.base);
  }

  get(id: string) {
    return this.http.get<PhotoDto>(`${this.base}/${id}`);
  }

  upload(file: File, draft: PhotoDraft) {
    const body = new FormData();
    body.append('file', file);
    body.append('type', draft.type);
    if (draft.bodyweight != null) {
      body.append('bodyweight', String(draft.bodyweight));
    }
    if (draft.notes) {
      body.append('notes', draft.notes);
    }
    if (draft.takenAt) {
      body.append('takenAt', draft.takenAt);
    }
    return this.http.post<PhotoDto>(this.base, body);
  }

  update(id: string, draft: Partial<PhotoDraft>) {
    return this.http.patch<PhotoDto>(`${this.base}/${id}`, draft);
  }

  remove(id: string) {
    return this.http.delete<{ ok: true }>(`${this.base}/${id}`);
  }
}
