import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../environment';

export type CatalogExercise = {
  id: string;
  name: string;
  slug: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  equipment: string;
  pattern: string;
  type: string;
  difficulty: string;
};

export type DiscomfortDto = {
  id: string;
  region: string;
  side: 'left' | 'right' | 'both' | string;
  description: string;
  severity: number | null;
  exerciseId: string | null;
  tags: string[];
  createdAt: string;
  summary: string;
};

export type DiscomfortDraft = {
  region: string;
  side?: 'left' | 'right' | 'both';
  description: string;
  severity?: number;
  exerciseId?: string;
  tags?: string[];
};

export type SubstituteHit = {
  id: string;
  name: string;
  slug: string;
  primaryMuscle: string;
  equipment: string;
  pattern: string;
  score: number;
  reasons: string[];
};

export type SubstituteResponse = {
  source: {
    id: string;
    name: string;
    primaryMuscle: string;
    pattern: string;
    equipment: string;
  };
  discomfort: { id: string | null; region: string; side: string; note: string } | null;
  substitutes: SubstituteHit[];
};

export type PlateauItem = {
  exerciseId: string;
  exerciseName: string;
  weeksFlat: number;
  message: string;
  detail: string;
  options: string[];
};

export type DeloadDto = {
  suggest: boolean;
  dismissed: boolean;
  message: string;
  detail: string;
  signals: string[];
};

export type HeatmapDay = { date: string; count: number; intensity: number };

export type HeatmapDto = {
  kind: 'training' | 'habits' | 'activity' | string;
  year: number;
  days: HeatmapDay[];
  streak: number;
};

@Injectable({ providedIn: 'root' })
export class InsightsApi {
  private readonly http = inject(HttpClient);
  private readonly api = environment.apiUrl;

  catalog() {
    return this.http.get<{ muscles: string[]; exercises: CatalogExercise[] }>(
      `${this.api}/insights/catalog`,
    );
  }

  plateaus() {
    return this.http.get<{ items: PlateauItem[] }>(`${this.api}/insights/plateaus`);
  }

  deload() {
    return this.http.get<DeloadDto>(`${this.api}/insights/deload`);
  }

  dismissDeload() {
    return this.http.post<DeloadDto>(`${this.api}/insights/deload/dismiss`, {});
  }

  heatmap(kind: string, year?: number) {
    const params = year ? { year: String(year) } : undefined;
    return this.http.get<HeatmapDto>(`${this.api}/heatmaps/${kind}`, { params });
  }

  substitutes(exerciseId: string, discomfort?: string) {
    const params = discomfort ? { discomfort } : undefined;
    return this.http.get<SubstituteResponse>(`${this.api}/exercises/${exerciseId}/substitutes`, {
      params,
    });
  }

  listDiscomfort(region?: string) {
    const params = region ? { region } : undefined;
    return this.http.get<DiscomfortDto[]>(`${this.api}/discomfort`, { params });
  }

  createDiscomfort(draft: DiscomfortDraft) {
    return this.http.post<DiscomfortDto>(`${this.api}/discomfort`, draft);
  }

  updateDiscomfort(id: string, draft: Partial<DiscomfortDraft>) {
    return this.http.patch<DiscomfortDto>(`${this.api}/discomfort/${id}`, draft);
  }

  removeDiscomfort(id: string) {
    return this.http.delete<{ ok: true }>(`${this.api}/discomfort/${id}`);
  }
}
