# Plated

> The restaurant website module for [CulinaryOS](https://github.com/ShadowWalkerNC/CulinaryOS) — and any restaurant that needs a beautiful site fast.

[![License: MIT](https://img.shields.io/badge/license-MIT-c98f4a?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/status-active%20development-c98f4a?style=flat-square)](https://github.com/ShadowWalkerNC/Plated)
[![Stack](https://img.shields.io/badge/stack-Astro%205%20%2B%20Electron%20%2B%20React%2019-8a4b2f?style=flat-square)](https://github.com/ShadowWalkerNC/Plated)
[![CulinaryOS](https://img.shields.io/badge/CulinaryOS-native%20module-3d2a1d?style=flat-square)](https://github.com/ShadowWalkerNC/CulinaryOS)

Plated is an open-source restaurant website builder. Use it standalone — answer a few questions in the guided wizard, pick a theme, export a static Astro site — or connect it natively to CulinaryOS and let your menu, hours, and specials sync automatically from your POS.

```
┌─────────────────────────────────────────────────────────────┐
│  Local Builder mode (Electron desktop app, offline-capable) │
│  Restaurant owner fills 8-step guided wizard               │
│  ↓                                                         │
│  Plated generator builds a themed Astro site               │
│  ↓                                                         │
│  Export as ZIP → deploy to any static host                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SaaS Hub mode (Phase 4)                                    │
│  PLATED_DOMAIN — live editing, Supabase-backed             │
│  ↓                                                         │
│  Menu, hours & specials pull live from POS / admin-client  │
│  ↓                                                         │
│  MCP layer allows AI agents to update site content         │
│  ↓                                                         │
│  Edits go live in <10 seconds via Cloudflare edge cache    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CulinaryOS native mode                                     │
│  culinary ext add plated   ← TODO: confirm extension name  │
│  ↓                                                         │
│  Wizard pre-fills from POS data                            │
│  ↓                                                         │
│  Menu, hours & specials stay in sync automatically         │
└─────────────────────────────────────────────────────────────┘
```

## Monorepo structure

```
packages/
  types/           — Shared TypeScript interfaces (single source of truth)
  generator/       — ProjectSchema → Astro file tree
  template-engine/ — plated.template.json reader + block/slot mapper
  asset-tools/     — sharp + satori (WebP, favicons, OG images, blur placeholders)
  seo-tools/       — Sitemap, robots.txt, meta tags, Schema.org
  ai-tools/        — Google Gemini API (description, alt text, SEO, color palette)
  pdf-tools/       — jsPDF menu export + qrcode generation
  extensions/      — Extension registry (JSON config + npm plugin resolver)
  integrations/    — Square, Meta, Google, Apple Maps, Yelp
  builder/         — Electron desktop app (React 19 + Vite, 8-step wizard)
  cli/             — npx plated entry point
  saas/            — SaaS Hub (Astro 5 hybrid, Phase 4)
styles/
  hearth/          — Warm, serif-led
  canvas/          — Clean, minimal
  midnight/        — Dark, premium
  market/          — Fresh, casual
  coast/           — Airy, bright
  ember/           — Bold, dramatic
templates/
  restaurant/ food-truck/ bar/ cafe/ bakery/ catering/ food-stand/ ghost-kitchen/
pitch/
  index.html       — Standalone HTML pitch deck
```

## Quick start

```bash
pnpm install

# Local Builder (Electron desktop app)
cd packages/builder
pnpm dev          # Vite dev server + Electron

# CLI
npx plated        # spawns Electron binary
```

## 8-step wizard

The Local Builder guides users through a structured onboarding:

| Step | Title | What it collects |
|------|-------|-----------------|
| 1 | Business | Name, tagline, description, contact |
| 2 | Website | Business type (8 types, card picker) + existing URL |
| 3 | Social | Profiles, review platforms, delivery links |
| 4 | Location | Address, hours builder |
| 5 | Menu | Categories, items, prices, dietary tags |
| 6 | Media | Logo, hero image, brand color extraction |
| 7 | Template | Style picker (6 themes) + colour variant |
| 8 | Extensions | Analytics, add-ons, script injection |

## CulinaryOS integration

Plated ships as a native CulinaryOS extension. Once installed, menu items, hours, holiday closures, and daily specials sync automatically from your POS and admin-client — no manual updates needed.

```bash
# TODO: confirm extension install command
culinary ext add plated
```

The MCP layer in CulinaryOS allows AI agents to update site copy, push menu changes, and toggle promotions via tool calls.

See the [CulinaryOS repo](https://github.com/ShadowWalkerNC/CulinaryOS) for full MCP and extension documentation.

## Key features

- **8-step guided wizard** — business type, menu, media, style, extensions
- **8 business types** — restaurant, food truck, bar, cafe, bakery, catering, food stand, ghost kitchen
- **6 visual themes** — Hearth, Canvas, Midnight, Market, Coast, Ember (see [styles/README.md](styles/README.md))
- **Asset pipeline** — WebP conversion, favicons (ICO + Apple + Android), OG images via satori + sharp
- **AI writing tools** — Google Gemini for descriptions, alt text, SEO, colour palette suggestions
- **Block-level DnD editor** — @dnd-kit drag-and-drop, blocks within sections
- **Media library** — crop (react-image-crop), background removal (@imgly/background-removal), Unsplash stock photos
- **PDF + QR export** — printable menu (jsPDF), table tent QR codes (qrcode)
- **Integrations** — Square (full suite), Meta/Instagram, Twitter/X, Google Business, Apple Maps, Yelp
- **Extensions** — JSON config toggles, npm plugin registry (plated-plugin-*), CDN/script manager
- **Offline-capable** — Local Builder has zero server dependencies beyond Node.js
- **CulinaryOS native** — MCP extension syncs live from POS
- **SaaS Hub** — Supabase-backed, live editing, custom domains, multi-tenancy (Phase 4)

## Themes

| Theme | Personality | Display font | Best for |
|---|---|---|---|
| `hearth` | Warm, editorial, serif-led | Cormorant Garamond | Full-service, farm-to-table, wine bars |
| `canvas` | Clean, minimal, system-font | Inter | Fast-casual, modern bistros, cafes |
| `midnight` | Dark, premium, moody | Cormorant Garamond | Fine dining, cocktail bars, supper clubs |
| `market` | Fresh, casual, ingredient-forward | Playfair Display | Market cafes, healthy bowls, bakeries |
| `coast` | Airy, bright, hospitality-forward | Lora | Seafood, beach bars, brunch spots |
| `ember` | Bold, dramatic, fire-lit | Oswald | Steakhouses, BBQ, wood-fired pizza |

See [styles/README.md](styles/README.md) for file structure and instructions on adding a new theme.

## Phase roadmap

| Phase | Timeline | Status | Deliverables |
|---|---|---|---|
| **0 — Plan** | Jul 2026 | ✅ Done | Types, manifest, schema, scaffold, docs |
| **1 — Generator** | Jul–Sep 2026 | 🔄 Active | Generator + template-engine, restaurant+hearth output, Electron shell, wizard UI, CLI |
| **2 — Local Builder** | Sep–Nov 2026 | — | All 8 types, all 6 styles, block DnD, media library, PDF/QR |
| **3 — Integrations** | Nov 2026–Jan 2027 | — | Square full suite, Meta, Google, Apple Maps, Yelp, AI tools |
| **4 — SaaS Foundation** | Jan–Mar 2027 | — | Supabase, auth, mobile dashboard, live editing, super-admin |
| **5 — Content Engine** | Mar–May 2027 | — | Blog, events, specials, press, multi-location, reservations |
| **6 — Extensions** | May–Jul 2027 | — | npm plugin registry, CDN picker, script injection, deploy |
| **7 — Polish** | Jul–Sep 2027 | — | Analytics dashboard, Core Web Vitals, PWA, WCAG, multilingual |
| **8 — Launch** | Q4 2027 | — | PLATED_DOMAIN public, docs site, pricing, template marketplace |

## Environment variables

See [`.env.example`](.env.example) for the full annotated list.

| Category | Key variables |
|---|---|
| Supabase (SaaS) | `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Cloudflare (SaaS) | `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_API_TOKEN` |
| Email (SaaS) | `RESEND_API_KEY` |
| AI | `GEMINI_API_KEY` |
| Square | `SQUARE_APP_ID`, `SQUARE_APP_SECRET`, `SQUARE_ENVIRONMENT` |
| Meta | `META_APP_ID`, `META_APP_SECRET` |
| Google | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `PUBLIC_GOOGLE_MAPS_API_KEY` |
| Apple Maps | `APPLE_MAPS_TOKEN`, `APPLE_MAPS_TEAM_ID` |
| Yelp | `YELP_API_KEY` |
| Analytics | `PLAUSIBLE_API_KEY`, `PLAUSIBLE_DOMAIN` |
| Unsplash | `UNSPLASH_ACCESS_KEY` |
| Local only | `ENCRYPTION_KEY` |

## Releasing a desktop build

```bash
git tag v1.0.0 && git push --tags
```

GitHub Actions builds `.dmg` (mac x64 + arm64), `.exe` (win x64), and `.AppImage` (linux x64) and publishes them to the GitHub Release. `electron-updater` picks up the new release on the next app launch.

## Licensing

| Use case | License | Cost |
|---|---|---|
| Personal, open-source, or client work (with Plated branding) | MIT | Free |
| Remove Plated branding, resell commercially | Commercial white-label license | $299 one-time |
| Upgrade to a future major version | Per-version update license | $79 each |

Minor and patch updates are always free — just pull from GitHub.

> **Buy white-label license → TODO: add license purchase URL**

MIT © 2026 Plated
