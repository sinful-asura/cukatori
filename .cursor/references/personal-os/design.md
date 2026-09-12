# Design Language

> Compiled by **Tastefile** from your Figma CSS export. Every value below is extracted directly from the source — not invented. The interpretation sections describe how to use those values.

## Source Summary

- **Source:** figma — Figma export
- **Sampled:** ~3662 styled elements
- **Colors:** 15 roles · **Type sizes:** 9 · **Spacing steps:** 12

## Tech Stack

**Always implement this design as plain HTML + CSS — so it renders in a live preview immediately.**

- **Markup:** a single self-contained `.html` file. No build step.
- **Styling:** vanilla CSS — define the tokens below as `:root` custom properties and use them throughout.
- **JavaScript:** vanilla JS only when interactivity is needed. No React, JSX, or `.tsx`.
- **Icons:** inline line SVG with `stroke="currentColor"`, or a CDN icon set (Lucide/HugeIcons). No emoji.

Do not output React/Next.js components or `.tsx` files — the result must open and render directly in a browser preview.

## Visual Direction

The palette blends muted neutrals with a bold orange accent, creating a calm yet energetic feel. Typography leans on a single sans‑serif family with a clear scale, while generous spacing and subtle shadows give depth without clutter.

**Personality:** Minimalist, functional, approachable, with a touch of warmth.

## Colors

| Role | Values (most used first) |
| --- | --- |
| Backgrounds | `#8c8c8c` · `#ffffff` · `rgba(250, 250, 250, 0.5)` · `#000000` · `#9a9a9a` · `#2b2b2b` |
| Surfaces | `rgba(250, 250, 250, 0.5)` |
| Text | `#fafafa` · `#8c8c8c` · `#ffffff` · `rgba(255, 255, 255, 0.4)` · `#8b8b8b` · `#000000` · `#929292` · `#979797` |
| Borders | `#fafafa` · `#2b2b2b` · `#2e1819` · `rgba(255, 255, 255, 0.2)` · `#ffffff` · `#d2d2d2` |
| Accents | `#ff5a00` |

Base the interface on the neutral gray background, layering translucent surfaces for depth. Use the dark text color for primary content, with lighter text variants for secondary or disabled states. Reserve the bright orange accent for interactive elements that need to stand out, such as primary buttons or status badges.

## Typography

| Property | Values (most used first) |
| --- | --- |
| Families | `'Geist'` |
| Sizes | `14px` · `12px` · `10px` · `16px` · `60px` · `20px` · `18px` · `96px` · `24px` |
| Weights | `400` · `500` · `300` · `600` · `700` |
| Line heights | `14px` · `12px` · `10px` · `20px` · `16px` · `60px` |
| Letter spacing | _none_ |

The type scale follows a clear hierarchy: 96px for main headlines, 60px for secondary titles, 20px for section headings, 18px for sub‑headings, and 14px for body text. Maintain a 1.5 line-height for body and 1.2 for headings to balance readability and density.

## Spacing

**Scale (most common first):** `4px` · `8px` · `10px` · `12px` · `6px` · `16px` · `3px` · `2px` · `20px` · `14px` · `24px` · `208px`

## Layout

- **Content widths:** `14px` · `12px` · `516px` · `600px` · `32px` · `384px`
- **Layout modes:** _none_
- **Gaps:** `10px` · `8px` · `4px` · `12px` · `6px` · `3px`

Structure content within a 516px container on standard screens, expanding to 600px on larger displays. Use the 4px–16px spacing scale to separate elements: 8px for gutters, 12px for component padding, and 20px for section breaks. Apply consistent 4px border radii to controls and 16px to larger cards to create a cohesive visual rhythm.

## Borders & Radius

- **Border widths:** `1px solid #FAFAFA` · `1px solid #2B2B2B` · `0.272468px solid #2E1819` · `1px solid rgba(255, 255, 255, 0.2)`
- **Corner radii:** `4px` · `6px` · `8px` · `16px` · `12px` · `5px`

## Shadows

| Value | Times used |
| --- | --- |
| `0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1)` | 6 |
| `0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1)` | 2 |

## Components

### Buttons

_Not detected in this source._

### Cards

| Property | Value |
| --- | --- |
| font-size | `12px` |
| font-weight | `400` |

_Based on 2 instance(s)._

### Inputs

| Property | Value |
| --- | --- |
| font-size | `12px` |
| font-weight | `400` |

_Based on 2 instance(s)._

### Navigation

_Not detected in this source._

## Design Principles

- Use the muted gray background as the primary canvas, reserving the bright orange for calls to action or status indicators.
- Maintain typographic hierarchy by pairing the 60px headline with 20px subheadings and 14px body text, ensuring consistent line-height for readability.
- Apply the 4px–16px spacing range to separate content blocks, using larger gaps for section breaks and smaller ones for inline elements.
- Keep components like cards and inputs lightweight: 12px font size, 400 weight, and a subtle 4px border radius for a modern touch.
- Use the two shadow presets to distinguish depth: a light drop shadow for cards and a slightly stronger one for modal overlays.
- Adopt the 516px width for main content on medium screens, expanding to 600px on larger displays for optimal legibility.
- Leverage the 8px border radius for interactive elements, while reserving the 16px radius for larger containers to create visual hierarchy.

## Avoid

- Overusing the bright orange—limit it to primary actions or key status signals.
- Mixing multiple typefaces—stick to the single Geist family for consistency.
- Cramping content with 2px or 3px spacing—those values are too tight for legibility.
- Applying heavy shadows to every element—use shadows sparingly to avoid visual noise.
- Using the background gray (#8c8c8c) as a text color—contrast is insufficient for readability.
- Over‑rounding edges with the 16px radius on small controls—keeps interactions crisp.

## CSS Variables

Drop these into your `:root`.

```css
:root {
  /* Colors */
  --color-bg: #8c8c8c;
  --color-surface: rgba(250, 250, 250, 0.5);
  --color-text: #fafafa;
  --color-text-muted: #8c8c8c;
  --color-border: #fafafa;
  --color-accent: #ff5a00;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 10px;
  --space-4: 12px;
  --space-5: 6px;
  --space-6: 16px;

  /* Radius */
  --radius-1: 4px;
  --radius-2: 6px;
  --radius-3: 8px;
  --radius-4: 16px;

  /* Shadow */
  --shadow-1: 0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-2: 0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -2px rgba(0, 0, 0, 0.1);
}
```

## Icons

Use clean line SVG icons — inline, or from a CDN set (Lucide/HugeIcons). Keep one consistent size and stroke width per surface, and use `stroke="currentColor"` so icons inherit the text color.

## Implementation Notes

- Treat the extracted values as the visual contract — match them exactly, don't approximate.
- Build as a single HTML file with tokens in `:root`; reuse the component patterns above before inventing new ones.
- Implement hover, focus, active, disabled, loading, empty, and error states using the existing tokens.
- Preserve the source's information density and spacing rhythm.

## Applied in Personal OS

Current canvas is the **1440w light** (warm dark) dashboard export — not the earlier Tastefile role map.

| Token | Used in this app as |
| --- | --- |
| `#111110` | Page canvas + sidebar |
| `#191918` | Chart / card body |
| `#222221` | Elevated surface, active nav, buttons, table header |
| `#2A2A28` | Chart grid + hover |
| `#3B3A37` | Hairline borders |
| `#EEEEEC` | Primary text |
| `#B5B3AD` | Secondary / stat labels |
| `#7D7B74` | Muted nav + axis labels |
| `#6F6D67` | Icon dim |
| `#0091FF` | Chart / heatmap accent |

Layout chrome: 296px sidebar, 16px cards, 12px nav, 8px buttons, 4px controls, 32px stat figures, Geist 400/500. 1200px content column.