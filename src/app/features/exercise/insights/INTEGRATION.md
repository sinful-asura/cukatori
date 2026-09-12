# exercise-intel hotspot notes

UI in this slice uses `app-page-header`, `p-card.pos-panel`, and `app-pos-heatmap` (read-only shared widgets). Do not restyle the main exercise catalog/workout page from here.

Do not apply from this worktree. Orchestrator-only files:

- `api/src/app.module.ts`
- `src/app/app.routes.ts`
- `src/app/features/exercise/exercise.routes.ts`
- `src/app/core/layout/**`
- `shared/activity/**` + `api/src/contracts/activity.ts`

## Nest

```ts
import { InsightsModule } from './modules/insights/insights.module.js';
import { PhotosModule } from './modules/photos/photos.module.js';

@Module({
  imports: [
    // …
    InsightsModule,
    PhotosModule,
  ],
})
export class AppModule {}
```

MikroORM already globs `src/**/*.entity.ts`. Photo files land in `api/uploads/photos` (already gitignored).

## Angular routes

`src/app/app.routes.ts` (inside `/os` children):

```ts
{
  path: 'photos',
  loadChildren: () =>
    import('./features/photos/photos.routes').then((m) => m.PHOTOS_ROUTES),
},
```

`src/app/features/exercise/exercise.routes.ts`:

```ts
{
  path: 'insights',
  loadChildren: () =>
    import('./insights/insights.routes').then((m) => m.INSIGHTS_ROUTES),
},
```

Optional rail chip: `{ path: '/os/exercise/insights', label: 'Insights' }` and `{ path: '/os/photos', label: 'Photos' }`.

## Activity types

Writes emit through `ActivityBus` with `xp: 0`. Add these to the shared union (and XP table as 0):

- `PHOTO_UPLOADED`
- `DISCOMFORT_LOGGED`
- `DELOAD_DISMISSED`

## exercise-core contract

- `GET /api/exercises/:id/substitutes?discomfort=` lives in InsightsModule (same `/exercises` prefix).
- Catalog / sets are read if `exercises`, `workouts`, `workout_sets` exist; otherwise fallback catalog + `WORKOUT_COMPLETED` payloads (`exercises[]` or `sets[]` with weight/reps/e1rm).
- BodyMap `data-muscle` ids: `chest`, `shoulders`, `biceps`, `triceps`, `forearms`, `abs`, `obliques`, `quads`, `hamstrings`, `glutes`, `calves`, `traps`, `lats`, `mid-back`, `lower-back`, `adductors`, `neck`.
