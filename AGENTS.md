# AGENTS.md — Plated

> **Extends:** `ShadowWalkerNC/.github/AGENTS.md` — all global rules apply unconditionally.
> **Auto-loaded by:** Claude Code · GitHub Copilot · OpenAI Codex · Cursor · Windsurf
> **Canonical global system:** [ShadowWalkerNC/.github](https://github.com/ShadowWalkerNC/.github)

---

## Project Identity

```
Project:      Plated
Version:      4.3
Description:  Full-featured guided website builder for the restaurant and hospitality industry.
              Two modes: Local Builder (Electron desktop app, offline-capable, static Astro zip
              export) and SaaS Hub (PLATED_DOMAIN — live editing, Supabase-backed, mobile-first).
              Includes: Square POS, Meta/Instagram, Google Business, Apple Maps, Yelp integrations.
              AI writing tools via Google Gemini API.
              Block-level drag-and-drop editor (@dnd-kit).
              Dual extension system: JSON config toggles + npm plugin registry.
              Blog/events/specials content engine. Multi-location support.
              PDF menu export, QR code generation, PWA support.
Status:       Phase 2 — Local Builder (active)
Open-source:  Yes (MIT)
Monorepo:     Yes — pnpm workspaces + Turborepo
```

---

## ⚠️ CRITICAL — What Plated Is

Plated is a **guided website builder** for hospitality businesses. Two modes:
1. **Local Builder** — Electron desktop app, React 19 + Vite wizard, exports static Astro zip. Fully offline.
2. **SaaS Hub** — PLATED_DOMAIN, Astro hybrid, Supabase backend, live editing, mobile-first.

This is NOT a self-hosted CMS. NOT a Joomla/WordPress replacement. NOT a server you install.

**Do NOT suggest:**
- Hono, Drizzle ORM, raw PostgreSQL, Craftjs, WASM, eventemitter3, mathjs — old plan, rejected
- Docker as a core requirement — Local Builder has zero server dependencies
- Python for any tooling — all asset/SEO/AI tools use Node.js
- Tauri — Electron is locked
- Next.js — Astro 5 is locked
- Puppeteer / headless Chrome — satori + sharp covers all image generation needs

---

## Full Tech Stack

```
Language:           TypeScript (all packages)
Monorepo:           pnpm workspaces + Turborepo
Runtime (dev):      Bun (~4x faster installs)
Runtime (prod):     Node.js 22
Templates:          Astro 5 (static for Local, hybrid for SaaS)
Local Builder:      Electron + React 19 + Vite + Shadcn/UI (desktop-first, 1280px)
SaaS frontend:      Astro 5 hybrid mode (mobile-first, 390px)
Database:           Supabase (PostgreSQL + RLS multi-tenancy)
Auth:               Supabase Auth (email, magic link, OAuth)
Storage:            Supabase Storage (logos, hero images, uploads)
Image tools:        sharp (WebP, favicons, optimization)
OG images:          satori + sharp (zero headless browser dependency)
SEO:                Native Node.js (sitemap, robots.txt, Schema.org)
AI tools:           Google Gemini API (description, alt text, SEO, color palette)
PDF export:         jsPDF (printable menu generation)
QR codes:           qrcode npm package
Analytics:          Plausible (default, privacy-first)
DnD editor:         @dnd-kit/core + @dnd-kit/sortable
Code editor:        CodeMirror 6 (script injection UI)
Styling:            Tailwind CSS + CSS Variables
CDN/Cache:          Cloudflare (edge cache + purge on content save)
SaaS hosting:       Railway (persistent Node.js server)
Forms (SaaS):       Supabase table + Resend
Forms (Local):      Netlify Forms or Formspree (in deploy instructions)
Extensions:         packages/extensions/ — JSON config + npm plugin resolver
Integrations:       packages/integrations/ — Square, Meta, Google, Apple Maps, Yelp
Background removal: @imgly/background-removal (no API key required)
Image crop:         react-image-crop
Stock photos:       Unsplash API
Multilingual:       Astro i18n routing
PWA:                Service worker + manifest.json generation
Cookies/GDPR:       vanilla-cookieconsent
```

---

## Architectural Decisions — LOCKED

All decisions locked Jul 2–4, 2026. Do not reverse without explicit owner approval.

### D1 — SaaS Rendering: Single Astro Server Instance
One Railway deployment. Middleware reads Host header → resolves tenant from Supabase → renders.
Cache: Cloudflare edge, s-maxage=300. On save: Supabase webhook → /api/revalidate → CF purge.
Result: edits live in <10 seconds. No rebuild pipeline.
Do NOT suggest: per-site static deploys, ISR rebuild pipelines, Netlify/Vercel for SaaS hosting.

### D2 — No Python. Node.js Only.
All asset processing, SEO, AI, PDF, QR uses Node.js packages.
Reason: `npx plated` must work without Python on any machine.
Do NOT suggest: Python, Pillow, PIL, or any Python-based tooling.

### D3 — Template Decoupling: Structure vs. Style
Business type templates: STRUCTURE + CONTENT SLOTS + BLOCK DEFINITIONS only. Zero styling.
Style templates: CSS VARIABLES only. Zero content logic.
8 structures × 6 styles. NOT 288 variants.
Do NOT add styling to templates. Do NOT add content logic to styles.

### D4 — Super-Admin: Supabase Service Role Bypass
Service role key: SERVER-SIDE ONLY. Never in browser env vars. Never prefixed PUBLIC_.
RLS policies use `is_super_admin` JWT claim for admin routes.

### D5 — Form Handling
SaaS: Supabase `form_submissions` table + Resend email notification.
Local: Netlify Forms or Formspree config in deploy instructions.

### D6 — Local Builder Shell: Electron
Electron wraps React 19 + Vite wizard UI. IPC bridge via preload.ts.
Key IPC channels:
- `window.plated.exportSite(projectData)` → generator + sharp + satori + SEO tools
- `window.plated.saveProject(data)` → writes project.plated.json to filesystem
- `window.plated.loadProject()` → reads project.plated.json
- `window.plated.openFile(filter)` → native file picker
- `window.plated.removeBackground(imagePath)` → @imgly/background-removal
- `window.plated.generateQR(url)` → qrcode
- `window.plated.exportPDF(menuData)` → jsPDF
CLI spawns Electron binary. `npx plated` is the entry point.
Do NOT suggest Tauri. Electron is locked. Pure JS/TS — no Rust.

### D7 — DnD: Block-Level (@dnd-kit)
Block-level drag-and-drop. Blocks reorder within sections. Sections toggle + reorder on page.
Block definitions in plated.template.json → `sections[].blocks[]`.
BlockSchema type in packages/types/.
Library: @dnd-kit/core + @dnd-kit/sortable. Do NOT introduce other DnD libraries.

### D8 — Extension System: Three Layers
Layer 1: JSON config (plated.config.json) — simple toggles, no code needed.
Layer 2: npm plugins (plated-plugin-*) — self-register, export PlatedPlugin object.
Layer 3: Script/CDN manager — CodeMirror editor for head/body injection + curated CDN list.
Each layer is additive. All three can be active simultaneously.

### D9 — Integration Architecture
All integrations in packages/integrations/. Each is a typed client module.
OAuth tokens: Supabase `integrations` table (SaaS, server-side) or local encrypted file (Local).
Wizard Step 3 for each: a) Connect button b) Connected status c) "Don't have one?" coaching prompt.
Square is the canonical integration pattern.
Integrations: square/ · meta/ · twitter/ · google/ · apple-maps/ · yelp/

### D10 — Service Tiers
Three tiers: self_serve | managed | white_glove.
All managed via super-admin dashboard.
Supabase sites table: `tier`, `managed_by`, `billing_status`.

### D11 — Content Engine: Astro Content Collections
Blog, events, specials, press use Astro Content Collections (file-based, zero CMS dependency).
Local: markdown files in exported Astro project. SaaS: stored as JSONB in Supabase project_data.
No external headless CMS (Contentful, Sanity, etc.) — keep zero external dependencies.

### D12 — AI Tools: Google Gemini API
All AI features use Google Gemini API (already in ShadowWalkerNC stack).
AI tools in packages/ai-tools/.
Features: description writer, menu description writer, alt text generator,
          SEO recommendations, color palette suggester.
All AI calls are SERVER-SIDE in SaaS. In Local Builder: user provides their own GEMINI_API_KEY.
Do NOT use OpenAI, Anthropic, or other AI providers — Gemini is locked.

### D13 — Analytics: Plausible Default
Plausible is the default analytics provider (privacy-first, no cookies, no GDPR consent needed).
GA4 available as JSON config extension toggle.
Analytics dashboard in SaaS uses Chart.js for displaying Plausible data.
Do NOT use Google Analytics as the default.

### D14 — PDF + QR: jsPDF + qrcode
jsPDF for printable menu PDF export.
qrcode (npm) for QR code generation (table tents, menus, receipts).
Both run in Node.js (Local: IPC handler, SaaS: API route).
Do NOT use browser-based PDF libs or external PDF generation APIs.

### D15 — Multi-Location: First-Class Feature
Multi-location is a first-class feature, not a plugin.
ProjectSchema supports `locations[]` array. Each location has: name, address, hours, phone, map, menuVariantId.
Template sections that reference location data iterate over `locations[]`.
Location switcher component available in all templates.

---

## Monorepo Structure

```
plated/
├── packages/
│   ├── types/                ← All TypeScript interfaces — single source of truth
│   │   ProjectSchema, SiteRecord, UserRecord, BlockSchema, PluginManifest,
│   │   IntegrationRecord, LocationRecord, MenuSchema, ContentCollection types
│   ├── generator/            ← project.plated.json → Astro output files
│   ├── template-engine/      ← plated.template.json manifest reader + block/slot mapper
│   ├── asset-tools/          ← sharp + satori (images, favicons, OG, WebP)
│   ├── seo-tools/            ← Sitemap, robots.txt, meta, Schema.org
│   ├── ai-tools/             ← Gemini API — writing, alt text, SEO, color palette
│   ├── pdf-tools/            ← jsPDF menu export + qrcode generation
│   ├── extensions/           ← Extension registry — JSON config + npm plugin resolver
│   ├── integrations/
│   │   ├── square/           ← Catalog, Orders, Gift Cards, Loyalty APIs
│   │   ├── meta/             ← Facebook + Instagram Graph API
│   │   ├── twitter/          ← X API v2
│   │   ├── google/           ← Business Profile + Maps Embed
│   │   ├── apple-maps/       ← Business Connect API
│   │   ├── yelp/             ← Yelp Fusion API
│   │   └── index.ts          ← Integration registry + shared types
│   ├── builder/              ← LOCAL: Electron + React 19 + Vite wizard UI
│   │   ├── src/              ← Wizard UI (desktop-first, 1280px)
│   │   │   ├── steps/        ← 8 wizard step components (all complete ✓)
│   │   │   ├── editor/       ← Block-level DnD editor (local) ← Phase 2
│   │   │   └── media/        ← Media library, crop, background removal ← Phase 2
│   │   └── electron/
│   │       ├── main.ts       ← Electron main process ✓
│   │       ├── preload.ts    ← Context bridge ✓
│   │       └── ipc/          ← IPC handlers: export, save, load, file, AI, PDF, QR
│   ├── cli/                  ← Plated CLI — spawns Electron, triggers export ✓
│   └── saas/                 ← SAAS: Astro hybrid (mobile-first, 390px)
│       ├── dashboard/        ← Client dashboard + super-admin
│       ├── editor/           ← Block-level DnD editor (SaaS)
│       └── renderer/         ← Tenant-aware site renderer
├── templates/
│   ├── restaurant/           ← plated.template.json ✓
│   ├── food-truck/           ← plated.template.json ✓
│   ├── bar/                  ← plated.template.json ✓
│   ├── cafe/                 ← plated.template.json ✓
│   ├── bakery/               ← plated.template.json ✓
│   ├── catering/             ← plated.template.json ✓
│   ├── food-stand/           ← plated.template.json ✓
│   └── ghost-kitchen/        ← plated.template.json ✓
├── styles/
│   ├── hearth/               ← variables.css ✓  (warm, rustic, editorial — serif)
│   ├── canvas/               ← variables.css ✓  (clean, minimal, system-font)
│   ├── midnight/             ← variables.css ✓  (dark, premium, moody — gold accents)
│   ├── market/               ← variables.css ✓  (fresh, botanical, Playfair Display)
│   ├── coast/                ← variables.css ✓  (airy, bright, hospitality — Lora)
│   └── ember/                ← variables.css ✓  (bold, dramatic, fire-lit — Oswald)
├── docs/
├── turbo.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── AGENTS.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── .env.example
└── README.md
```

---

## Project Rules (Hard)

1. `packages/types/` is the ONLY place TypeScript interfaces are defined. All packages import from there.
2. Business type templates: structure + blocks only. Zero styling, zero colors, zero fonts.
3. Style templates: CSS variables only. Zero content logic, zero block definitions.
4. No Python anywhere. All tooling runs in Node.js/Bun.
5. Local Builder: zero runtime dependencies beyond Node.js. Offline-capable.
6. SaaS service role key: server-side only. Never PUBLIC_ prefix. Never in client bundles.
7. Turborepo pipeline: all build/test/lint tasks declared in turbo.json. No ad-hoc steps.
8. Conventional Commits: `type(scope): description`. Types: feat/fix/docs/chore/refactor/test.
9. Branch naming: `feature/[package]-[desc]` · `fix/[package]-[issue]` · `chore/[scope]` · `docs/[topic]`
10. Mobile-first for SaaS (390px). Desktop-first for Local Builder (1280px).
11. No secrets in committed files. `.env.example` updated with every new env var.
12. DnD library: @dnd-kit only. No alternatives.
13. OAuth tokens never in project.plated.json (Local) or client-side (SaaS).
14. npm plugins must export a valid PlatedPlugin object. Invalid plugins throw at build time.
15. AI calls: server-side in SaaS. User-provided GEMINI_API_KEY in Local.
16. Phase sequence enforced. No SaaS code before Phase 4. No extension registry before Phase 6.
17. Multi-location via `locations[]` array in ProjectSchema. Not a plugin or bolt-on.
18. All content collections (blog, events, specials) use Astro Content Collections pattern.
19. Plausible is the default analytics. GA4 is an opt-in JSON config extension.
20. No external headless CMS (Contentful, Sanity, etc.). Zero external CMS dependencies.

---

## Supabase Schema

```sql
-- Designed Phase 0. Implemented Phase 4.

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
  business_type text
  style_template text
  color_theme text
  tier text          -- self_serve | managed | white_glove
  managed_by uuid nullable → users.id
  billing_status text -- active | paused | cancelled
  project_data jsonb -- full ProjectSchema
  status text        -- draft | published
  created_at timestamptz
  updated_at timestamptz

integrations
  id uuid PK
  site_id uuid → sites.id
  provider text      -- square | facebook | instagram | twitter | google | apple-maps | yelp
  access_token text  -- encrypted
  refresh_token text nullable
  token_expiry timestamptz nullable
  provider_account_id text
  metadata jsonb
  created_at timestamptz
  updated_at timestamptz

form_submissions
  id uuid PK
  site_id uuid → sites.id
  form_type text     -- contact | catering | reservation | newsletter
  data jsonb
  read boolean default false
  created_at timestamptz

media
  id uuid PK
  site_id uuid → sites.id
  filename text
  storage_path text
  url text
  type text          -- logo | hero | menu-item | gallery | video
  size integer
  created_at timestamptz

content_posts
  id uuid PK
  site_id uuid → sites.id
  type text          -- blog | event | special | press
  title text
  slug text
  body jsonb         -- rich text as JSON
  cover_image_url text nullable
  published_at timestamptz nullable
  event_date timestamptz nullable
  metadata jsonb     -- tags, categories, author, ticket_url, etc.
  created_at timestamptz
  updated_at timestamptz
```

---

## Environment Variables

See `.env.example` for the complete, annotated list.

Quick reference by category:
- **Supabase (SaaS):** PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
- **Cloudflare (SaaS):** CLOUDFLARE_ZONE_ID, CLOUDFLARE_API_TOKEN
- **Email (SaaS):** RESEND_API_KEY
- **AI:** GEMINI_API_KEY
- **Square:** SQUARE_APP_ID, SQUARE_APP_SECRET, SQUARE_ENVIRONMENT
- **Meta:** META_APP_ID, META_APP_SECRET
- **Twitter/X:** TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET
- **Google:** GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, PUBLIC_GOOGLE_MAPS_API_KEY
- **Apple Maps:** APPLE_MAPS_TOKEN, APPLE_MAPS_TEAM_ID
- **Yelp:** YELP_API_KEY
- **Analytics:** PLAUSIBLE_API_KEY, PLAUSIBLE_DOMAIN
- **Unsplash:** UNSPLASH_ACCESS_KEY
- **Twilio (optional):** TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
- **Local only:** ENCRYPTION_KEY
- **Both:** NODE_ENV, PORT (SaaS only)

---

## Phase Roadmap

| Phase | Timeline | Deliverables |
|---|---|---|
| **0 — Plan** | ✅ Jul 2026 | Types, manifest, schema, scaffold, docs |
| **1 — Generator** | ✅ Jul 2026 | generator + template-engine + CLI, all 8 manifests, all 6 styles, turbo pipeline |
| **2 — Local Builder** | Sep–Nov 2026 | Block DnD editor, full IPC handler suite, media library, PDF/QR, preview window |
| **3 — Integrations** | Nov 2026–Jan 2027 | Square full suite, Meta, Google, Apple Maps, Yelp, AI tools, existing site import |
| **4 — SaaS Foundation** | Jan–Mar 2027 | Supabase, auth, mobile dashboard, live editing, super-admin, tiers, custom domains |
| **5 — Content Engine** | Mar–May 2027 | Blog, events, specials, press. Multi-location. Email capture. Reservations widgets. |
| **6 — Extensions** | May–Jul 2027 | npm plugin registry, CDN picker, script injection, GitHub push, one-click deploy |
| **7 — Polish** | Jul–Sep 2027 | Analytics dashboard, Core Web Vitals, PWA, WCAG audit, print assets, multilingual, RTL |
| **8 — Launch** | Q4 2027 | PLATED_DOMAIN public, docs site, pricing, template marketplace |

---

## Current Phase Context

```
Phase:     2 — Local Builder
Goal:      Complete the Electron Local Builder to a shippable v0.1 desktop app.
           User opens app → wizard → export → gets a working Astro site zip.
           Block-level DnD editor wired and functional.
           All IPC handlers implemented and tested.
           Media library (upload, crop, background removal) fully working.
           PDF menu export + QR code generation via IPC.
           In-app preview window (Astro dev server or static serve).
Timeline:  Sep–Nov 2026

Already complete (carried from Phase 1, Jul 6–7, 2026):
  ✓ packages/generator/        — full generate() pipeline
  ✓ packages/template-engine/  — loadManifest, resolveSlots, interpolate, conditional
  ✓ packages/cli/              — bin, router, launch/new/export/preview/validate commands
  ✓ packages/asset-tools/      — favicons, WebP, OG image, color extraction
  ✓ packages/builder/src/wizard/ — all 8 steps complete
  ✓ packages/builder/electron/main.ts + preload.ts + bg-worker.html
  ✓ templates/ — all 8 plated.template.json manifests
  ✓ styles/    — all 6 variables.css (3 variants each)
  ✓ turbo.json — pipeline correct (type-check, test cache:false, clean task)

Remaining Phase 2 items:
  □ packages/builder/electron/ipc/
      export.ts    — calls generate() + asset-tools + seo-tools, zips output, returns path
      save.ts      — writes project.plated.json to user-chosen directory
      load.ts      — reads and validates project.plated.json
      file.ts      — native open/save file dialog wrappers
      ai.ts        — proxies Gemini API calls with user's GEMINI_API_KEY
      pdf.ts       — jsPDF menu PDF generation
      qr.ts        — qrcode generation (PNG buffer → IPC)
  □ packages/builder/src/editor/
      BlockEditor   — @dnd-kit drag-and-drop: blocks reorder within sections
      SectionPanel  — section visibility toggle + section reorder
      BlockToolbar  — per-block config panel (overlayOpacity, ctaLabel, etc.)
      EditorCanvas  — live preview iframe of generated site
  □ packages/builder/src/media/
      MediaLibrary  — upload, browse, select existing assets
      ImageCropper  — react-image-crop integration
      BgRemover     — UI wrapper for bg-worker.html IPC round-trip
  □ packages/builder/src/App.tsx — wire wizard → editor transition
      After Step 8 complete → show block editor with live preview
      Project save/load from title bar menu
      Export button → IPC export → success toast with output path
  □ packages/pdf-tools/ — jsPDF menu export implementation
      generateMenuPdf(schema) → Buffer
      Sections: header, categories, items with prices + dietary tags
      Page break logic for long menus
  □ packages/builder/electron/preview.ts
      Spawn Astro preview server (or sirv static) on random port
      Return URL to renderer → open in BrowserView
  □ In-app preview window (BrowserView or BrowserWindow)
      Triggered from editor toolbar: "Preview Site"
      Shows live Astro output in-app (no external browser required)

Note: The wizard UI is fully complete ahead of schedule. Phase 2 focus is
      entirely on the editor, IPC handlers, media tools, and preview window.
      Do NOT re-implement or refactor wizard steps — they are done.
```

---

## Agent Confirmation Block

After loading this file, confirm in DISPATCH:

```
Project: Plated v4.3
Stack: TypeScript · Astro 5 · Electron · React 19+Vite · Supabase · Gemini · sharp · satori · Turborepo
Phase: 2 — Local Builder
Product: Restaurant website builder — Electron Local (offline) + SaaS Hub (PLATED_DOMAIN)
Rules active: 20
Decisions locked: 15
Integrations: Square (full) · Meta/Instagram · Twitter/X · Google Business · Apple Maps · Yelp
AI: Google Gemini API (description, menu, alt text, SEO, color)
Extensions: JSON config · npm plugins (plated-plugin-*) · CDN/script manager
DnD: block-level — @dnd-kit/core + @dnd-kit/sortable
Content: Astro Content Collections — blog, events, specials, press
Service tiers: self_serve | managed | white_glove
Analytics: Plausible (default) + GA4 (optional extension)
Do NOT suggest: Tauri, Next.js, Python, Docker, Puppeteer, Contentful, Sanity, OpenAI, Webflow-DnD
```

---

*Version: 4.3 | Extends: ShadowWalkerNC/.github/AGENTS.md | Project: Plated*
*Last updated: July 7, 2026 — Phase 1 complete. Phase 2 active.*
