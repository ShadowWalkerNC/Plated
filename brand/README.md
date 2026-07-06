# Plated — Brand Assets

This folder contains the canonical brand assets for the **Plated application**.
These are separate from customer-site assets (which live in `packages/astro-output/`).

## Files

| File | Purpose |
|---|---|
| `tokens.css` | Canonical app-level design tokens — imported by builder + SaaS |
| `logo-icon.png` | App icon — 1080×1080 source (P with fork & knife) |
| `logo-icon@2x.png` | Retina copy |
| `logo-wordmark.svg` | Full logotype: icon + "Plated" wordmark |

## Token Usage

```css
/* In packages/builder/src/styles/tokens.css */
@import '../../../../brand/tokens.css';

/* In packages/saas/src/styles/tokens.css */
@import '../../../brand/tokens.css';
```

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `--plated-ink` | `#1e1a17` | Primary dark — logo letterform |
| `--plated-cream` | `#fdf8f2` | Warm off-white background |
| `--plated-ember` | `#8a4b2f` | Primary action / CTA |
| `--plated-gold` | `#c98f4a` | Secondary accent |

## Typography

- **Display / Wordmark:** Cormorant Garamond (serif) — weight 700
- **UI / Body:** Inter (sans-serif) — weights 400, 500, 600
- **Code:** JetBrains Mono

## Do Not

- Do not use these tokens inside `packages/astro-output/` — those are customer-site themes
- Do not hardcode `#8a4b2f` or `#fdf8f2` anywhere in the builder or SaaS UI — use the CSS vars
- Do not modify `tokens.css` for one-off component styles — extend in the package's own tokens file
