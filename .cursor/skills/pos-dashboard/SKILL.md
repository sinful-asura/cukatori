---
name: pos-dashboard
description: Builds dashboard, timeline, achievements, and settings pages matching the landing preview card. Use when implementing the dashboard scenario or Good morning Kristijan home.
---

# Dashboard + timeline

Project skill only. Allowed: `src/app/features/{dashboard,timeline,achievements,settings}/**`, `src/app/core/api/achievements.api.ts`.

## Dashboard

Reproduce the floating preview on `.cursor/references/ui-landing.jpg`:

- `Good morning, Kristijan` + `Small steps every day lead to big results.`
- Level 18 · 2,840 / 3,000 XP · 12-day streak · quote pill
- Today checklist + Goals meters
- Weekly activity heatmap
- User chip Kristijan level 18

Compose via `MeApi`, `HabitsApi`, `GoalsApi`, `ActivityApi`. If a client is missing, create a thin one **only** under `src/app/core/api/` if that path is allowed — otherwise stub signals with seed-shaped data and list gaps in `INTEGRATION.md`.

## Other pages

- Timeline: chronological `ActivityEvent` rows, filters category/type/tag/date.
- Achievements: unlocked + locked grid, not game inventory.
- Settings: theme, units kg, currency EUR.

Export `*.routes.ts`. Do not edit `app.routes.ts`.
