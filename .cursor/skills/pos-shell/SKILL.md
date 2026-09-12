---
name: pos-shell
description: Builds the Ascend OS marketing landing and app chrome to match ui-landing.jpg. Use when implementing the shell scenario, landing page, sidebar, or design tokens.
---

# Shell + landing

Project skill only. Visual source: `.cursor/references/ui-landing.jpg` and `.cursor/references/DESIGN.md`.

## Tokens (`src/styles.scss`)

Deep black `#07070b`, elevated `#101014`, card `#141418`, border `rgba(255,255,255,0.08)`, text `#f4f4f5`, muted `#8b8b93`, accent `#ff4d3a`, warm `#ff8a65`, radius 20px, Inter. Red-orange radial glow behind the hero. Dark first.

## Landing `/landing` (logged out; `/` redirects here)

- Nav: coral mark + **Ascend OS**, Product / Features / Pricing / Docs, Sign in, white **Get started** pill.
- Eyebrow `TRACK. IMPROVE. BECOME MORE.`
- Headline `Your life.` / `In one place.` (second line warm fade).
- Subcopy + `Get started →` + ghost Watch video.
- Four columns: Track everything / Build better habits / See real progress / A more intentional you.
- Right: floating dashboard preview card (can embed dashboard component).
- Below: four claim+preview cards — Exercise, Finance, Entertainment, Journal.

## App chrome (logged in, `/os`)

- `AppShell`: left rail (Dashboard, Goals, Habits, Exercise, Finance, Entertainment, Timeline, Achievements), user chip Kristijan, top search (opens quick-log later), date.
- Floating rounded frames, not a full-bleed grey admin theme.
- Prefer PrimeNG (`Card`, `Menu`, `Button`, `Avatar`, `Chip`) over new custom primitives. Component map: repo-root `AGENTS.md`.

## Routes

Export lazy `*.routes.ts` from feature folders if missing. You may edit `app.routes.ts` / `app.config.ts` / `app.html` (this scenario owns those hotspots). `provideHttpClient(withInterceptors(...))` + `withCredentials`.

## Do not

- Build full feature business logic.
- Reimplement PrimeNG controls or add game-like XP chrome.
