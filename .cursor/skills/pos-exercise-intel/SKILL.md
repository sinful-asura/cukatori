---
name: pos-exercise-intel
description: Implements BodyMap, substitutions, discomfort, plateau, deload, heatmaps, and private progress photos. Use when implementing the exercise-intel scenario or swap-exercise engine.
---

# Exercise intelligence

Project skill only. Allowed: `api/src/modules/{photos,insights}/**`, `src/app/features/photos/**`, `src/app/features/exercise/{body-map,insights}/**`, `src/app/core/api/{photos,insights}.api.ts`.

## APIs

- `GET /api/exercises/:id/substitutes?discomfort=` — score muscle + pattern + equipment − flagged region. Deterministic.
- `CRUD /api/discomfort` — region, side, description, severity, exercise?, tags.
- `GET /api/insights/plateaus` — ~4 weeks flat e1RM → `Possible plateau`.
- `GET /api/insights/deload` — volume/frequency/decline → dismissible `Consider a lighter week.`
- `GET /api/heatmaps/:kind?year=` — `training|habits|activity`.
- Photos multipart; `GET /api/photos/:id/file` auth-only. Types front/back/side/other. Gallery + compare slider.

## UI

Personal OS tokens (`.cursor/references/DESIGN.md`). SVG BodyMap (`data-muscle` ids = catalog `primaryMuscle`) wrapped in `p-card.pos-panel`. Insights + photos: `app-page-header`, PrimeNG `Tabs` / `Gallery` / `Compare` / `FileUpload` / `Message` / `Tag`. Hedged language only. No body-composition analysis.

## Do not

- Reimplement workout complete / PR math (exercise-core).
- Edit hotspots; add `INTEGRATION.md`.
