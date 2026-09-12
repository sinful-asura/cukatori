import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../environment';

export type NotificationDto = {
  id: string;
  kind: string;
  title: string;
  body: string;
  readAt: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class NotificationsApi {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  list(unread = false) {
    let params = new HttpParams();
    if (unread) {
      params = params.set('unread', '1');
    }
    return this.http.get<NotificationDto[]>(`${this.api}/notifications`, { params });
  }

  markRead(id: string) {
    return this.http.patch<NotificationDto>(`${this.api}/notifications/${id}/read`, {});
  }
}
