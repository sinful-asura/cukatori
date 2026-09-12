import type { CatalogSeedExercise } from './catalog.seed.js';

export interface MuscleWikiQuery {
  muscle?: string;
  q?: string;
}

export interface MuscleWikiPort {
  list(query: MuscleWikiQuery): Promise<CatalogSeedExercise[]>;
  bySlug(slug: string): Promise<CatalogSeedExercise | null>;
}
