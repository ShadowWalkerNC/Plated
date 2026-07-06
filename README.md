# Plated

> Beautiful restaurant websites, built in minutes.

[![Status](https://img.shields.io/badge/status-active%20development-c98f4a?style=flat-square)](https://github.com/ShadowWalkerNC/Plated)
[![Stack](https://img.shields.io/badge/stack-Next.js%2015%20%2B%20Astro%205%20%2B%20Electron-8a4b2f?style=flat-square)](https://github.com/ShadowWalkerNC/Plated)

Plated is a full-stack SaaS + Electron desktop app that lets restaurant owners generate, customise, and deploy a beautiful Astro-powered static site without touching code. Answer a few questions, pick a theme, and your restaurant is live.

```
┌──────────────────────────────────────────────────────────┐
│  Restaurant owner fills onboarding wizard (4 steps)      │
│  ↓                                                       │
│  Plated generator builds a themed Astro site             │
│  ↓                                                       │
│  One-click deploy → Vercel or Netlify                    │
│  ↓                                                       │
│  Custom domain verified via DNS TXT record               │
└──────────────────────────────────────────────────────────┘
```

## Monorepo structure

```
packages/
  saas/          — Next.js 15 SaaS dashboard (Clerk · Stripe · Resend · Drizzle)
  builder/       — Electron desktop builder (Vite + React)
  generator/     — Core site generator (schema → Astro file tree)
  astro-output/  — Astro project builder & ZIP exporter
  types/         — Shared TypeScript types (ProjectSchema, etc.)
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

## Key features

- **Onboarding wizard** — 4-step guided flow: restaurant name, cuisine, city, description, theme, and conversion preferences
- **Three starter themes** — Hearth (warm, chef-driven), Editorial (refined, photographic), Bistro (casual, energetic)
- **One-click deploy** — Vercel and Netlify provider APIs wired up out of the box
- **Custom domains** — DNS TXT verification + CNAME routing through `cname.plated.io`
- **Stripe billing** — Free / Pro / Agency tiers with plan-gated project limits
- **Transactional email** — Welcome, deploy success/failure, upgrade, and payment-failed templates via Resend
- **Desktop builder** — Offline-capable Electron app with auto-updater

## Environment variables

See [`packages/saas/.env.example`](packages/saas/.env.example) for the full list.

| Variable | Purpose |
|---|---|
| `CLERK_SECRET_KEY` | Auth (Clerk) |
| `DATABASE_URL` | Postgres (Supabase / Neon) |
| `STRIPE_SECRET_KEY` | Billing |
| `RESEND_API_KEY` | Transactional email |
| `UPSTASH_REDIS_REST_URL` | Rate limiting |
| `VERCEL_TOKEN` | One-click Vercel deploys |
| `NETLIFY_TOKEN` | One-click Netlify deploys |
| `NEXT_PUBLIC_CNAME_TARGET` | Custom domain CNAME target (`cname.plated.io`) |

## Themes

| Theme | Vibe |
|---|---|
| **Hearth** | Warm amber tones, serif headlines, intimate and chef-driven |
| **Editorial** | Clean whites, strong photography, refined and elevated |
| **Bistro** | Bold colours, energetic layout, casual neighbourhood feel |

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

## License

MIT © 2026 Plated
