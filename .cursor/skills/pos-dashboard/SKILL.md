---
name: pos-dashboard
description: Builds dashboard, timeline, achievements, and settings pages matching Personal OS. Use when implementing the dashboard scenario or Today overview home.
---

# Dashboard + timeline

Project skill only. Allowed: `src/app/features/{dashboard,timeline,achievements,settings}/**`, `src/app/core/api/achievements.api.ts`.

Visual source: `.cursor/references/DESIGN.md` and `.cursor/references/personal-os/`. Use PrimeNG 22 + `src/app/shared/ui/pos/`.

## Dashboard

Match `personal-os/dashboard/DashboardView.tsx` exactly:

- `app-page-header` title **Today overview**, kicker `Track your habits, workouts, and spending over time.`
- Header actions: PrimeNG `Select` “All modules” + “Last 7 days”
- 32px `app-pos-stat` row from live APIs (streak, habits done, workouts, pages, spent, XP). Kristijan seed: 12-day streak, level 18, 2,840 XP.
- Two `p-card.pos-panel`: Activity this week + Category mix with `app-pos-chart-toggle` and `app-pos-line-chart` / `app-pos-bar-chart`
- Hourly breakdown `p-table` (Time / Habit / Exercise / Media / Spend / XP)

Compose via `MeApi`, `HabitsApi`, `GoalsApi`, `ActivityApi`. If a client is missing, create a thin one **only** under `src/app/core/api/` if that path is allowed — otherwise stub signals with seed-shaped data and list gaps in `INTEGRATION.md`.

## Other pages

Port from `personal-os/modules/SimpleViews.tsx`:

- Timeline: `PageHeader` Understand / Timeline + `p-timeline` or table of `ActivityEvent` rows, filters via PrimeNG `Select`
- Achievements: Achieve / Achievements 2-col `p-card.pos-panel` grid (unlocked + locked 50% opacity)
- Settings: System / Settings rows — theme Dark, units kg, currency EUR (`Select` / `ToggleButton`)

Export `*.routes.ts`. Do not edit `app.routes.ts`.
