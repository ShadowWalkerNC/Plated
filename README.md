# Plated

> Beautiful restaurant websites, built in minutes.

Plated is a full-stack SaaS + Electron desktop app that lets restaurant owners generate, customise, and deploy an Astro-powered static site without touching code.

## Monorepo structure

```
packages/
  saas/          — Next.js 15 SaaS dashboard (Clerk, Stripe, Resend, Drizzle)
  builder/       — Electron desktop builder (Vite + React)
  generator/     — Core site generator (schema → Astro file tree)
  astro-output/  — Astro project builder & ZIP exporter
  types/         — Shared TypeScript types (ProjectSchema, etc.)
```

## Quick start

```bash
pnpm install

# SaaS (web)
cd packages/saas && cp .env.example .env.local
pnpm dev

# Electron builder
cd packages/builder
pnpm dev
```

## Key env vars

See `packages/saas/.env.example` for the full list.

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | Transactional email |
| `STRIPE_SECRET_KEY` | Billing |
| `CLERK_SECRET_KEY` | Auth |
| `DATABASE_URL` | Postgres (Supabase / Neon) |
| `UPSTASH_REDIS_REST_URL` | Rate limiting |
| `VERCEL_TOKEN` | One-click Vercel deploys |
| `NETLIFY_TOKEN` | One-click Netlify deploys |

## Releasing a new version

```bash
git tag v0.2.0 && git push --tags
```

GitHub Actions builds `.dmg` (mac), `.exe` (win), and `.AppImage` (linux) automatically and publishes them to the GitHub Release. `electron-updater` picks up the new release on the next app launch.

## License

MIT
