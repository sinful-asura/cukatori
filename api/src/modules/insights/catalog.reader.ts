import { Injectable } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { FALLBACK_CATALOG, type CatalogExercise } from './catalog.fallback.js';

@Injectable()
export class CatalogReader {
  constructor(private readonly em: EntityManager) {}

  async list(): Promise<CatalogExercise[]> {
    const rows = await this.trySelect('exercises');
    if (!rows?.length) {
      return FALLBACK_CATALOG;
    }
    const mapped = rows
      .map((row) => this.normalize(row))
      .filter((row): row is CatalogExercise => row !== null);
    return mapped.length ? mapped : FALLBACK_CATALOG;
  }

  async byId(id: string): Promise<CatalogExercise | null> {
    const all = await this.list();
    return all.find((item) => item.id === id || item.slug === id) ?? null;
  }

  private async trySelect(table: string): Promise<Record<string, unknown>[] | null> {
    try {
      const rows = await this.em.getConnection().execute(`SELECT * FROM ${table} LIMIT 800`);
      return Array.isArray(rows) ? (rows as Record<string, unknown>[]) : null;
    } catch {
      return null;
    }
  }

  private normalize(row: Record<string, unknown>): CatalogExercise | null {
    const name = str(pick(row, ['name', 'title']));
    if (!name) {
      return null;
    }
    const id = str(pick(row, ['id', 'uuid'])) || slugify(name);
    const slug = str(pick(row, ['slug'])) || slugify(name);
    const primaryMuscle = slugify(
      str(pick(row, ['primaryMuscle', 'primary_muscle', 'primary', 'muscle'])) || 'chest',
    );
    return {
      id,
      slug,
      name,
      primaryMuscle,
      secondaryMuscles: strings(
        pick(row, ['secondaryMuscles', 'secondary_muscles', 'secondary', 'secondaries']),
      ).map(slugify),
      equipment: slugify(str(pick(row, ['equipment'])) || 'other'),
      pattern: slugify(str(pick(row, ['pattern', 'movementPattern', 'movement_pattern'])) || 'other'),
      type: slugify(str(pick(row, ['type', 'exerciseType', 'exercise_type'])) || 'compound'),
      difficulty: slugify(str(pick(row, ['difficulty', 'level'])) || 'intermediate'),
    };
  }
}

function pick(row: Record<string, unknown>, keys: string[]): unknown {
  const lower = Object.fromEntries(Object.entries(row).map(([key, value]) => [key.toLowerCase(), value]));
  for (const key of keys) {
    if (row[key] !== undefined && row[key] !== null) {
      return row[key];
    }
    const found = lower[key.toLowerCase()];
    if (found !== undefined && found !== null) {
      return found;
    }
  }
  return undefined;
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : value != null ? String(value) : '';
}

function strings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => str(item)).filter(Boolean);
  }
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => str(item)).filter(Boolean);
      }
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
