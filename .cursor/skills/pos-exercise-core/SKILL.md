---
name: pos-exercise-core
description: Implements exercise catalog, workout logging, session summaries, and PR detection. Use when implementing the exercise-core scenario or MuscleWiki-style catalog.
---

# Exercise core

Project skill only. Allowed: `api/src/modules/{exercise,catalog}/**`, `src/app/features/exercise/**`, `src/app/core/api/exercise.api.ts`, `shared/exercise/**`.

## Catalog

- `Exercise` entity + local JSON seed (~80–120 lifts): name, slug, primaryMuscle, secondary[], equipment, pattern, type, difficulty, aliases.
- `MuscleWikiAdapter` port: local JSON now; live fetch optional later.
- `GET /api/exercises?muscle=&q=`

## Workouts

- `Workout` + `WorkoutSet`. `POST /api/workouts/:id/complete` computes duration, sets, volume, vs last equivalent, e1RM (`w * (1 + reps/30)`), muscle mix, XP 180.
- Emit `WORKOUT_COMPLETED`. On new max weight/reps/e1RM/volume emit `PERSONAL_RECORD` (40 XP).
- `GET /api/prs`

## UI

Port `personal-os/modules/ExerciseView.tsx` onto PrimeNG. Last session **Back & Biceps**, Wed Sep 10, 48 min, 6,420 kg, 14 sets, 3 PRs, +8% copy, muscle activation via `ProgressBar`, log `Table`. Tabs: Overview / Workouts / Exercises / Muscles. `app-page-header` + `p-card.pos-panel`. Export `exercise.routes.ts`.

Hedged copy only. No medical claims.

**Do not edit** `src/app/features/exercise/body-map/**` or `insights/**` (exercise-intel).

## Do not

- Implement photos, plateau, deload, BodyMap SVG (exercise-intel).
- Edit `app.module.ts` / `app.routes.ts`.
