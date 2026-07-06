# Plated Themes

Each subdirectory is a self-contained CSS theme. The generator copies the selected theme into the output site's `public/styles/` directory.

## Available themes

| Theme | Personality | Display font | Best for |
|---|---|---|---|
| `hearth` | Warm, editorial, serif-led | Cormorant Garamond | Full-service restaurants, farm-to-table, wine bars |
| `canvas` | Clean, minimal, system-font | Inter | Fast-casual, modern bistros, contemporary cafes |
| `midnight` | Dark, premium, moody | Cormorant Garamond | Fine dining, cocktail bars, upscale supper clubs |
| `market` | Fresh, casual, ingredient-forward | Playfair Display | Farmers-market cafes, healthy bowls, bakeries |
| `coast` | Airy, bright, hospitality-forward | Lora | Seafood, beach bars, brunch spots |
| `ember` | Bold, dramatic, fire-lit | Oswald | Steakhouses, BBQ, wood-fired pizza |

## File structure per theme

```
styles/<theme>/
  tokens.css   — CSS custom properties (colors, fonts, radius, shadow)
  base.css     — reset, body, .container, .section, .btn, .card
  hero.css     — hero section layout and typography
  nav.css      — navigation bar
```

## Adding a new theme

1. Create a new directory under `styles/`.
2. Add `tokens.css`, `base.css`, `hero.css`, and `nav.css`.
3. Register the theme ID in `packages/generator/src/themeRegistry.ts`.
4. Add a card to the `STYLE_OPTIONS` array in `packages/builder/src/wizard/steps/Step7Template.tsx`.
