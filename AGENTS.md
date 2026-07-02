# AGENTS.md — NexCMS

> **Extends:** `ShadowWalkerNC/.github/AGENTS.md` — all global rules apply unconditionally.
> **Auto-loaded by:** Claude Code · GitHub Copilot · OpenAI Codex · Cursor · Windsurf
> **Canonical global system:** [ShadowWalkerNC/.github](https://github.com/ShadowWalkerNC/.github)

---

## Project Identity

```
Project:      NexCMS
Description:  Guided website builder for the restaurant and hospitality industry.
              Two modes: Local Builder (static Astro zip export) and
              SaaS Hub (nexcms.io — live editing, Supabase-backed, mobile-first).
Status:       Phase 0 — Architecture & Planning
Phase:        0 — Lock types, manifest spec, Supabase schema, scaffold monorepo,
              update docs, create restaurant template stub.
Priority:     Active — architecture phase
Open-source:  Yes (MIT)
Monorepo:     Yes — pnpm workspaces + Turborepo
```

---

## ⚠️ CRITICAL — Product Direction

This is NOT a self-hosted CMS. It is NOT a Joomla replacement. It is NOT a server you install.

NexCMS is a **guided website builder** with two modes:
1. **Local Builder** — CLI + React/Vite wizard UI, exports static Astro zip
2. **SaaS Hub** — nexcms.io, Astro hybrid, Supabase backend, live editing, mobile-first

Do NOT suggest:
- Hono, Drizzle ORM, raw PostgreSQL, Craftjs, WASM runtime, eventemitter3, mathjs — these are from the old plan and are no longer part of this project.
- Docker as a core requirement — the local builder has zero server dependencies.
- Python for any build tooling — all asset/SEO tools use Node.js (see Architectural Decisions).

---

## Tech Stack

```
Language:         TypeScript (all packages)
Monorepo:         pnpm workspaces + Turborepo
Runtime (dev):    Bun (~4x faster installs + cold starts)
Runtime (prod):   Node.js 22 (ecosystem stability)
Templates:        Astro 5 (static output for Local, hybrid mode for SaaS)
Builder UI:       React 19 + Vite + Shadcn/UI (Local — desktop-first)
SaaS frontend:    Astro 5 hybrid mode (mobile-first)
Database (SaaS):  Supabase (PostgreSQL + RLS multi-tenancy)
Auth (SaaS):      Supabase Auth (email/password, magic link)
Storage (SaaS):   Supabase Storage (logos, hero images, media)
Image tools:      sharp (optimization, favicons, all sizes)
OG images:        satori + sharp (no headless browser, no Puppeteer)
SEO tools:        Native Node.js (sitemap, robots.txt, Schema.org — zero deps)
Styling:          Tailwind CSS + CSS Variables (style injection)
CDN/Cache:        Cloudflare (edge cache + purge on content save)
SaaS hosting:     Railway (persistent Node.js server)
Shared types:     packages/types/ — single source of truth
Forms (SaaS):     Supabase table + Resend for email notifications
Forms (Local):    Netlify Forms or Formspree (documented in deploy instructions)
```

---

## Architectural Decisions (LOCKED — Do Not Reverse)

These decisions were made during the Phase 0 planning session on July 2, 2026.
Do not suggest alternatives. Do not reopen these decisions without explicit owner approval.

### Decision 1 — SaaS Rendering Model: Single Astro Server Instance (Option A)

The SaaS Hub runs as ONE Astro server instance on Railway. All tenant sites are served
from a single deployment. Middleware reads the Host header, resolves the tenant from
the Supabase `sites` table, and renders that tenant's content.

Cache strategy:
- Client pages: Cloudflare edge cache, s-maxage=300, stale-while-revalidate=3600
- On content save: Supabase webhook → /api/revalidate → Cloudflare Cache Purge API
- Result: edits go live in <10 seconds. No rebuild pipeline. No per-site deploys.

Do NOT suggest:
- Per-site static deploys (Option B) — rejected due to rebuild lag, cost, and management complexity
- Netlify/Vercel for SaaS site hosting — Railway + single server is the decision
- ISR rebuild pipelines for content edits — cache purge is the mechanism, not rebuilds

### Decision 2 — No Python. Node.js Tools Only.

All asset processing, SEO generation, and image tooling uses Node.js packages:
- Image optimization + favicons: `sharp` (native libvips binaries, zero system deps)
- OG image generation: `satori` + `sharp` (JSX → SVG → PNG, no Puppeteer)
- Sitemap, robots.txt, meta tags, Schema.org: native Node.js (zero dependencies)
- Logo color extraction: `sharp` pixel sampling

Do NOT suggest Python scripts, Pillow, PIL, or any Python-based image/SEO tooling.
Reason: Local Builder users install via `npx nexcms` — Python may not exist on their machine.

### Decision 3 — Template Decoupling: Structure vs. Style Are Separate

Business type templates (restaurant, food-truck, etc.) define STRUCTURE and CONTENT SLOTS ONLY.
They contain ZERO styling, ZERO color values, ZERO font choices.

Style templates (hearth, spark, steel, etc.) inject CSS variables exclusively.
They define colors, typography, spacing, and visual identity.

This means: 8 structures + 6 styles maintained independently.
NOT 288 combined template variants.

Do NOT add styling to business type templates.
Do NOT add content slots to style templates.

### Decision 4 — Super-Admin Bypass via Supabase Service Role

The super-admin (site owner/platform admin) bypasses RLS using the Supabase service role key.
The service role key is used SERVER-SIDE ONLY in admin route handlers.
It is NEVER exposed to the client, NEVER in environment variables accessible to the browser.

RLS policies are written with `is_super_admin` JWT claim for the admin dashboard routes.
All client-side queries use the anon key with standard RLS enforcement.

### Decision 5 — Form Handling Strategy

SaaS mode: Form submissions stored in Supabase `form_submissions` table.
Email notifications via Resend (owner gets emailed on new contact/catering inquiry).

Local mode: Export includes Netlify Forms or Formspree configuration.
Deploy instructions document which form service to activate.

---

## Monorepo Structure

```
nexcms/
├── packages/
│   ├── types/              ← ProjectSchema, SiteRecord, UserRecord, all shared types
│   ├── generator/          ← project.json → Astro output files
│   ├── template-engine/    ← nexcms.template.json manifest reader + slot mapper
│   ├── asset-tools/        ← sharp + satori tooling
│   ├── seo-tools/          ← Sitemap, robots.txt, meta, Schema.org (zero deps)
│   ├── builder/            ← LOCAL: React 19 + Vite wizard UI (desktop-first)
│   ├── cli/                ← LOCAL: nexcms CLI
│   └── saas/               ← SAAS: Astro hybrid (mobile-first)
│       ├── dashboard/
│       ├── editor/
│       └── renderer/
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
└── README.md
```

---

## Project-Specific Rules

1. **`packages/types/` is the single source of truth.** All TypeScript interfaces live here.
   No package defines its own duplicate types. `ProjectSchema` is the core contract —
   any change to it requires updating generator, template-engine, builder, and saas simultaneously.

2. **Business type templates are structure-only.** No colors, no fonts, no visual styling
   in any file under `templates/`. CSS variables injected by styles only. Hard rule.

3. **Style templates are CSS-only.** No content logic, no Astro component changes,
   no slot definitions in any file under `styles/`. Hard rule.

4. **No Python anywhere in the build pipeline.** All tooling runs in Node.js/Bun.
   `sharp` and `satori` cover all image and asset needs.

5. **Local Builder has zero runtime dependencies beyond Node.js.**
   No database, no server, no Python, no external API calls required to run the builder
   or perform an export. Offline-capable for all core functionality.

6. **SaaS service role key is server-side only.** Never in client bundles, never in
   browser-accessible env vars. Use `PUBLIC_` prefix only for anon/public Supabase keys.

7. **Turborepo pipeline compliance.** All build, test, lint tasks declared in `turbo.json`.
   No ad-hoc build steps outside the pipeline.

8. **Conventional Commits format required.** All commits follow:
   `type(scope): description` — type is feat/fix/docs/chore/refactor/test.

9. **Branch naming:** `feature/[package]-[short-description]` · `fix/[package]-[issue]`
   · `chore/[scope]` · `docs/[topic]`

10. **Mobile-first for SaaS, desktop-first for Local Builder.**
    All SaaS UI components designed and tested at 390px width first.
    Local Builder UI designed at 1280px width first.

11. **Open-source safe.** No secrets in committed files. `.env.example` updated alongside
    every new env var. All dependencies MIT or Apache-2.0 compatible.

12. **Phase 0 is not closed until all 7 checkpoints are complete.**
    Do not write production logic in generator, builder, saas, or templates until
    Phase 0 DoD is fully checked off. See README.md for checkpoint list.

---

## Supabase Schema (Designed in Phase 0)

```sql
-- Core tables — designed Phase 0, implemented Phase 3

users              id, email, is_super_admin, created_at
sites              id, owner_user_id, subdomain (unique), custom_domain (unique),
                   business_type, style_template, color_theme, mode,
                   project_data JSONB, status, created_at, updated_at
form_submissions   id, site_id, form_type, data JSONB, read, created_at
media              id, site_id, filename, storage_path, url, type, size, created_at

-- RLS policy intent (plain English, SQL written in Phase 3)
-- sites: owner reads/writes own rows; super_admin reads/writes all rows
-- form_submissions: owner reads own site submissions; public can INSERT
-- media: owner reads/writes own site media
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
| `RESEND_API_KEY` | SaaS | Yes | Email notifications for form submissions |
| `PORT` | SaaS | No (3000) | Server port |
| `NODE_ENV` | Both | Yes | development or production |

Never commit values. Always use `.env.example`.

---

## Phase 0 — Definition of Done

No production code is written until all checkpoints are checked off.

- [ ] CP1 — `ProjectSchema` TypeScript interface locked in `packages/types/`
- [ ] CP2 — `nexcms.template.json` manifest spec written and documented
- [ ] CP3 — Supabase schema designed (tables, RLS policies, constraints)
- [ ] CP4 — Monorepo scaffolded (all packages as stubs, Turborepo configured)
- [ ] CP5 — Architectural decisions documented in `AGENTS.md`
- [x] CP6 — `README.md` and `AGENTS.md` fully updated ✅
- [ ] CP7 — Restaurant template stub created with `nexcms.template.json`

**Sequence:** CP1 → (CP2 + CP3 in parallel) → CP4 → (CP5 + CP6 in parallel) → CP7 → Phase 0 CLOSED

---

## Current Phase Context

```
Phase:              0 — Architecture & Planning
Phase goal:         Lock all contracts and architectural decisions before any
                    production code is written. Types, manifest spec, Supabase
                    schema, monorepo scaffold, docs, template stub.
Timeline:           Now → July 2026
Definition of done: All 7 checkpoints above checked off.
Next phase:         Phase 1 — Generator Core (Jul–Sep 2026)
                    generator + template-engine packages. Restaurant template +
                    Hearth style. CLI triggers export. No builder UI yet.
```

---

## Roadmap Reference

| Phase | Timeline | Goal |
|---|---|---|
| **0 — Replan** | Now → Jul 2026 | Types, manifest spec, schema, scaffold, docs, template stub |
| **1 — Generator Core** | Jul–Sep 2026 | generator + template-engine, restaurant + hearth, CLI export |
| **2 — Local Builder** | Sep–Nov 2026 | Full wizard UI, all 8 business types, all 6 styles, zip export |
| **3 — SaaS Foundation** | Nov 2026–Feb 2027 | Supabase, auth, mobile dashboard, live editing, custom domains |
| **4 — SaaS Polish** | Feb–Apr 2027 | GitHub push, one-click deploy, analytics, form storage |
| **5 — Public Launch** | Q2 2027 | nexcms.io public, docs, pricing, template marketplace |

---

## Agent Confirmation for NexCMS

After loading this file, add to `DISPATCH CONFIRMED`:

```
Project AGENTS.md: loaded — NexCMS
Stack: TypeScript · Astro 5 · Supabase · React 19 + Vite · sharp · satori · Turborepo
Phase: 0 — Architecture & Planning (no production code yet)
Product: Guided website builder — Local Builder (static zip) + SaaS Hub (live Supabase)
Project rules active: 12
Architectural decisions locked: 5 (SaaS rendering, no Python, template decoupling,
  admin bypass, form handling)
Phase 0 DoD: 7 checkpoints — CP6 complete, 6 remaining
Do NOT suggest: Hono, Drizzle, raw PostgreSQL, Craftjs, WASM runtime, Python scripts,
  Docker as core requirement, Next.js, eventemitter3, mathjs
```

---

*Version: 2.0 | Extends: ShadowWalkerNC/.github/AGENTS.md | Project: NexCMS*
*Last updated: July 2, 2026 — Phase 0 product pivot complete*
