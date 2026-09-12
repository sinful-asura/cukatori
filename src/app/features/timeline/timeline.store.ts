import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { catchError, of, timeout } from 'rxjs';
import type { ActivityCategory, ActivityEventDto, ActivityType } from '@ascend-os/shared';
import { environment } from '../../core/environment';
import { KRISTIJAN_EVENTS } from '../dashboard/kristijan.seed';

export type DatePreset = 'all' | 'today' | 'week' | 'month';

@Injectable({ providedIn: 'root' })
export class TimelineStore {
  private readonly http = inject(HttpClient);

  readonly loading = signal(false);
  private hydrated = false;
  readonly events = signal<ActivityEventDto[]>(sorted(KRISTIJAN_EVENTS));
  readonly category = signal<ActivityCategory | null>(null);
  readonly type = signal<ActivityType | null>(null);
  readonly tag = signal<string | null>(null);
  readonly date = signal<DatePreset>('all');

  readonly tags = computed(() => {
    const unique = new Set<string>();
    for (const event of this.events()) {
      for (const tag of event.tags) {
        unique.add(tag);
      }
    }
    return [...unique].sort();
  });

  readonly filtered = computed(() => {
    const category = this.category();
    const type = this.type();
    const tag = this.tag();
    const from = dateFrom(this.date());
    return this.events().filter((event) => {
      if (category && event.category !== category) {
        return false;
      }
      if (type && event.type !== type) {
        return false;
      }
      if (tag && !event.tags.includes(tag)) {
        return false;
      }
      if (from && new Date(event.occurredAt) < from) {
        return false;
      }
      return true;
    });
  });

  hydrate(): void {
    if (this.hydrated) {
      return;
    }
    this.hydrated = true;
    let params = new HttpParams();
    const category = this.category();
    const type = this.type();
    const tag = this.tag();
    const from = dateFrom(this.date());
    if (category) {
      params = params.set('category', category);
    }
    if (type) {
      params = params.set('type', type);
    }
    if (tag) {
      params = params.set('tag', tag);
    }
    if (from) {
      params = params.set('from', from.toISOString());
    }
    this.http
      .get<unknown>(`${environment.apiUrl}/timeline`, { params })
      .pipe(
        timeout(2000),
        catchError(() =>
          this.http.get<unknown>(`${environment.apiUrl}/activity`, { params }).pipe(
            timeout(2000),
            catchError(() => of(null)),
          ),
        ),
      )
      .subscribe((raw) => {
        const rows = Array.isArray(raw)
          ? raw
          : raw && typeof raw === 'object' && Array.isArray((raw as { items?: unknown }).items)
            ? (raw as { items: ActivityEventDto[] }).items
            : null;
        if (rows) {
          this.events.set(sorted(rows as ActivityEventDto[]));
        }
        this.loading.set(false);
      });
  }

  clearFilters(): void {
    this.category.set(null);
    this.type.set(null);
    this.tag.set(null);
    this.date.set('all');
  }
}

function sorted(events: ActivityEventDto[]): ActivityEventDto[] {
  return [...events].sort((a, b) => +new Date(b.occurredAt) - +new Date(a.occurredAt));
}

function dateFrom(preset: DatePreset): Date | null {
  if (preset === 'all') {
    return null;
  }
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (preset === 'week') {
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  }
  if (preset === 'month') {
    d.setDate(1);
  }
  return d;
}
