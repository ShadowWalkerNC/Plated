# AGENTS.md — NexCMS

> **Extends:** `ShadowWalkerNC/.github/AGENTS.md` — all global rules apply unconditionally.
> **Auto-loaded by:** Claude Code · GitHub Copilot · OpenAI Codex · Cursor · Windsurf
> **Canonical global system:** [ShadowWalkerNC/.github](https://github.com/ShadowWalkerNC/.github)

---

## Project Identity

```
Project:      NexCMS
Description:  Guided website builder for the restaurant and hospitality industry.
              Two modes: Local Builder (Electron desktop app, offline-capable, static Astro zip
              export) and SaaS Hub (nexcms.io — live editing, Supabase-backed, mobile-first).
              Includes Square, Meta, Google Business, and Apple Maps integrations.
              Block-level drag-and-drop editor. JSON config + npm plugin extension system.
Status:       Phase 1 — Generator Core
Phase:        1 — generator + template-engine packages. Restaurant template + Hearth style.
              Electron shell scaffold. CLI triggers export. No full wizard UI yet.
Priority:     Active development
Open-source:  Yes (MIT)
Monorepo:     Yes — pnpm workspaces + Turborepo
```

---

## ⚠️ CRITICAL — Product Direction

This is NOT a self-hosted CMS. It is NOT a Joomla replacement. It is NOT a server you install.

NexCMS is a **guided website builder** with two modes:
1. **Local Builder** — Electron desktop app wrapping React 19 + Vite wizard UI, exports static Astro zip. Fully offline.
2. **SaaS Hub** — nexcms.io, Astro hybrid, Supabase backend, live editing, mobile-first.

Do NOT suggest:
- Hono, Drizzle ORM, raw PostgreSQL, Craftjs, WASM runtime, eventemitter3, mathjs — old plan, rejected.
- Docker as a core requirement — the local builder has zero server dependencies.
- Python for any build tooling — all asset/SEO tools use Node.js.
- Tauri — Electron is the locked decision for the Local Builder shell.
- Next.js — Astro 5 is the locked template and SaaS frontend framework.

---

## Tech Stack

```
Language:           TypeScript (all packages)
Monorepo:           pnpm workspaces + Turborepo
Runtime (dev):      Bun (~4x faster installs + cold starts)
Runtime (prod):     Node.js 22 (ecosystem stability)
Templates:          Astro 5 (static output for Local, hybrid mode for SaaS)
Local Builder:      Electron (native desktop shell) + React 19 + Vite + Shadcn/UI
SaaS frontend:      Astro 5 hybrid mode (mobile-first)
Database (SaaS):    Supabase (PostgreSQL + RLS multi-tenancy)
Auth (SaaS):        Supabase Auth (email/password, magic link, OAuth)
Storage (SaaS):     Supabase Storage (logos, hero images, media)
Image tools:        sharp (optimization, favicons, all sizes)
OG images:          satori + sharp (no headless browser, no Puppeteer)
SEO tools:          Native Node.js (sitemap, robots.txt, Schema.org — zero deps)
Styling:            Tailwind CSS + CSS Variables (style injection)
CDN/Cache:          Cloudflare (edge cache + purge on content save)
SaaS hosting:       Railway (persistent Node.js server)
Shared types:       packages/types/ — single source of truth
Forms (SaaS):       Supabase table + Resend for email notifications
Forms (Local):      Netlify Forms or Formspree (documented in deploy instructions)
Extensions:         packages/extensions/ — JSON config toggles + npm plugin registry
Integrations:       packages/integrations/ — Square, Meta, Google, Apple Maps OAuth + sync
```

---

## Architectural Decisions (LOCKED — Do Not Reverse)

All decisions below were locked during the Phase 0–1 planning sessions (July 2–4, 2026).
Do not suggest alternatives. Do not reopen without explicit owner approval.

### Decision 1 — SaaS Rendering Model: Single Astro Server Instance

The SaaS Hub runs as ONE Astro server instance on Railway. All tenant sites served
from a single deployment. Middleware reads the Host header, resolves tenant from Supabase
`sites` table, renders that tenant's content.

Cache strategy:
- Client pages: Cloudflare edge cache, s-maxage=300, stale-while-revalidate=3600
- On content save: Supabase webhook → /api/revalidate → Cloudflare Cache Purge API
- Result: edits go live in <10 seconds. No rebuild pipeline. No per-site deploys.

Do NOT suggest per-site static deploys, Netlify/Vercel for SaaS site hosting, or ISR pipelines.

### Decision 2 — No Python. Node.js Tools Only.

All asset processing, SEO generation, and image tooling uses Node.js packages:
- Image optimization + favicons: `sharp`
- OG image generation: `satori` + `sharp`
- Sitemap, robots.txt, Schema.org: native Node.js

Do NOT suggest Python, Pillow, PIL, or any Python-based tooling.
Reason: `npx nexcms` installs must work without Python on the user's machine.

### Decision 3 — Template Decoupling: Structure vs. Style Are Separate

Business type templates define STRUCTURE, CONTENT SLOTS, and BLOCK DEFINITIONS ONLY.
Zero styling, zero color values, zero font choices in templates.

Style templates (hearth, spark, steel, etc.) inject CSS variables exclusively.

8 structures + 6 styles maintained independently. NOT 288 combined variants.

Do NOT add styling to business type templates.
Do NOT add content slots or block definitions to style templates.

### Decision 4 — Super-Admin Bypass via Supabase Service Role

Super-admin bypasses RLS using the Supabase service role key.
Service role key is SERVER-SIDE ONLY. NEVER in browser-accessible env vars.
RLS policies written with `is_super_admin` JWT claim for admin routes.

### Decision 5 — Form Handling Strategy

SaaS: Form submissions stored in Supabase `form_submissions` table + Resend email.
Local: Netlify Forms or Formspree config included in export + deploy instructions.

### Decision 6 — Local Builder Shell: Electron

The Local Builder is an Electron desktop app (macOS, Windows, Linux).
The React 19 + Vite wizard UI runs inside Electron's renderer process.
IPC bridge (`preload.ts` + `ipc/` handlers) connects UI to Node.js APIs:
- `window.nexcms.exportSite(projectData)` → runs generator, sharp, satori, SEO tools
- `window.nexcms.saveProject(data)` → writes project.json to local filesystem
- `window.nexcms.loadProject()` → reads project.json from local filesystem
- `window.nexcms.openFile(filter)` → native file picker for logo/image upload

The CLI (`packages/cli/`) spawns the Electron binary. `npx nexcms` works as the entry point.
Do NOT suggest Tauri. Electron is locked. Pure JS/TS — no Rust.

### Decision 7 — Drag-and-Drop: Block-Level

The editor uses BLOCK-LEVEL drag-and-drop.
- Each page section contains an ordered array of content blocks.
- Blocks can be reordered within a section via drag handles.
- Sections can be toggled visible/hidden and reordered on the page.
- Block definitions declared in `nexcms.template.json` under each section's `blocks[]` array.
- `BlockSchema` type locked in `packages/types/`.
- DnD library: `@dnd-kit/core` + `@dnd-kit/sortable` (accessible, no jQuery).

Do NOT suggest page-level-only reordering or full visual Webflow-style element positioning.

### Decision 8 — Extension System: Dual Layer

Two levels of extension, both supported:

**Layer 1 — JSON Config Extensions (Simple Toggles)**
Declared in `nexcms.config.json`. Wizard surfaces as toggle options in Step 8.
No code required from the user. Config-driven.

**Layer 2 — npm Package Extensions (Advanced)**
Installed as npm packages (`nexcms-plugin-*`) that self-register with the NexCMS
extension registry in `packages/extensions/`.
Each plugin exports an `NexCMSPlugin` object declaring:
- `id`, `name`, `version`
- `wizardSteps[]` — additional wizard steps to inject
- `configSchema` — Zod schema for plugin config
- `components[]` — Astro components to inject into templates
- `envVars[]` — required environment variables
- `onBuild(config)` — hook called during site generation

Do NOT conflate the two layers. JSON config for simple on/off features.
npm plugins for new functionality that adds wizard steps, components, or build hooks.

### Decision 9 — Integration Architecture

All third-party integrations live in `packages/integrations/`.
Each integration is a typed client module:

```
packages/integrations/
├── square/       ← Square Catalog API — menu sync
├── meta/         ← Meta Graph API — Facebook + Instagram OAuth + feed
├── twitter/      ← X API v2 — profile connect, post feed
├── google/       ← Google Business Profile API + Maps Embed API
├── apple-maps/   ← Apple Maps Business Connect API
└── index.ts      ← Integration registry + types
```

OAuth tokens stored in Supabase `integrations` table (SaaS) or local encrypted file (Local).
Wizard Step 3 surfaces each integration with:
  a) Connect button if credentials are missing
  b) Connected status + disconnect option if credentials exist
  c) "You don't have this yet" coaching prompt with creation link if user has no account

Square menu sync is the canonical integration pattern for all others.

### Decision 10 — Service Tiers

Three tiers, all managed via super-admin dashboard:
1. **Self-Serve** — user builds their own site (Local or SaaS)
2. **Managed Build** — super-admin builds on behalf of client
3. **White-Glove** — super-admin maintains and manages ongoing

Supabase `sites` table includes: `tier` (enum: self_serve | managed | white_glove),
`managed_by` (uuid → users.id, nullable), `billing_status` (enum: active | paused | cancelled).

---

## Monorepo Structure

```
nexcms/
├── packages/
│   ├── types/              ← ProjectSchema, SiteRecord, UserRecord, BlockSchema,
│   │                         PluginManifest, IntegrationRecord — all shared types
│   ├── generator/          ← project.json → Astro output files
│   ├── template-engine/    ← nexcms.template.json manifest reader + block/slot mapper
│   ├── asset-tools/        ← sharp + satori tooling
│   ├── seo-tools/          ← Sitemap, robots.txt, meta, Schema.org (zero deps)
│   ├── extensions/         ← Extension registry — resolves JSON config + npm plugins
│   ├── integrations/       ← Square, Meta, Google, Apple Maps clients + OAuth
│   │   ├── square/
│   │   ├── meta/
│   │   ├── twitter/
│   │   ├── google/
│   │   └── apple-maps/
│   ├── builder/            ← LOCAL: Electron shell + React 19 + Vite wizard UI
│   │   ├── src/            ← React wizard UI (desktop-first)
│   │   └── electron/       ← main.ts, preload.ts, ipc/ handlers
│   ├── cli/                ← LOCAL: nexcms CLI — spawns Electron, triggers export
│   └── saas/               ← SAAS: Astro hybrid (mobile-first)
│       ├── dashboard/      ← Client + admin + super-admin dashboard
│       ├── editor/         ← In-browser block-level DnD editor
│       └── renderer/       ← Tenant-aware site renderer
├── templates/
│   ├── restaurant/
│   ├── food-truck/
│   ├── bar/
│   ├── cafe/
│   ├── bakery/
│   ├── catering/
│   ├── food-stand/
│   └── ghost-kitchen/
├── styles/
│   ├── hearth/
│   ├── spark/
│   ├── steel/
│   ├── bloom/
│   ├── obsidian/
│   └── ghost/
├── docs/
├── turbo.json
├── pnpm-workspace.yaml
├── AGENTS.md
├── CHANGELOG.md
├── CONTRIBUTING.md
└── README.md
```

---

## Project-Specific Rules

1. **`packages/types/` is the single source of truth.** All TypeScript interfaces live here.
   `ProjectSchema` is the core contract — any change requires updating generator,
   template-engine, builder, and saas simultaneously.

2. **Business type templates are structure + blocks only.** No colors, no fonts, no visual
   styling in any file under `templates/`. Hard rule.

3. **Style templates are CSS-only.** No content logic, no slot definitions, no block
   definitions in any file under `styles/`. Hard rule.

4. **No Python anywhere in the build pipeline.** All tooling runs in Node.js/Bun.

5. **Local Builder has zero runtime dependencies beyond Node.js.**
   No database, no server, no Python, no external API calls required for core builder
   or export. Offline-capable.

6. **SaaS service role key is server-side only.** Never in client bundles.
   Use `PUBLIC_` prefix only for anon/public Supabase keys.

7. **Turborepo pipeline compliance.** All build, test, lint tasks declared in `turbo.json`.

8. **Conventional Commits required.** `type(scope): description`
   types: feat / fix / docs / chore / refactor / test

9. **Branch naming:** `feature/[package]-[short-description]` · `fix/[package]-[issue]`
   · `chore/[scope]` · `docs/[topic]`

10. **Mobile-first for SaaS, desktop-first for Local Builder.**
    SaaS UI: designed at 390px first. Local Builder: designed at 1280px first.

11. **Open-source safe.** No secrets in committed files. `.env.example` updated alongside
    every new env var.

12. **Block-level DnD uses `@dnd-kit/core` + `@dnd-kit/sortable`.**
    Do not introduce other DnD libraries.

13. **Integration OAuth tokens are never stored in project.json (Local) or exposed
    client-side (SaaS).** Local: encrypted local file. SaaS: Supabase `integrations` table,
    server-side only.

14. **npm plugins must export a valid `NexCMSPlugin` object** as their default export.
    The extension registry validates against `PluginManifest` schema at startup.
    Invalid plugins throw at build time, not silently fail.

15. **Phase sequence is enforced.** No SaaS code before Phase 4. No extensions/plugins
    before Phase 5. No public launch before Phase 7.

---

## Supabase Schema

```sql
-- All tables designed Phase 0, implemented Phase 4

users
  id uuid PK
  email text unique
  is_super_admin boolean default false
  created_at timestamptz

sites
  id uuid PK
  owner_user_id uuid → users.id
  subdomain text unique
  custom_domain text unique nullable
  business_type text  -- restaurant | food-truck | bar | cafe | bakery | catering | food-stand | ghost-kitchen
  style_template text -- hearth | spark | steel | bloom | obsidian | ghost
  color_theme text
  mode text           -- self_serve | managed | white_glove
  managed_by uuid nullable → users.id
  billing_status text -- active | paused | cancelled
  project_data jsonb  -- full ProjectSchema
  status text         -- draft | published
  created_at timestamptz
  updated_at timestamptz

integrations
  id uuid PK
  site_id uuid → sites.id
  provider text       -- square | facebook | instagram | twitter | google | apple-maps
  access_token text   -- encrypted, server-side only
  refresh_token text nullable
  token_expiry timestamptz nullable
  provider_account_id text
  metadata jsonb      -- provider-specific data (page name, square location id, etc.)
  created_at timestamptz
  updated_at timestamptz

form_submissions
  id uuid PK
  site_id uuid → sites.id
  form_type text      -- contact | catering | newsletter
  data jsonb
  read boolean default false
  created_at timestamptz

media
  id uuid PK
  site_id uuid → sites.id
  filename text
  storage_path text
  url text
  type text           -- logo | hero | menu-item | gallery
  size integer
  created_at timestamptz

-- RLS intent (SQL written Phase 4)
-- sites: owner reads/writes own; super_admin reads/writes all
-- integrations: owner reads/writes own site integrations; server-side only for tokens
-- form_submissions: owner reads own; public can INSERT
-- media: owner reads/writes own
-- users: users read own row; super_admin reads all
```

---

## Environment Variables

| Variable | Mode | Required | Description |
|---|---|---|---|
| `PUBLIC_SUPABASE_URL` | SaaS | Yes | Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | SaaS | Yes | Supabase anon key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | SaaS | Yes | Service role key — SERVER-SIDE ONLY |
| `CLOUDFLARE_ZONE_ID` | SaaS | Yes | For cache purge on content save |
| `CLOUDFLARE_API_TOKEN` | SaaS | Yes | Cloudflare API token (cache purge) |
| `RESEND_API_KEY` | SaaS | Yes | Email notifications |
| `SQUARE_APP_ID` | Both | Integration | Square OAuth app ID |
| `SQUARE_APP_SECRET` | SaaS | Integration | Square OAuth app secret (server-side) |
| `SQUARE_ENVIRONMENT` | Both | Integration | sandbox or production |
| `META_APP_ID` | Both | Integration | Meta (Facebook/Instagram) app ID |
| `META_APP_SECRET` | SaaS | Integration | Meta app secret (server-side) |
| `TWITTER_CLIENT_ID` | Both | Integration | X (Twitter) OAuth 2.0 client ID |
| `TWITTER_CLIENT_SECRET` | SaaS | Integration | X OAuth 2.0 client secret |
| `GOOGLE_CLIENT_ID` | Both | Integration | Google OAuth 2.0 client ID |
| `GOOGLE_CLIENT_SECRET` | SaaS | Integration | Google OAuth 2.0 client secret |
| `GOOGLE_MAPS_API_KEY` | Both | Integration | Maps Embed API key |
| `APPLE_MAPS_TOKEN` | Both | Integration | Apple Maps JS token |
| `APPLE_MAPS_TEAM_ID` | SaaS | Integration | Apple Maps Business Connect team ID |
| `ENCRYPTION_KEY` | Local | Yes | Key for encrypting local OAuth tokens |
| `PORT` | SaaS | No | Server port (default 3000) |
| `NODE_ENV` | Both | Yes | development or production |

---

## Phase Roadmap

| Phase | Timeline | Goal |
|---|---|---|
| **0 — Replan** | ✅ Done Jul 2026 | Types, manifest spec, schema, scaffold, docs, template stub |
| **1 — Generator Core** | Jul–Sep 2026 | generator + template-engine, restaurant + hearth, Electron shell scaffold, CLI export |
| **2 — Local Builder** | Sep–Nov 2026 | Full Electron wizard UI, all 8 business types, all 6 styles, block-level DnD, zip export |
| **3 — Integrations** | Nov 2026–Jan 2027 | Square, Meta, Google Business, Apple Maps, existing website import, OAuth flows |
| **4 — SaaS Foundation** | Jan–Mar 2027 | Supabase, auth, mobile dashboard, live editing, super-admin, service tiers, custom domains |
| **5 — Extensions** | Mar–May 2027 | JSON config extensions, npm plugin registry, packages/extensions/, plugin authoring docs |
| **6 — SaaS Polish** | May–Jul 2027 | GitHub push, one-click deploy, analytics, form storage, White-Glove tooling |
| **7 — Public Launch** | Q3 2027 | nexcms.io public, docs, pricing, template marketplace |

---

## Current Phase Context

```
Phase:              1 — Generator Core
Phase goal:         Build generator + template-engine packages. Restaurant template +
                    Hearth style. Electron shell scaffold in packages/builder/electron/.
                    CLI spawns Electron binary. JSON in → Astro site out. No wizard UI yet.
Timeline:           Jul–Sep 2026
Next phase:         Phase 2 — Full Electron wizard UI (Sep 2026)
```

---

## Agent Confirmation for NexCMS

After loading this file, add to `DISPATCH CONFIRMED`:

```
Project AGENTS.md: loaded — NexCMS
Stack: TypeScript · Astro 5 · Electron · React 19 + Vite · Supabase · sharp · satori · Turborepo
Phase: 1 — Generator Core
Product: Guided website builder — Electron Local Builder (offline) + SaaS Hub (nexcms.io)
Project rules active: 15
Architectural decisions locked: 10
Integrations: Square · Meta/Instagram · Twitter/X · Google Business · Apple Maps
Extensions: JSON config toggles + npm plugin registry (packages/extensions/)
DnD: block-level — @dnd-kit/core + @dnd-kit/sortable
Service tiers: self_serve | managed | white_glove
Do NOT suggest: Tauri, Next.js, Hono, Drizzle, Python, Docker, Craftjs, Webflow-style DnD
```

---

*Version: 3.0 | Extends: ShadowWalkerNC/.github/AGENTS.md | Project: NexCMS*
*Last updated: July 4, 2026 — Master plan locked. Phase 1 active.*
