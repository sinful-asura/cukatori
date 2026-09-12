---
name: pos-shell
description: Builds the Ascend OS marketing landing and app chrome to match Personal OS. Use when implementing the shell scenario, landing page, sidebar, or design tokens.
---

# Shell + landing

Project skill only. Visual source: `.cursor/references/DESIGN.md` and `.cursor/references/personal-os/`.

## Tokens (`src/styles.scss`)

Warm dark from Personal OS: canvas `#111110`, card `#191918`, elevated `#222221`, border `#3b3a37`, text `#eeeeec` / `#b5b3ad` / `#7d7b74`, accent `#0091ff`. Geist 400/500. 296px sidebar, 1200px content. No floating frame, no coral glow.

## Landing `/landing` (logged out; `/` redirects here)

- Nav: accent-blue mark + **Ascend OS**, Product / Features / Pricing / Docs, PrimeNG Sign in + Get started.
- Eyebrow `TRACK. IMPROVE. BECOME MORE.`
- Headline `Your life.` / `In one place.` (second line warm fade).
- Subcopy + `Get started →` + ghost Watch video.
- Four columns: Track everything / Build better habits / See real progress / A more intentional you.
- Right: floating dashboard preview card (can embed dashboard component).
- Below: four claim+preview cards — Exercise, Finance, Entertainment, Journal.

## App chrome (logged in, `/os`)

- `AppShell`: 296px rail matching `personal-os/shell/Sidebar.tsx` (workspace chip, primary + secondary nav, user row + search → quick-log).
- Full-bleed `#111110` canvas, 1200px main column.
- Prefer PrimeNG (`Card`, `Menu`, `Button`, `Avatar`, `Chip`) over new custom primitives. Component map: repo-root `AGENTS.md`.

## Routes

Export lazy `*.routes.ts` from feature folders if missing. You may edit `app.routes.ts` / `app.config.ts` / `app.html` (this scenario owns those hotspots). `provideHttpClient(withInterceptors(...))` + `withCredentials`.

## Do not

- Build full feature business logic.
- Reimplement PrimeNG controls or add game-like XP chrome.
