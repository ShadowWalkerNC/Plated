# NexCMS

**A guided website builder for the restaurant and hospitality industry.**

> Build your restaurant website in minutes — not months.  
> Pick a template. Fill in your info. Export and deploy anywhere.  
> Or use the online hub and manage everything from your phone.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Status: Phase 0](https://img.shields.io/badge/Status-Phase%200%20Planning-yellow)]()
[![Stack: Astro + Supabase + TypeScript](https://img.shields.io/badge/Stack-Astro%20%2B%20Supabase%20%2B%20TypeScript-blue)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

---

## What Is NexCMS?

NexCMS is a **guided website builder** built specifically for restaurants, food trucks, bars, cafés, and hospitality businesses. It walks you through every step — business info, hours, menu, social media, branding — and produces a professional, SEO-optimized website you can deploy anywhere.

It runs in two modes:

- **Local Builder** — download the app, build on your computer, export a deployable zip with instructions
- **SaaS Hub** — go to nexcms.io, build and manage your site entirely in-browser from any device

---

## Why NexCMS?

| Platform | Problem |
|---|---|
| WordPress | PHP bloat, plugin security debt, technical setup required |
| Squarespace / Wix | Monthly fees, no code ownership, generic templates |
| Custom dev | Expensive, slow, hard to maintain |
| DIY Astro/HTML | Too technical for most restaurant owners |

**NexCMS fills the gap.** Pre-built hospitality templates, a coaching wizard that guides non-technical owners through every field, and full export ownership — no lock-in, no monthly fees for the local version.

---

## Core Philosophy

- **Guided, not overwhelming.** The wizard coaches users through each step, explains why things matter, and helps them create missing assets (like a Facebook page) on the spot.
- **Hospitality-first.** Every template, field, and feature is designed around the needs of restaurants, food trucks, and food businesses — not generic websites.
- **Own your output.** Export a complete, deployable Astro site you control entirely. No vendor lock-in.
- **Two modes, one codebase.** Local Builder for power users and developers. SaaS Hub for everyone else — especially mobile-first users.
- **Mobile-first SaaS.** The online hub is designed primarily for phones. Most restaurant owners run their business from their phone.

---

## Two Modes

### Local Builder

Download and run NexCMS locally via the CLI. A wizard UI launches in your browser at `localhost:3000`. Fill in your content, pick a template, and export.

**Output:** A complete, pre-built static Astro site packaged as a zip, with a `DEPLOY_INSTRUCTIONS.md` tailored to your setup — covering Netlify, Vercel, Cloudflare Pages, and GitHub deployment. Power users can export the full Astro source and extend it with VS Code, Claude Code, or any editor.

**Best for:** Developers, designers, agencies, and technical users who want full control.

### SaaS Hub (nexcms.io)

Go to nexcms.io, create a free account, and build your site entirely in-browser. Your site lives on NexCMS infrastructure and is accessible via `yourname.nexcms.io` or your own custom domain.

**Live editing:** Change your hours, update your menu, add a special — changes go live in seconds. No rebuild required.

**Best for:** Restaurant owners, non-technical users, and anyone who wants to manage their site from their phone.

---

## Features

- ✅ Guided onboarding wizard — coached step-by-step, not a blank form
- ✅ Social media coaching — help creating Facebook, Instagram, Google listing if needed
- ✅ Two-axis template system — pick a business type + a visual style independently
- ✅ Light/Dark mode + multiple color themes per style
- ✅ Menu builder — categories, items, prices, photos, dietary tags
- ✅ Hours builder — day-by-day, holiday closures, food truck weekly schedules
- ✅ Location schedule — food truck weekly location map
- ✅ SEO auto-generation — meta tags, sitemap, robots.txt, Schema.org structured data
- ✅ OG image generation — branded social share images from your business name and colors
- ✅ Favicon + app icon generation — full set from your logo, all sizes
- ✅ Image optimization — auto WebP conversion, blur-up placeholders
- ✅ Contact and catering inquiry forms
- ✅ Google Maps embed
- ✅ Delivery platform links (DoorDash, Uber Eats, Grubhub)
- ✅ Mobile-first SaaS dashboard
- ✅ Super-admin dashboard — manage all client sites from one place
- ✅ Live editing without rebuild (SaaS mode)
- ✅ Custom domain support (SaaS mode)
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
Defines the pages, sections, and content fields your site needs. Selecting your business type determines what the wizard asks you and what pages are generated.

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

Each style ships with **Light and Dark variants** plus **3+ color themes**. Business type templates define structure only — zero styling. Style templates inject CSS variables exclusively. This means 8 structures + 6 styles are maintained independently, not as 288 separate combinations.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Monorepo** | Turborepo + pnpm workspaces | Parallel builds, shared config |
| **Language** | TypeScript (all packages) | Type safety across the full codebase |
| **Runtime (dev)** | Bun | ~4× faster installs and cold starts |
| **Runtime (prod)** | Node.js 22 | Ecosystem stability |
| **Templates** | Astro 5 | Static output + server islands, deploys anywhere |
| **Builder UI** | React 19 + Vite + Shadcn/UI | Local wizard app (desktop-first) |
| **SaaS frontend** | Astro 5 hybrid mode | Mobile-first, server islands for dynamic content |
| **Database (SaaS)** | Supabase (PostgreSQL) | Managed, RLS multi-tenancy, real-time |
| **Auth (SaaS)** | Supabase Auth | Email/password, magic link |
| **File storage (SaaS)** | Supabase Storage | Logos, hero images, menu photos |
| **Image processing** | sharp | WebP optimization, favicon generation, all sizes |
| **OG image generation** | satori + sharp | Branded social images, no headless browser |
| **SEO generation** | Native Node.js | Sitemap, robots.txt, Schema.org — zero dependencies |
| **Styling** | Tailwind CSS + CSS Variables | Style injection without conflicts |
| **CDN / Cache** | Cloudflare | Edge caching + cache purge on content save |
| **SaaS hosting** | Railway | Persistent Node.js server, no cold starts |
| **Shared types** | `packages/types/` | Single source of truth for all contracts |

---

## SaaS Architecture

The SaaS Hub runs as a **single Astro server instance** on Railway. All client sites are served from one deployment — the server reads the incoming domain, resolves the tenant from Supabase, and renders that site's content.

```
User visits tacos-el-primo.nexcms.io
        ↓
Astro middleware reads Host header
        ↓
Looks up tenant in Supabase sites table
        ↓
Renders site with tenant's content
        ↓
Cloudflare caches rendered page at edge (5 min)
        ↓
Owner saves edit → Supabase webhook → cache purge → live in <10 seconds
```

**No rebuild pipeline.** Content changes are live in under 10 seconds via Cloudflare cache purge.

---

## Monorepo Structure

```
nexcms/
├── packages/
│   ├── types/              ← Single source of truth — ProjectSchema, SiteRecord, UserRecord
│   ├── generator/          ← Core: project.json → Astro output files
│   ├── template-engine/    ← Reads nexcms.template.json manifests, maps content slots
│   ├── asset-tools/        ← sharp (images/favicons) + satori (OG images)
│   ├── seo-tools/          ← Sitemap, robots.txt, meta tags, Schema.org (zero deps)
│   ├── builder/            ← LOCAL: React + Vite wizard UI (desktop-first)
│   ├── cli/                ← LOCAL: `nexcms` CLI — launches builder, triggers export
│   └── saas/               ← SAAS: Astro hybrid app (mobile-first)
│       ├── dashboard/      ← Client + admin dashboard
│       ├── editor/         ← In-browser site editor
│       └── renderer/       ← Tenant-aware site renderer
├── templates/
│   ├── restaurant/         ← Astro project scaffold + nexcms.template.json
│   ├── food-truck/
│   ├── bar/
│   ├── cafe/
│   ├── bakery/
│   ├── catering/
│   ├── food-stand/
│   └── ghost-kitchen/
├── styles/
│   ├── hearth/             ← Tailwind config + CSS variables
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

## Roadmap

| Phase | Timeline | Goal |
|---|---|---|
| **Phase 0 — Replan** | Now → Jul 2026 | Lock ProjectSchema types, template manifest spec, Supabase schema design, monorepo scaffold, update all docs, restaurant template stub |
| **Phase 1 — Generator Core** | Jul → Sep 2026 | `generator` + `template-engine` working. Restaurant template + Hearth style. CLI triggers export. JSON in → Astro site out. No UI yet. |
| **Phase 2 — Local Builder** | Sep → Nov 2026 | Full wizard UI (`packages/builder/`). All 8 hospitality business types. All 6 styles. Export to zip with deploy instructions. Desktop-first. |
| **Phase 3 — SaaS Foundation** | Nov 2026 → Feb 2027 | Supabase integration, account system, mobile-first SaaS dashboard, live editing, ISR pipeline, super-admin dashboard, custom domains |
| **Phase 4 — SaaS Polish** | Feb → Apr 2027 | GitHub push integration, one-click Netlify/Vercel deploy, client analytics, SEO automation, form submission storage |
| **Phase 5 — Public Launch** | Q2 2027 | nexcms.io public, docs site, pricing model, template marketplace |

---

## Phase 0 — Definition of Done

Phase 0 is not closed until all checkpoints are complete. No production code begins until Phase 0 exits.

- [ ] **CP1** — `ProjectSchema` TypeScript interface locked in `packages/types/`
- [ ] **CP2** — `nexcms.template.json` manifest spec written and documented
- [ ] **CP3** — Supabase schema designed (all tables, RLS policies, constraints)
- [ ] **CP4** — Monorepo scaffolded (all packages as stubs, Turborepo configured)
- [ ] **CP5** — Architectural decisions documented in `AGENTS.md`
- [ ] **CP6** — `README.md` and `AGENTS.md` fully updated ✅ *(this commit)*
- [ ] **CP7** — Restaurant template stub created with `nexcms.template.json`

---

## Local Builder — Getting Started

> ⚠️ NexCMS is currently in **Phase 0 — Planning**. The builder will be available when Phase 1 (Generator Core) is complete.

```bash
# Install and launch the local builder
npx nexcms

# Or install globally
npm install -g nexcms
nexcms
```

**Requirements:** Node.js 22+. Nothing else — no database, no Python, no server.

---

## CLI Reference

```bash
nexcms                    # Launch the builder wizard at localhost:3000
nexcms new                # Start a new project
nexcms export             # Export current project to deployable zip
nexcms export --source    # Export full Astro source for developer customization
nexcms preview            # Preview the built site locally
```

---

## Contributing

NexCMS is open source and welcomes contributions — templates, styles, bug reports, and code.

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
