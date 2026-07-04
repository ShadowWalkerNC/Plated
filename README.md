# NexCMS

**A guided website builder for the restaurant and hospitality industry.**

> Build your restaurant website in minutes — not months.  
> Pick a template. Fill in your info. Connect your socials. Export and deploy anywhere.  
> Or use the online hub and manage everything from your phone.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Status: Phase 1](https://img.shields.io/badge/Status-Phase%201%20Generator%20Core-blue)]()
[![Stack: Astro + Electron + Supabase + TypeScript](https://img.shields.io/badge/Stack-Astro%20%2B%20Electron%20%2B%20Supabase%20%2B%20TypeScript-blue)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

---

## What Is NexCMS?

NexCMS is a **guided website builder** built specifically for restaurants, food trucks, bars, cafés, bakeries, pop-ups, and all hospitality businesses. It walks you through every step — business info, hours, menu, social media, integrations, branding — and produces a professional, SEO-optimized website you can deploy anywhere.

It runs in two modes:

- **Local Builder** — download the Electron desktop app, build on your computer, export a deployable zip with instructions. Fully offline capable.
- **SaaS Hub** — go to nexcms.io, build and manage your site entirely in-browser from any device, including your phone.

---

## Why NexCMS?

| Platform | Problem |
|---|---|
| WordPress | PHP bloat, plugin security debt, technical setup required |
| Squarespace / Wix | Monthly fees, no code ownership, generic templates |
| Custom dev | Expensive, slow, hard to maintain |
| DIY Astro/HTML | Too technical for most restaurant owners |

**NexCMS fills the gap.** Pre-built hospitality templates, a coaching wizard that guides non-technical owners through every field, built-in integrations for Square, Google, Apple Maps, and all major social platforms — and full export ownership with no lock-in.

---

## Core Philosophy

- **Guided, not overwhelming.** The wizard coaches users through each step, explains why things matter, and helps them create missing assets (like a Facebook page) on the spot.
- **Hospitality-first.** Every template, field, feature, and integration is designed around the needs of restaurants, food trucks, and food businesses — not generic websites.
- **Own your output.** Export a complete, deployable Astro site you control entirely. No vendor lock-in.
- **Two modes, one codebase.** Local Builder (Electron desktop app) for power users and developers. SaaS Hub for everyone else — especially mobile-first users.
- **Mobile-first SaaS.** The online hub is designed primarily for phones. Most restaurant owners run their business from their phone.
- **Connected by default.** Square menus, Google Business hours, social profiles — all connected in the wizard and kept in sync.

---

## Two Modes

### Local Builder (Electron Desktop App)

Download and install NexCMS as a native desktop application for macOS, Windows, or Linux. The wizard UI launches inside the Electron shell. Fill in your content, connect your integrations, pick a template, and export.

**Output:** A complete, pre-built static Astro site packaged as a zip, with a `DEPLOY_INSTRUCTIONS.md` tailored to your setup — covering Netlify, Vercel, Cloudflare Pages, and GitHub deployment. Power users can export the full Astro source and extend it with VS Code, Claude Code, or any editor.

**Also available via CLI:**
```bash
npx nexcms   # Launches the Electron app
```

**Best for:** Developers, designers, agencies, and technical users who want full control.

**Key trait:** Zero runtime dependencies beyond Node.js. No database, no server, no Python. Fully offline for all core builder functionality.

### SaaS Hub (nexcms.io)

Go to nexcms.io, create a free account, and build your site entirely in-browser. Your site lives on NexCMS infrastructure and is accessible via `yourname.nexcms.io` or your own custom domain.

**Live editing:** Change your hours, update your menu, add a special — changes go live in seconds. No rebuild required.

**Best for:** Restaurant owners, non-technical users, and anyone who wants to manage their site from their phone.

---

## Service Tiers

| Tier | Who | What |
|---|---|---|
| **Self-Serve** | Owner builds their own site | Full access to Local Builder or SaaS Hub |
| **Managed Build** | Owner wants it built for them | NexCMS admin builds the site on their behalf via super-admin dashboard |
| **White-Glove** | Owner wants ongoing management | NexCMS admin maintains, updates, and manages the site long-term |

Managed and White-Glove tiers are handled entirely through the super-admin dashboard — no separate tooling needed.

---

## Wizard Flow

The onboarding wizard guides users through 8 steps in order. Each step has contextual coaching, skip options where appropriate, and integration prompts:

1. **Business Info** — name, type, tagline, description, phone, email
2. **Existing Website** — optional reference URL; used for branding hints and content migration
3. **Social & Presence** — connect or create: Facebook, Instagram, Twitter/X, Google Business Profile, Apple Maps Business Connect
4. **Location & Hours** — address, Google Maps pin, Apple Maps listing, food truck weekly schedule, holiday closures
5. **Menu** — manual entry OR Square sync (if connected); categories, items, prices, photos, dietary tags
6. **Media & Branding** — logo, hero image, color palette (auto-extracted or manual), favicon generation
7. **Template & Style** — business type + visual style selection, light/dark mode, color theme
8. **Extensions & Integrations** — enable delivery platforms, reservations, loyalty links, custom scripts, npm plugins

If a user does not have a required account (e.g., no Facebook page), the wizard provides a direct link, explains why it matters, and allows them to come back after creating it.

---

## Integrations

### Social Media

| Platform | Integration | Wizard Behavior |
|---|---|---|
| **Facebook** | Meta Graph API — connect Business Page | If no page exists: prompted to create one with step-by-step link |
| **Instagram** | Instagram Graph API — connect profile, pull photo feed | If no account: prompted to create one |
| **Twitter / X** | X API v2 — connect profile, display post feed | Optional; skippable |

### Business Listings

| Platform | Integration | Wizard Behavior |
|---|---|---|
| **Google Business Profile** | Google My Business API — hours sync, photos, reviews display | If no listing: guided to create one via Google Maps |
| **Google Maps** | Maps Embed API — location map on site | Auto-populated from address; requires Google Maps API key |
| **Apple Maps Business Connect** | Apple Maps Connect API — listing, hours, location | If no listing: guided to create one |

### Point of Sale

| Platform | Integration | Wizard Behavior |
|---|---|---|
| **Square** | Square Catalog API — pull menu items, categories, prices | If no Square account: prompted to sign up; manual menu fallback always available |

### Delivery Platforms

Link-only integrations (no API required) — user provides their profile URL:
- DoorDash, Uber Eats, Grubhub, Toast, ChowNow

---

## Extension System

NexCMS supports two levels of extension:

### JSON Config Extensions (Simple Toggles)

Declared in `nexcms.config.json`. No code required. The wizard surfaces these as toggle options in Step 8.

```json
{
  "extensions": {
    "googleAnalytics": { "enabled": true, "trackingId": "G-XXXXXXXXXX" },
    "reservations": { "enabled": true, "provider": "opentable", "url": "https://..." },
    "loyaltyLink": { "enabled": false },
    "cookieBanner": { "enabled": true }
  }
}
```

### npm Package Extensions (Advanced)

Installed as npm packages that self-register with the NexCMS extension registry — similar to Astro integrations.

```bash
npm install nexcms-plugin-square
npm install nexcms-plugin-opentable
npm install nexcms-plugin-custom-scripts
```

Each plugin exports an `NexCMSPlugin` object declaring its wizard steps, config schema, Astro components to inject, and any environment variables required. The extension registry in `packages/extensions/` resolves and validates all installed plugins at build time.

---

## Drag-and-Drop Editor

NexCMS uses **block-level drag-and-drop** — users can reorder content blocks within page sections using a visual editor.

- Each page section (Hero, Menu, Hours, Gallery, etc.) contains one or more **content blocks**
- Blocks can be reordered within a section via drag handles
- Sections themselves can be toggled visible/hidden and reordered on the page
- Block definitions live in `nexcms.template.json` under each section's `blocks` array
- The drag-and-drop editor is part of `packages/builder/` (Electron) and `packages/saas/editor/` (SaaS)

---

## Features

- ✅ Guided onboarding wizard — coached step-by-step, not a blank form
- ✅ Social media OAuth connection — Facebook, Instagram, Twitter/X
- ✅ Google Business Profile sync — hours, photos, reviews
- ✅ Apple Maps Business Connect integration
- ✅ Square Catalog API — live menu sync from POS
- ✅ Existing website reference import — branding and content hints
- ✅ "Create account" coaching — prompts and guides users to set up missing platforms
- ✅ Block-level drag-and-drop editor
- ✅ JSON config extensions + npm plugin registry
- ✅ Two-axis template system — business type + visual style independently
- ✅ Light/Dark mode + multiple color themes per style
- ✅ Menu builder — categories, items, prices, photos, dietary tags
- ✅ Hours builder — day-by-day, holiday closures, food truck weekly schedules
- ✅ Location schedule — food truck weekly location map
- ✅ SEO auto-generation — meta tags, sitemap, robots.txt, Schema.org structured data
- ✅ OG image generation — branded social share images
- ✅ Favicon + app icon generation — full set from logo, all sizes
- ✅ Image optimization — auto WebP conversion, blur-up placeholders
- ✅ Contact and catering inquiry forms
- ✅ Google Maps embed
- ✅ Delivery platform links (DoorDash, Uber Eats, Grubhub)
- ✅ Mobile-first SaaS dashboard
- ✅ Super-admin dashboard — Managed and White-Glove tier management
- ✅ Live editing without rebuild (SaaS mode)
- ✅ Custom domain support (SaaS mode)
- ✅ Electron desktop app — fully offline, zero server dependencies
- ✅ Export full Astro source for developer customization (Local mode)
- ✅ GitHub push integration (Phase 4)

---

## Business Types (v1 — Hospitality Focus)

| Type | Key Pages | Special Sections |
|---|---|---|
| **Restaurant** | Home, Menu, Hours, About, Contact | Full menu, reservation link, Google Maps |
| **Food Truck** | Home, Menu, Schedule, About, Contact | Weekly location schedule, rotating menu |
| **Bar / Nightclub** | Home, Drinks, Events, About, Contact | Events listing, specials, age gate option |
| **Café / Coffee Shop** | Home, Menu, Gallery, About, Contact | Featured drinks, gallery, loyalty link |
| **Bakery / Dessert** | Home, Menu, Gallery, Order, Contact | Online order link, seasonal specials |
| **Catering** | Home, Services, Gallery, Pricing, Contact | Catering inquiry form, service packages |
| **Food Stand / Pop-Up** | Home, Menu, Schedule, Contact | Pop-up schedule, social-first layout |
| **Ghost Kitchen** | Home, Menu, Order, Contact | Delivery platform links, no dine-in sections |

*Phase 2 expands to: Small Business, Startup, Portfolio, Event Venue*

---

## Template System

Every site is defined by two independent choices:

### Axis 1 — Business Type
Defines the pages, sections, content fields, and available blocks your site needs.

### Axis 2 — Visual Style
Defines look, feel, typography, and color palette — applied on top of any business type.

| Style | Vibe | Best For |
|---|---|---|
| **Hearth** | Warm, rustic, editorial | Restaurants, cafés, hospitality |
| **Spark** | Bold, vibrant, energetic | Food trucks, nightlife, artists |
| **Steel** | Corporate, clean, minimal | Catering, business services |
| **Bloom** | Bright, playful, airy | Bakeries, dessert shops, events |
| **Obsidian** | Dark mode, moody, typographic | Bars, nightclubs, creative |
| **Ghost** | Monochrome, magazine-style | Pop-ups, ghost kitchens, modern |

Each style ships with **Light and Dark variants** plus **3+ color themes**. 8 structures × 6 styles maintained independently — not 288 combined variants.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Monorepo** | Turborepo + pnpm workspaces | Parallel builds, shared config |
| **Language** | TypeScript (all packages) | Type safety across the full codebase |
| **Runtime (dev)** | Bun | ~4× faster installs and cold starts |
| **Runtime (prod)** | Node.js 22 | Ecosystem stability |
| **Templates** | Astro 5 | Static output + server islands, deploys anywhere |
| **Local Builder shell** | Electron | Native desktop app, fully offline, pure JS/TS |
| **Builder UI** | React 19 + Vite + Shadcn/UI | Wizard UI inside Electron (desktop-first) |
| **SaaS frontend** | Astro 5 hybrid mode | Mobile-first, server islands for dynamic content |
| **Database (SaaS)** | Supabase (PostgreSQL) | Managed, RLS multi-tenancy, real-time |
| **Auth (SaaS)** | Supabase Auth | Email/password, magic link, OAuth |
| **File storage (SaaS)** | Supabase Storage | Logos, hero images, menu photos |
| **Image processing** | sharp | WebP optimization, favicon generation, all sizes |
| **OG image generation** | satori + sharp | Branded social images, no headless browser |
| **SEO generation** | Native Node.js | Sitemap, robots.txt, Schema.org — zero dependencies |
| **Styling** | Tailwind CSS + CSS Variables | Style injection without conflicts |
| **CDN / Cache** | Cloudflare | Edge caching + cache purge on content save |
| **SaaS hosting** | Railway | Persistent Node.js server, no cold starts |
| **Shared types** | `packages/types/` | Single source of truth for all contracts |

---

## Monorepo Structure

```
nexcms/
├── packages/
│   ├── types/              ← ProjectSchema, SiteRecord, UserRecord, BlockSchema, PluginManifest
│   ├── generator/          ← project.json → Astro output files
│   ├── template-engine/    ← nexcms.template.json manifest reader + block/slot mapper
│   ├── asset-tools/        ← sharp + satori tooling
│   ├── seo-tools/          ← Sitemap, robots.txt, meta, Schema.org (zero deps)
│   ├── extensions/         ← Extension registry — resolves JSON config + npm plugins
│   ├── integrations/       ← Square, Meta, Google, Apple Maps OAuth + sync clients
│   ├── builder/            ← LOCAL: Electron shell + React 19 + Vite wizard UI
│   │   ├── src/            ← React wizard UI (desktop-first)
│   │   └── electron/       ← main.ts, preload.ts, IPC handlers
│   ├── cli/                ← LOCAL: nexcms CLI — launches Electron, triggers export
│   └── saas/               ← SAAS: Astro hybrid app (mobile-first)
│       ├── dashboard/      ← Client + admin + super-admin dashboard
│       ├── editor/         ← In-browser block-level drag-and-drop editor
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

## SaaS Architecture

The SaaS Hub runs as a **single Astro server instance** on Railway. All client sites are served from one deployment.

```
User visits tacos-el-primo.nexcms.io
        ↓
Astro middleware reads Host header
        ↓
Looks up tenant in Supabase sites table
        ↓
Renders site with tenant's content + active integrations
        ↓
Cloudflare caches rendered page at edge (5 min)
        ↓
Owner saves edit → Supabase webhook → cache purge → live in <10 seconds
```

---

## Roadmap

| Phase | Timeline | Goal |
|---|---|---|
| **Phase 0 — Replan** | ✅ Done | Types, manifest spec, schema, scaffold, docs, template stub |
| **Phase 1 — Generator Core** | Jul–Sep 2026 | `generator` + `template-engine`. Restaurant + Hearth. CLI + Electron shell. JSON in → Astro site out. |
| **Phase 2 — Local Builder** | Sep–Nov 2026 | Full Electron wizard UI. All 8 business types. All 6 styles. Block-level DnD. Zip export. |
| **Phase 3 — Integrations** | Nov 2026–Jan 2027 | Square, Meta/Instagram, Google Business Profile, Apple Maps, existing website import, OAuth flows. |
| **Phase 4 — SaaS Foundation** | Jan–Mar 2027 | Supabase, auth, mobile-first SaaS dashboard, live editing, super-admin, custom domains, service tiers. |
| **Phase 5 — Extensions** | Mar–May 2027 | JSON config extensions, npm plugin registry, `packages/extensions/`, plugin authoring docs. |
| **Phase 6 — SaaS Polish** | May–Jul 2027 | GitHub push integration, one-click deploy, analytics, form storage, White-Glove tooling. |
| **Phase 7 — Public Launch** | Q3 2027 | nexcms.io public, docs site, pricing model, template marketplace. |

---

## Getting Started (Local Builder)

> ⚠️ NexCMS is currently in **Phase 1 — Generator Core**. The full Electron builder will be available in Phase 2.

```bash
# Launch the local builder (Phase 2+)
npx nexcms

# Or install globally
npm install -g nexcms
nexcms
```

**Requirements:** Node.js 22+. Nothing else.

---

## CLI Reference

```bash
nexcms                    # Launch the Electron wizard app
nexcms new                # Start a new project
nexcms export             # Export current project to deployable zip
nexcms export --source    # Export full Astro source for developer customization
nexcms preview            # Preview the built site locally
```

---

## Contributing

NexCMS is open source and welcomes contributions — templates, styles, plugins, bug reports, and code.

1. Fork this repo
2. Create a feature branch: `feature/[package]-[description]`
3. Commit using Conventional Commits format
4. Open a pull request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

---

## License

MIT — free to use, modify, and distribute. Forever.

```
MIT License
Copyright (c) 2026 Nathaniel Cowperthwaite (ShadowWalkerNC)
```

---

## Built By

**Nate Cowperthwaite** ([@ShadowWalkerNC](https://github.com/ShadowWalkerNC))  
Chef. Developer. Builder of things.

*NexCMS exists because restaurant owners shouldn't need a developer to have a great website.*
