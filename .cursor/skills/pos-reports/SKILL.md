---
name: pos-reports
description: Implements unified weekly recap and coach-style reports across all Personal OS modules. Use when implementing the reports scenario or Your Week aggregation.
---

# Reports

Project skill only. Allowed: `api/src/modules/reports/**`, `src/app/features/reports/**`, `src/app/core/api/reports.api.ts`, `shared/recap/**`.

## APIs

- `GET /api/reports/week?start=` aggregates **from `ActivityEvent` plus thin counts** (do not import other feature services if that causes circular modules — query events + optional raw SQL/EM counts).
- Sections: Fitness, Goals, Habits, Entertainment, Finance, Overall (XP, level, longest streak).
- Deterministic template sentences, e.g. `You trained 4/4 planned days, increased volume by 8%, and achieved 3 PRs.`
- `GET /api/reports/coach` JSON for print: frequency, volume, PRs, progression, muscle mix, consistency, recent history.
- Frontend print stylesheet + `window.print()`.

## UI

This week card: 4/4 workouts, 3 PRs, books, €427, goals progressed. Not exercise-only. Export `reports.routes.ts`.

## Do not

- Call an LLM. Do not edit hotspots.
