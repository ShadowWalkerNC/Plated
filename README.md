# Plated

> The restaurant website module for [CulinaryOS](https://github.com/ShadowWalkerNC/CulinaryOS) — and any restaurant that needs a beautiful site fast.

[![License: MIT](https://img.shields.io/badge/license-MIT-c98f4a?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/status-active%20development-c98f4a?style=flat-square)](https://github.com/ShadowWalkerNC/Plated)
[![Stack](https://img.shields.io/badge/stack-Next.js%2015%20%2B%20Astro%205%20%2B%20Electron-8a4b2f?style=flat-square)](https://github.com/ShadowWalkerNC/Plated)
[![CulinaryOS](https://img.shields.io/badge/CulinaryOS-native%20module-3d2a1d?style=flat-square)](https://github.com/ShadowWalkerNC/CulinaryOS)

Plated is an open-source restaurant website builder. Use it standalone — answer a few questions, pick a theme, deploy — or connect it natively to CulinaryOS and let your menu, hours, and specials sync automatically from your POS.

```
┌─────────────────────────────────────────────────────────────┐
│  Standalone mode                                            │
│  Restaurant owner fills onboarding wizard (4 steps)        │
│  ↓                                                         │
│  Plated generator builds a themed Astro site               │
│  ↓                                                         │
│  One-click deploy → Vercel or Netlify                      │
│  ↓                                                         │
│  Custom domain verified via DNS TXT record                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  CulinaryOS native mode                                     │
│  culinary ext add plated   ← TODO: confirm extension name  │
│  ↓                                                         │
│  Menu, hours & specials pull live from POS / admin-client  │
│  ↓                                                         │
│  MCP layer allows AI agents to update site content         │
│  ↓                                                         │
│  Deploy as above — data stays in sync automatically        │
└─────────────────────────────────────────────────────────────┘
```

## Monorepo structure

```
packages/
  saas/          — Next.js 15 dashboard (Clerk · Drizzle · Resend)
  builder/       — Electron desktop builder (Vite + React)
  generator/     — Core site generator (schema → Astro file tree)
  astro-output/  — Astro project builder & ZIP exporter
  types/         — Shared TypeScript types (ProjectSchema, etc.)
styles/
  hearth/        — Warm, serif-led
  canvas/        — Clean, minimal
  midnight/      — Dark, premium
  market/        — Fresh, casual
  coast/         — Airy, bright
  ember/         — Bold, dramatic
pitch/
  index.html     — Standalone HTML pitch deck
```

## Quick start

```bash
pnpm install

# SaaS dashboard
cd packages/saas
cp .env.example .env.local
# fill in env values
pnpm dev          # → http://localhost:3000

# Electron builder
cd packages/builder
pnpm dev          # Vite + Electron
```

## CulinaryOS integration

Plated ships as a native CulinaryOS extension. Once installed, menu items, hours, holiday closures, and daily specials sync automatically from your POS and admin-client — no manual updates needed.

```bash
# TODO: confirm extension install command
culinary ext add plated
```

The MCP layer in CulinaryOS also allows AI agents to update site copy, push menu changes, and toggle promotions via tool calls.

See the [CulinaryOS repo](https://github.com/ShadowWalkerNC/CulinaryOS) for full MCP and extension documentation.

## Key features

- **Onboarding wizard** — 4-step guided flow: restaurant name, cuisine, city, description, theme, and conversion goal
- **6 starter themes** — Hearth, Canvas, Midnight, Market, Coast, Ember (see [styles/README.md](styles/README.md))
- **CulinaryOS native** — MCP extension syncs menu, hours, and specials from your POS automatically
- **One-click deploy** — Vercel and Netlify provider APIs wired up out of the box
- **Custom domains** — DNS TXT verification + CNAME routing
- **Desktop builder** — Offline-capable Electron app with auto-updater
- **Transactional email** — Welcome, deploy success/failure, and upgrade templates via Resend

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

## Environment variables

See [`packages/saas/.env.example`](packages/saas/.env.example) for the full list.

| Variable | Purpose |
|---|---|
| `CLERK_SECRET_KEY` | Auth (Clerk) |
| `DATABASE_URL` | Postgres (Supabase / Neon) |
| `RESEND_API_KEY` | Transactional email |
| `UPSTASH_REDIS_REST_URL` | Rate limiting |
| `VERCEL_TOKEN` | One-click Vercel deploys |
| `NETLIFY_TOKEN` | One-click Netlify deploys |
| `NEXT_PUBLIC_CNAME_TARGET` | Custom domain CNAME target |

## Logo

The Plated mark is a plate with fork and knife — available in three variants (`light`, `dark`, `color`) via `packages/saas/src/components/Logo.tsx` and as static SVGs in `packages/saas/public/`.

```
logo.svg        — 64×64 icon mark
logo-wide.svg   — 150×36 horizontal lockup (icon + wordmark)
```

## Releasing a desktop build

```bash
git tag v0.2.0 && git push --tags
```

GitHub Actions builds `.dmg` (mac x64 + arm64), `.exe` (win x64), and `.AppImage` (linux x64) and publishes them to the GitHub Release. `electron-updater` picks up the new release on the next app launch.

## Licensing

| Use case | License | Cost |
|---|---|---|
| Personal, open-source, or client work (with Plated branding) | MIT | Free |
| Remove Plated branding, resell commercially | Commercial white-label license | $299 one-time |
| Upgrade to a future major version (v2, v3…) | Per-version update license | $79 each |

Minor and patch updates are always free — just pull from GitHub.

> **Buy white-label license → TODO: add license purchase URL**

MIT © 2026 Plated
