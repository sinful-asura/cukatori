import { Injectable, Logger } from '@nestjs/common';
import type {
  LibraryDifficulty,
  LibraryExerciseDto,
  LibraryForce,
  LibraryMechanic,
} from '../../contracts/exercise-library.js';

/** Shape MuscleWiki actually returns: snake_case, most fields nullable. */
export interface UpstreamExercise {
  id: number | string;
  name: string;
  primary_muscles?: string[] | null;
  category?: string | null;
  force?: string | null;
  grips?: string[] | null;
  mechanic?: string | null;
  difficulty?: string | null;
  steps?: string[] | null;
  videos?: unknown[] | null;
  bodymap_male?: string | null;
  bodymap_female?: string | null;
}

/** Raised when MuscleWiki answers but refuses the request. */
export class MuscleWikiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'MuscleWikiError';
  }
}

export interface UpstreamPage<T> {
  total: number;
  limit: number;
  offset: number;
  count: number;
  results: T[];
}

const FORCES: LibraryForce[] = ['push', 'pull', 'static'];
const MECHANICS: LibraryMechanic[] = ['isolation', 'compound'];
const DIFFICULTIES: LibraryDifficulty[] = ['novice', 'intermediate', 'advanced'];

/**
 * Talks to api.musclewiki.com. The key lives here and never reaches the browser —
 * upstream bills per key and sends no CORS headers, so the frontend must go through us.
 */
@Injectable()
export class MuscleWikiClient {
  private readonly logger = new Logger(MuscleWikiClient.name);
  private readonly baseUrl = (
    process.env.MUSCLEWIKI_BASE_URL ?? 'https://api.musclewiki.com'
  ).replace(/\/$/, '');
  private readonly apiKey = process.env.MUSCLEWIKI_API_KEY?.trim() ?? '';
  private readonly timeoutMs = Number(process.env.MUSCLEWIKI_TIMEOUT_MS ?? 8000);

  /** Without a key every upstream call is a guaranteed 401, so callers fall straight back. */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  async get<T>(path: string, params: Record<string, string | number | undefined>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }

    const response = await fetch(url, {
      headers: { 'X-API-Key': this.apiKey, Accept: 'application/json' },
      signal: AbortSignal.timeout(this.timeoutMs),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new MuscleWikiError(
        response.status,
        `MuscleWiki ${path} responded ${response.status}: ${body.slice(0, 200)}`,
      );
    }

    return (await response.json()) as T;
  }

  /**
   * Upstream omits everything but `id` and `name` unless `detail=true`, and still returns
   * nulls for optional fields — normalise once here so nothing downstream repeats it.
   */
  normalise(raw: UpstreamExercise): LibraryExerciseDto {
    return {
      id: String(raw.id),
      name: raw.name,
      primaryMuscles: raw.primary_muscles ?? [],
      category: raw.category ?? null,
      force: this.oneOf(raw.force, FORCES),
      grips: raw.grips ?? [],
      mechanic: this.oneOf(raw.mechanic, MECHANICS),
      difficulty: this.oneOf(raw.difficulty, DIFFICULTIES),
      steps: raw.steps ?? [],
      videos: (raw.videos ?? []).map((video) => this.normaliseVideo(video)),
      bodymap: { male: raw.bodymap_male ?? null, female: raw.bodymap_female ?? null },
    };
  }

  /** The docs never pin the video object down, so accept either a bare URL or an object. */
  private normaliseVideo(video: unknown): LibraryExerciseDto['videos'][number] {
    if (typeof video === 'string') {
      return { url: video, variant: null, thumbnail: null };
    }
    const record = (video ?? {}) as Record<string, unknown>;
    const url = record['url'] ?? record['video'] ?? record['file'];
    return {
      url: typeof url === 'string' ? url : '',
      variant: typeof record['type'] === 'string' ? record['type'] : null,
      thumbnail: typeof record['thumbnail'] === 'string' ? record['thumbnail'] : null,
    };
  }

  private oneOf<T extends string>(value: string | null | undefined, allowed: T[]): T | null {
    const candidate = value?.toLowerCase();
    return allowed.find((option) => option === candidate) ?? null;
  }
}
