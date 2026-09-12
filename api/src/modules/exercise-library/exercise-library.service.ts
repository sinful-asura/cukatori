import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  LIBRARY_PAGE_SIZE,
  type LibraryFallbackReason,
  type LibraryExerciseDto,
  type LibraryFiltersDto,
  type LibraryPageDto,
  type LibraryQuery,
} from '../../contracts/exercise-library.js';
import { LIBRARY_FALLBACK } from './exercise-library.fallback.js';
import {
  MuscleWikiClient,
  MuscleWikiError,
  type UpstreamExercise,
  type UpstreamPage,
} from './musclewiki.client.js';

const CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_LIMIT = 100;
/** A refused key or wrong tier will not fix itself; stop asking for a while. */
const REFUSED_COOLDOWN_MS = 30 * 60 * 1000;
/** A timeout or 5xx might clear on its own, so retry sooner. */
const TRANSIENT_COOLDOWN_MS = 60 * 1000;

@Injectable()
export class ExerciseLibraryService {
  private readonly logger = new Logger(ExerciseLibraryService.name);
  /** Upstream bills per request and the catalogue barely changes, so repeat queries are cached. */
  private readonly cache = new Map<string, { expiresAt: number; value: unknown }>();
  private warnedUnconfigured = false;
  /** Set while upstream is known to be refusing; until then every call serves fallback. */
  private cooldownUntil = 0;
  private cooldownReason: LibraryFallbackReason = 'upstream-unavailable';

  constructor(private readonly client: MuscleWikiClient) {}

  async list(query: LibraryQuery): Promise<LibraryPageDto> {
    const limit = Math.min(Math.max(query.limit ?? LIBRARY_PAGE_SIZE, 1), MAX_LIMIT);
    const offset = Math.max(query.offset ?? 0, 0);
    const search = query.search?.trim();

    return this.withFallback<LibraryPageDto>(
      `list:${JSON.stringify({ ...query, limit, offset, search })}`,
      async () => {
        const page = await this.client.get<UpstreamPage<UpstreamExercise>>('/exercises', {
          limit,
          offset,
          // Upstream returns id + name only without this; the cards need muscles and equipment.
          detail: 'true',
          // Their minimum is 2 characters — anything shorter is a 422, so drop it.
          search: search && search.length >= 2 ? search : undefined,
          muscles: query.muscle,
          category: query.category,
          difficulty: query.difficulty,
        });
        return {
          total: page.total,
          limit: page.limit ?? limit,
          offset: page.offset ?? offset,
          count: page.count ?? page.results.length,
          results: page.results.map((raw) => this.client.normalise(raw)),
          source: 'musclewiki',
        };
      },
      (reason) => this.listFromFallback({ ...query, limit, offset, search }, reason),
    );
  }

  async byId(id: string): Promise<LibraryExerciseDto> {
    const exercise = await this.withFallback(
      `exercise:${id}`,
      async () => this.client.normalise(await this.client.get(`/exercises/${id}`, {})),
      () => LIBRARY_FALLBACK.find((candidate) => candidate.id === id),
    );
    if (!exercise) {
      throw new NotFoundException(`Unknown exercise ${id}`);
    }
    return exercise;
  }

  /** Powers the filter bar. Derived from the fallback set when upstream is unavailable. */
  async filters(): Promise<LibraryFiltersDto> {
    return this.withFallback<LibraryFiltersDto>(
      'filters',
      async () => {
        const raw = await this.client.get<{
          muscles?: string[];
          categories?: string[];
          difficulty?: string[];
        }>('/filters', {});
        return {
          muscles: raw.muscles ?? [],
          categories: raw.categories ?? [],
          difficulties: (raw.difficulty ?? []) as LibraryFiltersDto['difficulties'],
          source: 'musclewiki',
        };
      },
      (reason) => ({
        fallbackReason: reason,
        muscles: this.distinct(LIBRARY_FALLBACK.flatMap((exercise) => exercise.primaryMuscles)),
        categories: this.distinct(
          LIBRARY_FALLBACK.map((exercise) => exercise.category).filter(
            (category): category is string => Boolean(category),
          ),
        ),
        difficulties: ['novice', 'intermediate', 'advanced'],
        source: 'fallback',
      }),
    );
  }

  private listFromFallback(
    query: LibraryQuery & { limit: number; offset: number },
    reason: LibraryFallbackReason,
  ): LibraryPageDto {
    const search = query.search?.toLowerCase();
    const matches = LIBRARY_FALLBACK.filter((exercise) => {
      if (search && !exercise.name.toLowerCase().includes(search)) {
        return false;
      }
      if (query.muscle && !exercise.primaryMuscles.some((muscle) => this.eq(muscle, query.muscle))) {
        return false;
      }
      if (query.category && !this.eq(exercise.category, query.category)) {
        return false;
      }
      if (query.difficulty && exercise.difficulty !== query.difficulty) {
        return false;
      }
      return true;
    });
    const results = matches.slice(query.offset, query.offset + query.limit);
    return {
      total: matches.length,
      limit: query.limit,
      offset: query.offset,
      count: results.length,
      results,
      source: 'fallback',
      fallbackReason: reason,
    };
  }

  /**
   * One rule for every endpoint: serve upstream when we can, otherwise degrade to the
   * bundled catalogue rather than failing the page. Only upstream answers are cached,
   * and a refusing upstream is left alone until its cooldown expires.
   */
  private async withFallback<T>(
    key: string,
    fromUpstream: () => Promise<T>,
    fromFallback: (reason: LibraryFallbackReason) => T,
  ): Promise<T> {
    if (!this.client.isConfigured()) {
      if (!this.warnedUnconfigured) {
        this.logger.warn('MUSCLEWIKI_API_KEY is not set — serving the bundled exercise catalogue.');
        this.warnedUnconfigured = true;
      }
      return fromFallback('unconfigured');
    }

    const cached = this.cache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value as T;
    }

    // Without this, a wrong-tier key costs a doomed round-trip on every single request.
    if (Date.now() < this.cooldownUntil) {
      return fromFallback(this.cooldownReason);
    }

    try {
      const value = await fromUpstream();
      this.cooldownUntil = 0;
      this.cache.set(key, { expiresAt: Date.now() + CACHE_TTL_MS, value });
      return value;
    } catch (error) {
      return fromFallback(this.enterCooldown(error));
    }
  }

  /** Classifies the failure, starts the matching cooldown and logs it once per window. */
  private enterCooldown(error: unknown): LibraryFallbackReason {
    const status = error instanceof MuscleWikiError ? error.status : 0;
    const refused = status === 401 || status === 403;
    this.cooldownReason = refused ? 'tier-restricted' : 'upstream-unavailable';
    this.cooldownUntil = Date.now() + (refused ? REFUSED_COOLDOWN_MS : TRANSIENT_COOLDOWN_MS);
    this.logger.warn(
      refused
        ? `MuscleWiki refused the key (${status}) — its plan does not allow direct API access. ` +
            'Serving the bundled catalogue; will retry in 30 minutes.'
        : `MuscleWiki unavailable (${(error as Error).message}) — serving the bundled catalogue.`,
    );
    return this.cooldownReason;
  }

  private distinct(values: string[]): string[] {
    return [...new Set(values)].sort((a, b) => a.localeCompare(b));
  }

  private eq(a: string | null | undefined, b: string | null | undefined): boolean {
    return (a ?? '').toLowerCase() === (b ?? '').toLowerCase();
  }
}
