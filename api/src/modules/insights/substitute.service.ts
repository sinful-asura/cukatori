import { Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/postgresql';
import { CatalogReader } from './catalog.reader.js';
import { REGION_PATTERNS, type CatalogExercise } from './catalog.fallback.js';
import { Discomfort } from './discomfort.entity.js';

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

@Injectable()
export class SubstituteService {
  constructor(
    private readonly catalog: CatalogReader,
    private readonly em: EntityManager,
  ) {}

  async list(userId: string, exerciseId: string, discomfortQuery?: string) {
    const source = await this.catalog.byId(exerciseId);
    if (!source) {
      throw new NotFoundException('Exercise not found.');
    }
    const flagged = await this.resolveFlag(userId, discomfortQuery);
    const catalog = await this.catalog.list();
    const substitutes = catalog
      .filter((item) => item.id !== source.id && item.slug !== source.slug)
      .map((item) => score(source, item, flagged?.region))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    return {
      source: {
        id: source.id,
        name: source.name,
        primaryMuscle: source.primaryMuscle,
        pattern: source.pattern,
        equipment: source.equipment,
      },
      discomfort: flagged
        ? {
            id: flagged.id,
            region: flagged.region,
            side: flagged.side,
            note: `You marked ${label(flagged.region)} discomfort.`,
          }
        : null,
      substitutes,
    };
  }

  private async resolveFlag(userId: string, query?: string) {
    if (!query?.trim()) {
      return null;
    }
    const value = query.trim();
    const byId = await this.em.findOne(Discomfort, { id: value, user: userId });
    if (byId) {
      return byId;
    }
    const region = value.replace(/^left-|^right-/, '');
    const recent = await this.em.find(
      Discomfort,
      { user: userId, region },
      { orderBy: { createdAt: 'DESC' }, limit: 1 },
    );
    return recent[0] ?? { id: null, region, side: 'both' as const };
  }
}

function score(source: CatalogExercise, candidate: CatalogExercise, flagged?: string): SubstituteHit {
  let points = 0;
  const reasons: string[] = [];

  if (candidate.primaryMuscle === source.primaryMuscle) {
    points += 40;
    reasons.push('Same primary muscle');
  }
  if (candidate.secondaryMuscles.includes(source.primaryMuscle)) {
    points += 15;
    reasons.push('Overlaps the target muscle');
  }
  if (source.secondaryMuscles.includes(candidate.primaryMuscle)) {
    points += 10;
  }
  const shared = candidate.secondaryMuscles.filter((muscle) => source.secondaryMuscles.includes(muscle));
  if (shared.length) {
    points += Math.min(15, shared.length * 5);
  }
  if (candidate.pattern === source.pattern) {
    points += 25;
    reasons.push('Similar movement pattern');
  }
  if (candidate.equipment === source.equipment) {
    points += 15;
    reasons.push('Same equipment');
  } else if (sameFamily(source.equipment, candidate.equipment)) {
    points += 8;
    reasons.push('Nearby equipment');
  }
  if (candidate.type === source.type) {
    points += 5;
  }
  if (candidate.difficulty === source.difficulty) {
    points += 3;
  }

  if (flagged) {
    if (candidate.primaryMuscle === flagged) {
      points -= 50;
      reasons.push('This exercise may involve the movement you flagged.');
    } else if (candidate.secondaryMuscles.includes(flagged)) {
      points -= 20;
      reasons.push('This exercise may involve the movement you flagged.');
    } else if ((REGION_PATTERNS[flagged] ?? []).includes(candidate.pattern)) {
      points -= 15;
      reasons.push('This exercise may involve the movement you flagged.');
    } else {
      reasons.push('Avoids the region you flagged');
    }
  }

  return {
    id: candidate.id,
    name: candidate.name,
    slug: candidate.slug,
    primaryMuscle: candidate.primaryMuscle,
    equipment: candidate.equipment,
    pattern: candidate.pattern,
    score: points,
    reasons: reasons.slice(0, 4),
  };
}

function sameFamily(a: string, b: string): boolean {
  const free = new Set(['barbell', 'dumbbell', 'kettlebell']);
  const machine = new Set(['machine', 'cable']);
  return (free.has(a) && free.has(b)) || (machine.has(a) && machine.has(b));
}

function label(region: string): string {
  if (region === 'shoulders') {
    return 'shoulder';
  }
  return region.replace(/-/g, ' ');
}
