# UI source of truth

Primary mockup: [ui-landing.jpg](ui-landing.jpg)

Earlier module boards (dark + light app chrome) are secondary. When they conflict, the landing mockup wins.

## Marketing landing (`/` logged out)

- Deep black canvas (`#07070b`).
- Soft red-orange orb behind the hero (radial gradient, top-center, not a hard circle).
- Top nav: small coral mark + wordmark **Ascend OS**, text links (Product, Features, Pricing, Docs), **Sign in** (ghost), **Get started** (white pill).
- Eyebrow: `TRACK. IMPROVE. BECOME MORE.` (11–12px, tracked out, muted).
- Headline: `Your life.` / `In one place.` — 64–80px, tight leading, white, extra-light/regular. Second line may fade to warm peach.
- Subcopy: 16–18px muted gray, max ~42ch.
- CTAs: white pill `Get started →` and ghost `Watch video`.
- Four text feature columns under the hero: Track everything / Build better habits / See real progress / A more intentional you.

## Product chrome (dashboard + module cards)

- App frame sits on the black canvas as a **floating rounded card** (`#101014`, 20–24px radius, 1px `#ffffff10` border, soft shadow).
- Left rail: Ascend OS mark, Dashboard / Goals / Habits / Exercise / Finance / Entertainment / Timeline / Achievements, user chip at bottom.
- Greeting: `Good morning, Kristijan` + one-line subtitle.
- Level + streak pills in a single row (not chunky game badges).
- Today checklist + Goals meters side by side.
- Weekly activity as a compact contribution grid.
- Bottom marketing band on `/`: four product cards with a short claim above each (Exercise / Finance / Entertainment / Journal) and a live-looking module preview inside.

## Tokens

```scss
--bg: #07070b;
--bg-elevated: #101014;
--bg-card: #141418;
--border: rgba(255, 255, 255, 0.08);
--text: #f4f4f5;
--text-muted: #8b8b93;
--accent: #ff4d3a;
--accent-warm: #ff8a65;
--cta: #f5f5f5;
--radius: 20px;
--font: "Inter", "Inter Tight", ui-sans-serif, system-ui, sans-serif;
```

Charts: thin bars + one donut. Heatmap: 12–14px squares, green intensity. No heavy UI kit look. Light theme is secondary; ship dark first to match this frame.
