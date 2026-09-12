---
name: pos-entertainment
description: Implements the media library (anime, manga, books, movies, YouTube) for Ascend OS. Use when implementing the entertainment scenario or Library card.
---

# Entertainment

Project skill only. Allowed: `api/src/modules/entertainment/**`, `src/app/features/entertainment/**`, `src/app/core/api/media.api.ts`, `shared/media/**`.

## Domain

- `MediaItem`: type `anime|manga|book|movie|novel|youtube`, title, posterUrl, status.
- `MediaProgress`: episode/pages, rating, completedAt.
- `POST /api/media/:id/progress` → `MEDIA_PROGRESS` (20 XP page-chunk). Complete → `MEDIA_COMPLETED` (50 XP).

## UI

Port `personal-os/modules/EntertainmentView.tsx` onto PrimeNG (`Tabs`, `DataView`, `Gallery`, `Rating`, `Dialog`, `ProgressBar`). `app-page-header`. Keep live library data: One Piece / Dune, poster grid, `+ Add item`. Year heatmap via `app-pos-heatmap`. Export `entertainment.routes.ts`.

## Do not

- Edit `app.module.ts` / `app.routes.ts`.
- Store posters as public user uploads unless using URL fields.
