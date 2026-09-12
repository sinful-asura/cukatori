/** Keep in sync with `shared/exercise/catalog.ts`. Inlined so Nest rootDir stays `api/`. */

export type LibraryDifficulty = 'novice' | 'intermediate' | 'advanced';
export type LibraryForce = 'push' | 'pull' | 'static';
export type LibraryMechanic = 'isolation' | 'compound';

/** `musclewiki` means the upstream API answered; `fallback` means we served the bundled catalogue. */
export type LibrarySource = 'musclewiki' | 'fallback';

/** Why we served the bundled catalogue, so the UI can say something true. */
export type LibraryFallbackReason =
  | 'unconfigured'
  | 'tier-restricted'
  | 'upstream-unavailable';

export interface LibraryVideoDto {
  url: string;
  /** Upstream labels these by model, e.g. `male` / `female`. */
  variant: string | null;
  thumbnail: string | null;
}

/**
 * Normalised exercise. Upstream speaks snake_case and leaves most fields nullable;
 * the API layer flattens that so every consumer sees the same shape.
 */
export interface LibraryExerciseDto {
  id: string;
  name: string;
  primaryMuscles: string[];
  /** Equipment family: barbell, dumbbell, bodyweight, … */
  category: string | null;
  force: LibraryForce | null;
  grips: string[];
  mechanic: LibraryMechanic | null;
  difficulty: LibraryDifficulty | null;
  steps: string[];
  videos: LibraryVideoDto[];
  bodymap: { male: string | null; female: string | null };
}

export interface LibraryQuery {
  search?: string;
  muscle?: string;
  category?: string;
  difficulty?: LibraryDifficulty;
  limit?: number;
  offset?: number;
}

export interface LibraryPageDto {
  total: number;
  limit: number;
  offset: number;
  count: number;
  results: LibraryExerciseDto[];
  source: LibrarySource;
  fallbackReason?: LibraryFallbackReason;
}

export interface LibraryFiltersDto {
  muscles: string[];
  categories: string[];
  difficulties: LibraryDifficulty[];
  source: LibrarySource;
  fallbackReason?: LibraryFallbackReason;
}

export const LIBRARY_PAGE_SIZE = 24;
