# NexCMS

**A free, open-source, self-hosted CMS built for the modern web.**

> Own your stack. Own your content. Own your sites — forever.
> No monthly fees. No platform lock-in. No one else's rules.
> Server + domain = unlimited free sites.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Status: Alpha](https://img.shields.io/badge/Status-Alpha%20Planning-yellow)]()
[![Stack: React + Node.js](https://img.shields.io/badge/Stack-React%20%2B%20Node.js-blue)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

---

## What Is NexCMS?

NexCMS is a self-hosted content management system inspired by the install-and-own philosophy of Joomla — rebuilt from the ground up using modern web technology.

Drop it on any server. Add your domain. Install themes and extensions as zip packages. Build unlimited sites for free.

Think of it as **Joomla meets modern React** — with a visual drag-and-drop page builder, a clean extension API, an open REST API anyone can build against, and zero vendor dependency.

---

## Why NexCMS?

Every major CMS today falls into one of two traps:

| Platform | Problem |
|---|---|
| WordPress | PHP bloat, plugin security debt, constant hosting dependency |
| Squarespace / Wix / Webflow | Monthly fees, no code ownership, platform lock-in |
| Strapi / Payload | Headless only — no visual front-end, developers only |
| Ghost | Publishing/blog focused, not a general site builder |
| Joomla (original) | Right idea, wrong era — PHP stack, dated UX |

**NexCMS fills the gap.** You install it once. You own it. You build on it forever.

---

## Core Philosophy

- **Install and own.** Download the package, upload to your server, run the web-based installer. Done.
- **Joomla-style extensions.** Components, Modules, Plugins, and Packages — installable as zip files, no code editing required.
- **Theme as a package.** Build a theme, zip it, install it, activate it. Share it on GitHub.
- **Open REST API.** Fully documented. Anyone can build against any NexCMS install — mobile apps, integrations, tools.
- **No middleman, ever.** Your server. Your domain. Your data. No monthly bill, no account required.

---

## Features

- ✅ Web-based guided installer (no CLI required to get started)
- ✅ Visual drag-and-drop page builder
- ✅ Block-based content editor (Hero, Rich Text, Gallery, Cards, CTA, Embed, and more)
- ✅ Custom content types (Collections) — build your own data models
- ✅ Theme system — install, activate, and customize themes from the admin panel
- ✅ Extension system — Components, Modules, Plugins, Packages
- ✅ Open REST API — public, documented, open for third-party development
- ✅ Media library with folder organization
- ✅ Role-based access control (Super Admin, Admin, Editor, Author, Viewer)
- ✅ SEO engine — meta tags, Open Graph, sitemap, schema markup
- ✅ Navigation manager — multi-menu support with nested items
- ✅ Webhook system — fire events on publish, form submit, media upload
- ✅ Multi-site capable (one NexCMS install, multiple domains — Phase 4)
- ✅ Docker self-host config
- ✅ One-command deploy to Railway / Render / Cloudflare Workers

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Monorepo** | Turborepo + pnpm workspaces | Parallel builds, shared config |
| **Runtime (dev)** | Bun | ~4× faster installs and cold starts |
| **Runtime (prod)** | Node.js 22 | Ecosystem stability |
| **Backend framework** | Hono | Web-standard APIs — runs on Node, Bun, and Cloudflare Workers |
| **Database** | PostgreSQL 16 | Reliable, self-hosted relational storage |
| **ORM** | Drizzle ORM | TypeScript-native, closest to raw SQL, zero vendor dependency |
| **Auth** | Self-contained JWT (`jose` + `bcrypt`) | No cloud auth services — true self-host |
| **Media storage** | Local disk + pluggable S3 adapter | User controls where files live |
| **Admin UI** | React 19 + Vite + Shadcn/UI | Fast SPA, accessible primitives |
| **Admin data** | TanStack Query | Server state management |
| **Public renderer** | Next.js 15 App Router | RSC + SSR + ISR for theme performance and SEO |
| **Page builder** | Craftjs | Open-source, React, extensible |
| **Extension hooks** | eventemitter3 | Tiny, typed, fast event system |
| **Styling** | Tailwind CSS + CSS Variables | Flexible theming without conflicts |
| **UI components** | Shadcn/UI | Accessible, unstyled primitives |
| **Shared types** | `packages/types/` | Single source of truth for API contracts |
| **Deployment** | Docker + Railway/Render + Cloudflare Workers | Flexible self-host or cloud |

> **Why no Supabase?** NexCMS's core promise is zero vendor dependency. Supabase Auth and Supabase Storage are managed cloud services — using them would mean your "self-hosted" install is still calling home to a third party. NexCMS uses raw PostgreSQL, self-contained JWT auth, and local/S3 media storage so your install is truly yours.

---

## Extension System

Inspired by Joomla's proven four-type extension model, rebuilt for Node.js and React.

| Type | What It Does | Examples |
|---|---|---|
| **Component** | Full feature area with admin panel + front-end routes | NexBlog, NexShop, NexBooking |
| **Module** | Small display unit placed in theme regions/slots | NexMenu, NexGallery, testimonials widget |
| **Plugin** | Event-based background logic — hooks into core events | SEO auto-tagger, form email sender, spam filter |
| **Package** | Bundled zip of multiple extensions installed together | "Restaurant Pack" = NexMenu + NexForms + NexGallery |

### How It Works

1. Build your extension with a `nexcms.manifest.json`
2. Zip it up
3. Upload via **Admin → Extensions → Install**
4. NexCMS reads the manifest, registers hooks, and activates — no FTP, no config edits

### Extension Manifest Format

```json
{
  "name": "NexBlog",
  "type": "component",
  "version": "1.0.0",
  "author": "ShadowWalkerNC",
  "license": "MIT",
  "entrypoint": "index.js",
  "hooks": ["onPageRender", "onContentSave"],
  "adminPanel": true,
  "routes": ["/blog", "/blog/:slug"]
}
```

### Available Hook Events

| Hook | Fires When |
|---|---|
| `onPageRender` | A page is rendered to the visitor |
| `onContentSave` | Any content item is saved |
| `onContentPublish` | Content is published |
| `onMediaUpload` | A media file is uploaded |
| `onFormSubmit` | A form is submitted |
| `onUserLogin` | A user logs in |
| `onUserCreate` | A new user is created |

### First-Party Extensions (v1.0)

| Extension | Type | Function |
|---|---|---|
| NexForms | Component | Drag-and-drop form builder with email integration |
| NexSEO | Plugin | Meta tags, sitemap, Open Graph, schema markup |
| NexGallery | Module | Image gallery with lazy load and lightbox |
| NexShop | Component | Product/service listings with Stripe |
| NexBlog | Component | Full blog engine with categories, tags, and RSS |
| NexMenu | Component | Restaurant and food menu builder |
| NexBooking | Component | Appointment and reservation system |
| NexAnalytics | Plugin | Privacy-first analytics dashboard |
| NexAI | Plugin | AI copywriting assistant (Anthropic API) |

---

## Theme System

Themes are self-contained packages that define the look and feel of your site.

### Theme Architecture

Themes are **Next.js 15 App Router** component packages. Page components are React Server Components by default — interactive widgets (carousels, forms, search) hydrate as client islands. This ensures every theme is fast and SEO-ready out of the box.

### Theme Package Structure

```
theme-name/
├── nexcms.theme.json     # Metadata, color tokens, font tokens, region map
├── components/           # Page-level React Server Components
├── layouts/              # Header, footer, sidebar, region definitions
├── styles/               # Tailwind overrides + CSS variables
├── assets/               # Images, icons, fonts
└── preview.png           # Admin panel thumbnail
```

### Theme Regions (Module Slots)

Themes define named regions where modules can be placed:

`header` · `nav` · `hero` · `main` · `sidebar-left` · `sidebar-right` · `footer` · `off-canvas`

### Bundled Themes (v1.0)

| Theme | Style | Best For |
|---|---|---|
| **Hearth** | Warm, rustic, editorial | Food, cafés, hospitality |
| **Obsidian** | Dark, minimal, typographic | Portfolio, creative, music |
| **Steel** | Corporate, clean, grid | Business, services, SaaS |
| **Bloom** | Bright, playful, card-based | Bakery, retail, events |
| **Ghost** | Monochrome, magazine-style | Blog, journal, press |
| **Spark** | Vibrant, bold, energetic | Food trucks, nightlife, artists |

---

## Open REST API

The NexCMS API is fully public and documented. Any developer can build against any NexCMS install — mobile apps, integrations, external tools.

**Base URL:** `https://yourdomain.com/api/v1`

### Core Endpoints

```
# Auth
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
GET    /auth/me

# Pages
GET    /pages                    — List published pages (public)
GET    /pages/:slug              — Get page by slug (public)
POST   /pages                    — Create page (editor)
PUT    /pages/:id                — Update page (editor)
POST   /pages/:id/publish        — Publish draft (editor)
GET    /pages/:id/revisions      — Revision history (editor)

# Posts (Blog)
GET    /posts                    — List published posts (public)
GET    /posts/:slug              — Get post by slug (public)
POST   /posts                    — Create post (author)
GET    /posts/categories         — List categories (public)

# Collections (Custom Content Types)
GET    /collections/:name        — List collection entries (public)
POST   /collections/:name        — Create entry (editor)
PUT    /collections/:name/:id    — Update entry (editor)

# Media
GET    /media                    — List media (editor)
POST   /media/upload             — Upload file (editor)

# Globals
GET    /navigation               — Get all nav menus (public)
GET    /navigation/:menu         — Get specific menu (public)
GET    /settings/public          — Get public site settings (public)

# Forms
POST   /forms/submit/:id         — Submit a form (public)

# Admin (auth required)
GET    /themes                   — List themes
POST   /themes/:name/activate    — Activate theme
PUT    /themes/:name/customize   — Save customizations
POST   /themes/install           — Install theme package

GET    /extensions               — List extensions
POST   /extensions/install       — Install extension package
POST   /extensions/:name/enable  — Enable extension
POST   /extensions/:name/disable — Disable extension

GET    /webhooks                 — List webhooks
POST   /webhooks                 — Create webhook
```

### Authentication

```http
Authorization: Bearer <your_jwt_token>
```

Read endpoints are public by default. Write operations require authentication. Configure per-endpoint visibility in site settings.

### Cache Strategy

All public read endpoints include `Cache-Control: public, s-maxage=60, stale-while-revalidate=3600` headers. Publishing content fires a webhook that busts the CDN/edge cache automatically. This means any NexCMS install behind Cloudflare or a CDN gets edge-cached reads with zero configuration.

### Webhooks

Register webhooks to fire on any core event:

```json
{
  "url": "https://your-integration.com/hook",
  "events": ["page.published", "form.submitted"],
  "secret": "your_signing_secret"
}
```

Available events: `page.published`, `page.updated`, `post.published`, `media.uploaded`, `user.created`, `form.submitted`, `order.created`

---

## Monorepo Structure

```
nexcms/
├── packages/
│   ├── types/              # Shared TypeScript types and API contracts
│   ├── core/               # NexCMS engine (Hono API — runs on Node, Bun, Workers)
│   ├── admin/              # Admin panel (React 19 SPA + Vite)
│   ├── web/                # Public site renderer (Next.js 15 App Router)
│   ├── cli/                # NexCMS CLI tool
│   ├── theme-engine/       # Theme loading + injection system
│   ├── extension-engine/   # Extension loading + hook system (eventemitter3)
│   ├── client/             # JS/TS SDK for external use
│   ├── themes/
│   │   ├── theme-hearth/
│   │   ├── theme-obsidian/
│   │   ├── theme-steel/
│   │   ├── theme-bloom/
│   │   ├── theme-ghost/
│   │   └── theme-spark/
│   └── extensions/
│       ├── ext-nexforms/
│       ├── ext-nexseo/
│       ├── ext-nexblog/
│       ├── ext-nexmenu/
│       ├── ext-nexgallery/
│       ├── ext-nexshop/
│       ├── ext-nexbooking/
│       ├── ext-nexanalytics/
│       └── ext-nexai/
├── docs/                   # Documentation site
├── templates/              # Premade site templates
├── migrations/             # Core DB migrations (Drizzle)
├── scripts/                # Build and seed scripts
├── .github/
│   ├── workflows/          # CI/CD (GitHub Actions)
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── docker-compose.yml
├── turbo.json
├── package.json
├── CHANGELOG.md
├── CONTRIBUTING.md
└── README.md
```

---

## Roadmap

| Phase | Timeline | Goal |
|---|---|---|
| **Phase 0 — Architecture** | Now → Jul 2026 | Schema, wireframes, API contracts, stack decisions, GitHub setup |
| **Phase 1 — Core Engine** | Jul → Sep 2026 | Hono API, Drizzle schema, admin panel, page builder, first theme |
| **Phase 2 — Extensions & Themes** | Sep → Nov 2026 | Theme engine (Next.js RSC), extension installer, 4 core extensions |
| **Phase 3 — Visual Builder** | Nov 2026 → Jan 2027 | Craftjs drag-and-drop, inline editing, live preview |
| **Phase 4 — CLI & Deployment** | Q1 2027 | NexCMS CLI, Docker, multi-site, static export, Cloudflare Workers target |
| **Phase 5 — Community** | Q2 2027+ | Docs site, extension registry, community forum |

---

## Installation

> ⚠️ NexCMS is currently in **Phase 0 — Architecture & Planning**. Installation instructions will be published when Phase 1 (Core Engine) is complete. Watch this repo for updates.

### Planned Install Methods

**Web Installer (Recommended — no CLI required)**

```bash
# 1. Download the latest NexCMS release zip
# 2. Upload to your server's web root
# 3. Navigate to https://yourdomain.com/install
# 4. Follow the guided setup wizard
```

**CLI (Advanced)**

```bash
npx nexcms create my-site
cd my-site
nexcms dev
```

**Docker**

```bash
docker-compose up -d
```

### Server Requirements

| Requirement | Minimum |
|---|---|
| Node.js | v22+ |
| PostgreSQL | v16+ |
| RAM | 512MB |
| Storage | 2GB+ |
| OS | Ubuntu 20.04+, Debian 11+, any Linux |

Works on any VPS (DigitalOcean, Linode, Hetzner, your own hardware), Railway, Render, Cloudflare Workers, or shared hosting with Node.js support.

---

## CLI Reference

```bash
nexcms create <site-name>        # Scaffold a new NexCMS project
nexcms dev                       # Start local dev server (Bun)
nexcms build                     # Build for production
nexcms deploy                    # Deploy to configured target
nexcms install:theme <path>      # Install a theme from local path or URL
nexcms install:ext <path>        # Install an extension
nexcms db:migrate                # Run pending database migrations (Drizzle)
nexcms db:seed                   # Seed database with sample content
nexcms db:reset                  # Reset database (dev only)
nexcms export                    # Export site as static files
```

---

## Building Extensions

Anyone can build and share NexCMS extensions. Publish to GitHub, link on the community registry, and others can install your extension as a zip.

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** and the **Extension Developer Guide** (coming in Phase 2) for full documentation.

Quick start:

```bash
nexcms create:extension my-extension --type=component
cd my-extension
# Edit nexcms.manifest.json
# Build your extension
# Zip and distribute on GitHub
```

---

## Building Themes

Themes are Next.js 15 App Router packages with a `nexcms.theme.json` config file. Components are React Server Components by default — use client islands (`"use client"`) for interactive widgets. Anyone can build, share, and install themes.

See the **Theme Developer Guide** (coming in Phase 2) for full documentation.

---

## Contributing

NexCMS is open source and welcomes contributions of all kinds — bug reports, feature requests, documentation, extensions, themes, and code.

1. Fork this repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (Conventional Commits format)
4. Open a pull request

See **[CONTRIBUTING.md](./CONTRIBUTING.md)** for the full guide, code standards, and development setup.

---

## Community

- **GitHub Issues** — Bug reports and feature requests
- **GitHub Discussions** — Questions, ideas, show and tell
- **Extension Registry** — Community-built extensions and themes (coming Phase 5)

---

## License

MIT — free to use, modify, and distribute. Forever.

```
MIT License

Copyright (c) 2026 Nathaniel Cowperthwaite (ShadowWalkerNC)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Built By

**Nate Cowperthwaite** ([@ShadowWalkerNC](https://github.com/ShadowWalkerNC))
Chef. Developer. Builder of things.

*NexCMS exists because no one should have to pay a monthly fee just to own a website.*
