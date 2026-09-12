---
name: pos-entertainment
description: Implements the media library (anime, manga, books, movies, YouTube) for Cukatori. Use when implementing the entertainment scenario or Library card.
---

# Entertainment

Project skill only. Allowed: `api/src/modules/entertainment/**`, `src/app/features/entertainment/**`, `src/app/core/api/media.api.ts`, `shared/media/**`.

## Domain

- `MediaItem`: type `anime|manga|book|movie|novel|youtube`, title, posterUrl, status.
- `MediaProgress`: episode/pages, rating, completedAt.
- `POST /api/media/:id/progress` → `MEDIA_PROGRESS` (20 XP page-chunk). Complete → `MEDIA_COMPLETED` (50 XP).

## UI (Enjoy what you love)

Match landing library card: tabs All / Anime / Manga / Books / YouTube, **Currently watching** One Piece, **Currently reading** Dune, recently completed poster grid, stats 42 hours / 7 completed / 4.5 rating / 3 streak. `+ Add item`. Export `entertainment.routes.ts`.

## Do not

- Edit `app.module.ts` / `app.routes.ts`.
- Store posters as public user uploads unless using URL fields.
