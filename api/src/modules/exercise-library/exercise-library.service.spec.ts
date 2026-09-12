import { describe, expect, it, vi } from 'vitest';
import { ExerciseLibraryService } from './exercise-library.service.js';
import { MuscleWikiClient, MuscleWikiError } from './musclewiki.client.js';

describe('ExerciseLibraryService (unkeyed → bundled catalogue)', () => {
  const service = new ExerciseLibraryService(new MuscleWikiClient());

  it('paginates', async () => {
    const page = await service.list({ limit: 5, offset: 0 });
    expect(page.source).toBe('fallback');
    expect(page.results).toHaveLength(5);
    expect(page.total).toBeGreaterThan(5);
    expect(page.results[0].name).toBeTruthy();
  });

  it('filters by muscle, case-insensitively', async () => {
    const page = await service.list({ muscle: 'chest' });
    expect(page.total).toBeGreaterThan(0);
    expect(page.results.every((e) => e.primaryMuscles.some((m) => m.toLowerCase() === 'chest'))).toBe(true);
  });

  it('searches by name', async () => {
    const page = await service.list({ search: 'squat' });
    expect(page.results.map((e) => e.name)).toEqual(
      expect.arrayContaining(['Barbell Back Squat', 'Goblet Squat']),
    );
  });

  it('filters by difficulty and category', async () => {
    const page = await service.list({ difficulty: 'advanced', category: 'Barbell' });
    expect(page.results.map((e) => e.name)).toEqual(['Conventional Deadlift']);
  });

  it('exposes filter values', async () => {
    const filters = await service.filters();
    expect(filters.muscles).toContain('Chest');
    expect(filters.categories).toContain('Dumbbell');
    expect(filters.difficulties).toHaveLength(3);
  });

  it('returns one exercise and 404s on unknown ids', async () => {
    await expect(service.byId('plank')).resolves.toMatchObject({ name: 'Plank' });
    await expect(service.byId('nope')).rejects.toThrow(/Unknown exercise/);
  });
});

describe('ExerciseLibraryService (upstream refuses the key)', () => {
  function serviceRefusing(status: number) {
    const client = new MuscleWikiClient();
    let calls = 0;
    vi.spyOn(client, 'isConfigured').mockReturnValue(true);
    vi.spyOn(client, 'get').mockImplementation(() => {
      calls += 1;
      return Promise.reject(new MuscleWikiError(status, `refused ${status}`));
    });
    return { service: new ExerciseLibraryService(client), calls: () => calls };
  }

  it('falls back and reports the tier as the reason on 403', async () => {
    const { service } = serviceRefusing(403);
    const page = await service.list({ limit: 3 });
    expect(page.source).toBe('fallback');
    expect(page.fallbackReason).toBe('tier-restricted');
    expect(page.results).toHaveLength(3);
  });

  it('stops re-calling a refusing upstream', async () => {
    const { service, calls } = serviceRefusing(403);
    await service.list({ limit: 1 });
    await service.list({ limit: 2 });
    await service.filters();
    // One doomed request, then the cooldown answers locally.
    expect(calls()).toBe(1);
  });

  it('treats a 500 as transient rather than a tier problem', async () => {
    const { service } = serviceRefusing(500);
    const page = await service.list({ limit: 1 });
    expect(page.fallbackReason).toBe('upstream-unavailable');
  });
});

describe('bundled catalogue media', () => {
  const service = new ExerciseLibraryService(new MuscleWikiClient());

  it('attaches front and side clips where MuscleWiki publishes them', async () => {
    const page = await service.list({ limit: 100 });
    const withVideo = page.results.filter((exercise) => exercise.videos.length > 0);
    expect(withVideo.length).toBeGreaterThanOrEqual(9);
    for (const exercise of withVideo) {
      expect(exercise.videos.map((video) => video.variant)).toEqual(['front', 'side']);
      for (const video of exercise.videos) {
        expect(video.url).toMatch(
          /^https:\/\/media\.musclewiki\.com\/media\/uploads\/videos\/branded\/.+\.mp4$/,
        );
      }
    }
  });

  it('leaves videos empty rather than guessing a 404 URL', async () => {
    const page = await service.list({ search: 'plank' });
    expect(page.results[0].videos).toEqual([]);
  });
});
