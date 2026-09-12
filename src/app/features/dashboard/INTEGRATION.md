# Dashboard integration

Routes are already lazy-loaded from `app.routes.ts` (`/os/dashboard`, `/os/timeline`, `/os/achievements`, `/os/settings`). Do not edit that hotspot or `app-shell`.

## Missing clients

`MeApi`, `HabitsApi`, `GoalsApi`, and `ActivityApi` live in sibling scenarios. This slice does **not** add `habits.api.ts` or `goals.api.ts`. Pages hydrate with `HttpClient` against:

- `GET /api/me/stats`
- `GET /api/habits`
- `GET /api/goals`
- `GET /api/timeline` (fallback `GET /api/activity`)
- `GET /api/achievements` via `AchievementsApi`

If those calls fail, Kristijan seed-shaped signals stay in place (level 18, 2,840 / 3,000 XP, 12-day streak).

## Settings

Theme / units (`kg`) / currency (`EUR`) persist in `localStorage` (`ascend.settings`). Theme toggles `html.app-dark`. No preferences API yet.

## Shell

User chip in the rail is owned by `app-shell`. The dashboard page repeats a Kristijan · Level 18 `p-chip` so the home preview stays intact if the landing embeds this page.

Settings lives at `/os/settings`. The rail has no Settings link yet — add one in `app-shell` when that hotspot is open.
