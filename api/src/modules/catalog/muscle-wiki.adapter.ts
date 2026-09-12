import { Injectable } from '@nestjs/common';
import { CATALOG_SEED, type CatalogSeedExercise } from './catalog.seed.js';
import type { MuscleWikiPort, MuscleWikiQuery } from './muscle-wiki.port.js';

/**
 * Local catalog port. Reads the bundled JSON-shaped seed today;
 * a live MuscleWiki fetch can replace `list` later without changing callers.
 */
@Injectable()
export class MuscleWikiAdapter implements MuscleWikiPort {
  list(query: MuscleWikiQuery): Promise<CatalogSeedExercise[]> {
    const muscle = query.muscle?.trim().toLowerCase();
    const q = query.q?.trim().toLowerCase();
    const rows = CATALOG_SEED.filter((exercise) => {
      if (muscle && !matchesMuscle(exercise, muscle)) {
        return false;
      }
      if (q && !matchesQuery(exercise, q)) {
        return false;
      }
      return true;
    });
    return Promise.resolve(rows);
  }

  bySlug(slug: string): Promise<CatalogSeedExercise | null> {
    return Promise.resolve(CATALOG_SEED.find((exercise) => exercise.slug === slug) ?? null);
  }
}

function matchesMuscle(exercise: CatalogSeedExercise, muscle: string): boolean {
  return (
    exercise.primaryMuscle === muscle ||
    exercise.secondaryMuscles.includes(muscle as CatalogSeedExercise['primaryMuscle'])
  );
}

function matchesQuery(exercise: CatalogSeedExercise, q: string): boolean {
  const haystack = [exercise.name, exercise.slug, ...exercise.aliases].join(' ').toLowerCase();
  return haystack.includes(q);
}
