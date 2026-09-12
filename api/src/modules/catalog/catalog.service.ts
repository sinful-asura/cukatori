import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { CATALOG_SEED } from './catalog.seed.js';
import { Exercise } from './exercise.entity.js';
import { MuscleWikiAdapter } from './muscle-wiki.adapter.js';

@Injectable()
export class CatalogService {
  constructor(
    private readonly em: EntityManager,
    private readonly muscleWiki: MuscleWikiAdapter,
  ) {}

  async ensureSeeded(): Promise<void> {
    const count = await this.em.count(Exercise);
    if (count > 0) {
      return;
    }
    const remote = await this.muscleWiki.list({});
    const source = remote.length ? remote : CATALOG_SEED;
    for (const row of source) {
      this.em.create(Exercise, {
        name: row.name,
        slug: row.slug,
        primaryMuscle: row.primaryMuscle,
        secondaryMuscles: row.secondaryMuscles,
        equipment: row.equipment,
        pattern: row.pattern,
        kind: row.kind,
        difficulty: row.difficulty,
        aliases: row.aliases,
      });
    }
    await this.em.flush();
  }

  async list(query: { muscle?: string; q?: string }) {
    await this.ensureSeeded();
    const muscle = query.muscle?.trim().toLowerCase();
    const q = query.q?.trim().toLowerCase();
    const rows = await this.em.find(Exercise, {}, { orderBy: { name: 'ASC' } });
    return rows
      .filter((exercise) => {
        if (
          muscle &&
          exercise.primaryMuscle !== muscle &&
          !exercise.secondaryMuscles.includes(muscle)
        ) {
          return false;
        }
        if (q) {
          const haystack = [exercise.name, exercise.slug, ...exercise.aliases]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(q)) {
            return false;
          }
        }
        return true;
      })
      .map((exercise) => this.toDto(exercise));
  }

  async get(idOrSlug: string) {
    await this.ensureSeeded();
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );
    const exercise = isUuid
      ? await this.em.findOne(Exercise, { id: idOrSlug })
      : await this.em.findOne(Exercise, { slug: idOrSlug });
    return exercise ? this.toDto(exercise) : null;
  }

  toDto(exercise: Exercise) {
    return {
      id: exercise.id,
      name: exercise.name,
      slug: exercise.slug,
      primaryMuscle: exercise.primaryMuscle,
      secondaryMuscles: exercise.secondaryMuscles,
      equipment: exercise.equipment,
      pattern: exercise.pattern,
      kind: exercise.kind,
      difficulty: exercise.difficulty,
      aliases: exercise.aliases,
    };
  }
}
