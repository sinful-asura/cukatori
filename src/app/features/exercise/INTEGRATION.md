# Exercise core integration

Do not edit hotspots from this scenario. Orchestrator should apply the notes below.

## Nest (`api/src/app.module.ts`)

Import both modules. MikroORM already globs `src/**/*.entity.ts`, so `mikro-orm.config.ts` does not need a change.

```ts
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { ExerciseLibraryModule } from './modules/exercise-library/exercise-library.module.js';
import { ExerciseModule } from './modules/exercise/exercise.module.js';

imports: [
  // …
  CatalogModule,
  ExerciseLibraryModule,
  ExerciseModule,
]
```

`ExerciseModule` already imports `CatalogModule`, `ActivityModule`, and `AuthModule`. Importing `ExerciseModule` alone also registers `GET /api/exercises` (loggable catalog ids). `ExerciseLibraryModule` is the public MuscleWiki browse API at `GET /api/exercise-library` — keep it off `/exercises` so substitutes stay on `GET /api/exercises/:id/substitutes`.

## Shared barrel (`shared/index.ts`)

Frontend imports `@ascend-os/shared/exercise` (path-mapped). Optional barrel add:

```ts
export * from './exercise';
```

## Nest contracts (`api/src/contracts/exercise-library.ts`)

Keep in sync with `shared/exercise/catalog.ts`. Nest cannot import repo-root `shared/`.

Optional empty `MUSCLEWIKI_API_KEY` in `.env` — the module then serves the bundled 16-lift catalogue and reports `fallbackReason`.

## Routes

`/os/exercise` already lazy-loads `EXERCISE_ROUTES`. No `app.routes.ts` change.

## Activity

`POST /api/workouts/:id/complete` emits `WORKOUT_COMPLETED` (180 XP) and one `PERSONAL_RECORD` (40 XP) per new max weight / reps / e1RM / lift volume. This module does not write `XpLedger` or `Streak`.

## Demo

First authenticated `GET /api/workouts` or `GET /api/exercises` seeds ~109 catalog lifts plus Kristijan’s Back & Biceps pair (Wed Sep 10, 6,420 kg, 14 sets, 3 PRs, possible +8%). Until the modules are registered, the page shows that snapshot from local fallback data.

## UI

`/os/exercise` uses `app-page-header` (title = last session name, kicker = `Last session · Sep 10, 2026`) plus PrimeNG Tabs / Table / ProgressBar / Card (`pos-panel`) / Tag. Overview matches Personal OS ExerciseView: featured lifts, PosStat KPIs, hedged recap, muscle bars, session log, and PRs. The Exercises tab is the MuscleWiki library (`app-exercise-library`): search, muscle/equipment/difficulty filters, paging, and a detail panel with demonstration video. Logging a set from the library name-matches against `/api/exercises`. Do not edit `body-map/` or `insights/` from this scenario.
