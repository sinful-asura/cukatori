# Entertainment integration

Feature owns `shared/media`, `api/src/modules/entertainment`, `src/app/core/api/media.api.ts`, and this folder. `/os/entertainment` already lazy-loads `ENTERTAINMENT_ROUTES`.

## Hotspots (orchestrator only)

1. Import `EntertainmentModule` in `api/src/app.module.ts`.
2. Re-export DTOs from `shared/index.ts`: `export * from './media';`
3. No `app.routes.ts` change needed.
4. MikroORM glob already picks up `*.entity.ts` under the module — no `mikro-orm.config.ts` edit.

## Contracts

- `GET /api/media`, `GET /api/media/library`, `POST /api/media`, `PATCH|DELETE /api/media/:id`
- `GET /api/media/library` includes `heatmap` (182 days, intensity 0–4) from progress + completions
- `POST /api/media/:id/progress` emits `MEDIA_PROGRESS` (20 XP page-chunk) and `MEDIA_COMPLETED` (50 XP) via `ActivityBus`
- Posters are `posterUrl` strings only — no user uploads

## Demo

Module init (or first request) seeds Kristijan: One Piece watching, Dune reading, 7 completed, 42 hours, 4.5 rating, 3-day streak, plus 6-month heatmap history.

## UI

`/os/entertainment` ports Personal OS Library: `app-page-header`, PrimeNG Tabs / DataView / Gallery / Rating / Dialog / ProgressBar, `app-pos-heatmap`.
