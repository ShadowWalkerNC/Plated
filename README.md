# NexCMS

**The hospitality website builder. Built for chefs, not developers.**

> Pick a template. Fill in your info. Connect your Square menu, Google listing, and socials.  
> Export and own your site — or let us host it at nexcms.io.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Status: Phase 1 — Active](https://img.shields.io/badge/Status-Phase%201%20Active-blue)]()
[![Stack: Astro + Electron + Supabase](https://img.shields.io/badge/Stack-Astro%20%2B%20Electron%20%2B%20Supabase-blue)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)]()

---

## What Is NexCMS?

NexCMS is a **full-featured, guided website builder** for restaurants, food trucks, bars, cafés, bakeries, pop-ups, catering companies, and all food-related businesses. It walks owners through every step — business info, hours, menu, socials, integrations, branding — and produces a professional, SEO-optimized, fully owned website.

Two modes. One codebase:

- **Local Builder** — Electron desktop app. Build offline, export a deployable Astro zip. Yours forever.
- **SaaS Hub (nexcms.io)** — Build and manage in-browser. Live edits. Mobile-first. Hosted by us.

---

## Why NexCMS?

| Platform | The Problem |
|---|---|
| WordPress | PHP bloat, plugin debt, constant security updates |
| Squarespace / Wix | Monthly fees forever, no code ownership, generic templates |
| Custom dev | Expensive, slow, impossible to self-maintain |
| Toast / BentoBox | Restaurant-specific but locked into their ecosystem and pricing |
| DIY Astro / HTML | Too technical for most restaurant owners |

**NexCMS fills the gap.** Hospitality-first templates, a coaching wizard that guides any owner through every field, built-in integrations for Square, Google, Apple Maps, and all major social platforms — and full export ownership with zero lock-in on the local version.

---

## Core Philosophy

- **Guided, not overwhelming.** The wizard coaches users step-by-step and explains why every field matters.
- **Hospitality-first.** Every template, field, block, and integration is purpose-built for food businesses.
- **Own your output.** Export a complete Astro site you fully control. No vendor lock-in.
- **Connected by default.** Square menus, Google Business hours, social profiles — all wired in the wizard and kept in sync.
- **Two modes, one codebase.** Electron for power users. SaaS Hub for everyone else.
- **Mobile-first SaaS.** Most restaurant owners run their business from their phone.
- **AI-assisted.** Gemini-powered writing tools help owners create great descriptions, SEO copy, and alt text — no writing skills needed.

---

## Two Modes

### Local Builder (Electron Desktop App)

Download and install NexCMS as a native desktop app for macOS, Windows, or Linux. The wizard runs inside Electron. Fill in your content, connect your integrations, pick a template, and export.

- **Output:** Complete Astro site zip + `DEPLOY_INSTRUCTIONS.md` for Netlify, Vercel, Cloudflare Pages, GitHub Pages
- **Power user export:** Full Astro source for customization in VS Code, Claude Code, or any editor
- **Zero dependencies:** No database, no server, no Python. Works fully offline.
- **CLI entry point:** `npx nexcms` launches the Electron app

### SaaS Hub (nexcms.io)

Build and manage your site entirely in-browser from any device.

- **Live editing:** Changes go live in under 10 seconds via Cloudflare cache purge — no rebuild
- **Mobile-first dashboard:** Designed for phones. Update your hours, menu, and specials on the go.
- **Subdomains + custom domains:** `yourname.nexcms.io` or your own domain
- **Managed tiers:** We can build and maintain your site for you (see Service Tiers)

---

## Service Tiers

| Tier | Who It's For | What Happens |
|---|---|---|
| **Self-Serve** | Owner builds their own site | Full Local Builder or SaaS Hub access |
| **Managed Build** | Owner wants it built for them | NexCMS admin builds via super-admin dashboard |
| **White-Glove** | Owner wants ongoing management | NexCMS admin maintains, updates, and runs the site long-term |

---

## Wizard Flow (8 Steps)

Every build — Local or SaaS — runs through the same guided wizard:

| Step | Name | What Happens |
|---|---|---|
| 1 | **Business Info** | Name, type, tagline, description, phone, email, cuisine type |
| 2 | **Existing Website** | Optional reference URL — used for branding hints and content migration |
| 3 | **Social & Presence** | Connect or create: Facebook, Instagram, Twitter/X, Google Business, Apple Maps |
| 4 | **Location & Hours** | Address, Google Maps pin, Apple Maps listing, day-by-day hours, holiday closures, food truck schedule |
| 5 | **Menu & Ordering** | Manual entry OR Square sync. Categories, items, prices, photos, dietary tags. Online ordering config. |
| 6 | **Media & Branding** | Logo, hero image/video, color palette (auto-extracted or manual), favicon |
| 7 | **Template & Style** | Business type + visual style. Light/dark mode. Color theme. |
| 8 | **Extensions & Extras** | Analytics, reservations, loyalty, email capture, CDN libraries, npm plugins, custom scripts |

If a user doesn't have an account for a required platform (e.g., no Google Business listing), the wizard provides a direct setup link and lets them return after creating it.

---

## Integrations

### Social Media
| Platform | Integration |
|---|---|
| **Facebook** | Meta Graph API — connect Business Page; coached account creation if missing |
| **Instagram** | Instagram Graph API — connect profile, pull photo feed |
| **Twitter / X** | X API v2 — connect profile, display post feed |

### Business Listings
| Platform | Integration |
|---|---|
| **Google Business Profile** | My Business API — hours sync, photos, reviews display |
| **Google Maps** | Maps Embed API — location map, auto-populated from address |
| **Apple Maps Business Connect** | Business listing, hours, location |
| **Yelp** | Yelp Fusion API — rating badge, review display |
| **TripAdvisor** | Static badge embed |

### Point of Sale & Ordering
| Platform | Integration |
|---|---|
| **Square Catalog** | Menu items, categories, prices, photos, dietary tags — live sync |
| **Square Orders** | Online ordering flow — add to cart, checkout, tip prompt |
| **Square Gift Cards** | Gift card purchase and balance display |
| **Square Loyalty** | Loyalty program info, points display |
| **Delivery Platforms** | DoorDash, Uber Eats, Grubhub, Toast, ChowNow — link-only, user provides URL |

### Reservations & Bookings
| Platform | Integration |
|---|---|
| **OpenTable** | Widget embed via JSON config extension |
| **Resy** | Widget embed |
| **SevenRooms** | Widget embed |
| **Yelp Reservations** | Widget embed |
| **In-house booking** | Date/time/party-size form stored in Supabase (for places not on OpenTable) |

### Marketing & Communication
| Platform | Integration |
|---|---|
| **Mailchimp** | Email list sync from newsletter capture forms |
| **Klaviyo** | Email/SMS marketing list sync |
| **Resend** | Transactional email (form submissions, order confirms) |
| **Twilio** | SMS opt-in for text promos |
| **Tidio / Crisp** | Live chat widget embed |

### Analytics
| Platform | Integration |
|---|---|
| **Plausible** | Default analytics — privacy-first, no cookies, self-hostable |
| **Google Analytics 4** | JSON config extension — GA4 measurement ID toggle |
| **Google Search Console** | Verification meta tag injection |

---

## Extension System

Two layers. Both supported simultaneously.

### Layer 1 — JSON Config Extensions
Declared in `nexcms.config.json`. Wizard Step 8 surfaces these as toggle options. No code required.

```json
{
  "extensions": {
    "analytics": { "provider": "plausible", "domain": "yoursite.com" },
    "googleAnalytics": { "enabled": true, "measurementId": "G-XXXXXXXXXX" },
    "reservations": { "provider": "opentable", "restaurantId": "12345" },
    "liveChat": { "provider": "tidio", "publicKey": "your-key" },
    "cookieBanner": { "enabled": true, "theme": "dark" },
    "whatsapp": { "enabled": true, "phone": "+12075551234" },
    "emailCapture": { "provider": "mailchimp", "listId": "abc123" },
    "loyalty": { "provider": "square", "programId": "xyz" }
  }
}
```

### Layer 2 — npm Package Plugins
Installed as `nexcms-plugin-*` packages. Self-register with the NexCMS extension registry.

```bash
npm install nexcms-plugin-square
npm install nexcms-plugin-opentable
npm install nexcms-plugin-gsap-animations
npm install nexcms-plugin-multilingual
```

Each plugin exports an `NexCMSPlugin` object with: `id`, `name`, `version`, `wizardSteps[]`, `configSchema` (Zod), `components[]` (Astro components to inject), `envVars[]`, `cdnScripts[]`, `onBuild(config)` hook.

### Layer 3 — Script & CDN Manager
Available in Wizard Step 8 → Advanced. For semi-technical users.

- **Custom `<head>` injection** — paste any script tag, meta tag, or CSS link (syntax highlighted via CodeMirror)
- **Custom `<body>` injection** — paste any script or widget embed code
- **CDN library picker** — curated vetted list, one-click enable:

| Library | Use Case |
|---|---|
| Swiper.js | Photo carousels, menu sliders |
| GSAP | Scroll animations, entrance effects |
| AOS | Simple scroll reveal |
| Lottie Web | Animated icons |
| Alpine.js | Lightweight interactivity |
| GLightbox | Gallery lightbox |
| Flatpickr | Date/time picker for reservation forms |
| Chart.js | Analytics charts in dashboard |
| vanilla-cookieconsent | GDPR/CCPA cookie banner |
| QRCode.js | QR code generation |

---

## Features — Complete List

### Content & Pages
- ✅ Guided onboarding wizard — 8 steps, coached, not a blank form
- ✅ Block-level drag-and-drop editor — reorder blocks within sections, reorder sections on page
- ✅ Blog / news posts — rich text, categories, tags, slugs, publish scheduling
- ✅ Events listing — date/time, ticket link, cover image, recurring events
- ✅ Specials / LTO board — rotating daily/weekly specials content type
- ✅ Press mentions section — media coverage display
- ✅ Testimonials block — manual customer quotes
- ✅ Gallery with lightbox — photo grid, GLightbox embed
- ✅ Video hero support — YouTube/Vimeo URL or direct video upload
- ✅ Multi-location support — per-location hours, address, phone, map, menu variations
- ✅ Location switcher — header dropdown or dedicated Locations page

### Menu & Ordering
- ✅ Menu builder — categories, items, prices, photos, dietary tags
- ✅ Square Catalog sync — live pull from POS
- ✅ Square Orders — online ordering flow
- ✅ Square Gift Cards — purchase and balance display
- ✅ Delivery platform links — DoorDash, Uber Eats, Grubhub, Toast, ChowNow
- ✅ Printable menu PDF — jsPDF export of digital menu
- ✅ QR code generator — `qrcode` npm package, points to digital menu URL

### Integrations & Connections
- ✅ Social media OAuth — Facebook, Instagram, Twitter/X
- ✅ Google Business Profile sync — hours, photos, reviews
- ✅ Apple Maps Business Connect
- ✅ Yelp rating badge + reviews
- ✅ Reservations — OpenTable, Resy, SevenRooms, Yelp, or in-house form
- ✅ Email marketing — Mailchimp, Klaviyo capture
- ✅ Live chat — Tidio, Crisp widget embed
- ✅ WhatsApp floating button
- ✅ SMS opt-in — Twilio
- ✅ Existing website import — reference URL for branding and content hints
- ✅ "Create account" coaching — prompts and guides users to set up missing platforms

### AI-Powered Tools
- ✅ AI business description writer — name + type → About section, tagline, meta description
- ✅ AI menu description writer — item name → appetizing dish description
- ✅ AI image alt text generator — auto-generate accessibility alt text
- ✅ AI SEO recommendations — page-by-page suggestions in dashboard
- ✅ AI color palette suggester — extract and suggest palettes from logo upload
- All powered by **Google Gemini API**

### SEO & Performance
- ✅ SEO auto-generation — meta tags, sitemap.xml, robots.txt, Schema.org structured data
- ✅ OG image generation — branded social share images via satori + sharp
- ✅ Favicon + app icon generation — full set from logo, all sizes
- ✅ Image optimization — auto WebP conversion, blur-up placeholders
- ✅ Font subsetting — load only glyphs used (~80% reduction)
- ✅ Critical CSS extraction — inline above-the-fold CSS, defer the rest
- ✅ PWA support — service worker + manifest.json, installable on phones
- ✅ Core Web Vitals monitoring — Lighthouse scores in dashboard
- ✅ Google Search Console verification
- ✅ Structured data testing — validate Schema.org against Rich Results API

### Analytics & Insights
- ✅ Built-in analytics — Plausible (privacy-first, no cookies required)
- ✅ Google Analytics 4 — JSON config toggle
- ✅ Form submission analytics — contacts and catering inquiries per month
- ✅ Core Web Vitals dashboard

### Media & Assets
- ✅ Media library UI — grid view, search, filter by type
- ✅ Background removal — `@imgly/background-removal` (no API key)
- ✅ Image cropping — `react-image-crop` before upload
- ✅ Stock photo search — Unsplash API (free hospitality photos)
- ✅ Video background — hero section video

### Accessibility & Compliance
- ✅ WCAG 2.1 AA — built-in accessibility checker in editor
- ✅ Cookie consent banner — `vanilla-cookieconsent`, GDPR/CCPA compliant
- ✅ RTL language support
- ✅ Multilingual pages — Astro i18n routing (Spanish, etc.)
- ✅ Semantic HTML — all templates use correct heading hierarchy and ARIA labels

### Builder & Export
- ✅ Two-axis template system — business type + visual style independently
- ✅ Light/Dark mode + 3+ color themes per style
- ✅ CDN library picker — curated list, one-click toggle
- ✅ Custom `<head>`/`<body>` script injection — CodeMirror editor
- ✅ npm plugin registry — `nexcms-plugin-*` self-registering packages
- ✅ Electron desktop app — fully offline, zero server dependencies
- ✅ Export full Astro source for developer customization
- ✅ GitHub push integration (Phase 6)
- ✅ One-click deploy to Netlify/Vercel (Phase 6)

### SaaS-Specific
- ✅ Mobile-first dashboard — designed at 390px first
- ✅ Super-admin dashboard — manage all client sites, Managed and White-Glove tiers
- ✅ Live editing without rebuild — changes live in <10 seconds
- ✅ Custom domain support
- ✅ Multi-tenant architecture — single Railway server, Cloudflare edge cache
- ✅ Loyalty & rewards — Square Loyalty API display
- ✅ Print assets — menu PDF, QR code, basic business card export

---

## Business Types (v1)

| Type | Key Pages | Special Features |
|---|---|---|
| **Restaurant** | Home, Menu, Hours, About, Contact | Full menu, reservation link, Google Maps, Google reviews |
| **Food Truck** | Home, Menu, Schedule, About, Contact | Weekly location schedule, rotating menu, multi-stop map |
| **Bar / Nightclub** | Home, Drinks, Events, About, Contact | Events listing, specials board, age gate option |
| **Café / Coffee Shop** | Home, Menu, Gallery, About, Contact | Featured drinks, gallery, loyalty link |
| **Bakery / Dessert** | Home, Menu, Gallery, Order, Contact | Online order link, seasonal specials, QR menu |
| **Catering** | Home, Services, Gallery, Pricing, Contact | Catering inquiry form, service packages, booking |
| **Food Stand / Pop-Up** | Home, Menu, Schedule, Contact | Pop-up schedule, social-first layout |
| **Ghost Kitchen** | Home, Menu, Order, Contact | Delivery platform links, no dine-in sections |

*Phase 3+ expands to: Small Business, Startup, Portfolio, Event Venue, Brewery/Winery*

---

## Visual Styles

| Style | Vibe | Best For |
|---|---|---|
| **Hearth** | Warm, rustic, editorial | Restaurants, cafés, hospitality |
| **Spark** | Bold, vibrant, energetic | Food trucks, nightlife, pop-ups |
| **Steel** | Corporate, clean, minimal | Catering, business services |
| **Bloom** | Bright, playful, airy | Bakeries, dessert shops, events |
| **Obsidian** | Dark mode, moody, typographic | Bars, nightclubs, creative |
| **Ghost** | Monochrome, magazine-style | Ghost kitchens, modern concepts |

Each style: Light + Dark variants + 3 color themes. 8 structures × 6 styles maintained independently = no 288-variant explosion.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Monorepo** | Turborepo + pnpm workspaces | Parallel builds, shared config |
| **Language** | TypeScript (all packages) | Full type safety |
| **Runtime (dev)** | Bun | ~4× faster installs |
| **Runtime (prod)** | Node.js 22 | Ecosystem stability |
| **Templates** | Astro 5 | Static output + server islands |
| **Local Builder** | Electron + React 19 + Vite + Shadcn/UI | Native desktop wizard app |
| **SaaS frontend** | Next.js + Refine | Mobile-first server-rendered hub + admin/dashboard layer |
| **Database** | Supabase (PostgreSQL + RLS) | Multi-tenant SaaS backend |
| **Auth** | Supabase Auth | Email, magic link, OAuth |
| **Storage** | Supabase Storage | Logos, media, uploads |
| **Image processing** | sharp | WebP, favicons, optimization |
| **OG images** | satori + sharp | Branded share images, no Puppeteer |
| **SEO** | Native Node.js | Sitemap, robots.txt, Schema.org |
| **PDF export** | jsPDF | Printable menu generation |
| **QR codes** | qrcode (npm) | Menu QR, table tents |
| **AI tools** | Google Gemini API | Writing, SEO, alt text, color |
| **Analytics** | Plausible | Privacy-first, no cookies |
| **DnD editor** | @dnd-kit/core + @dnd-kit/sortable | Block-level drag-and-drop |
| **Code editor** | CodeMirror 6 | Script injection UI |
| **Styling** | Tailwind CSS + CSS Variables | Style injection |
| **CDN** | Cloudflare | Edge cache + purge |
| **Hosting** | Railway | Persistent Node.js server |

### Why Refine for the SaaS Dashboard

`packages/saas` uses [Refine](https://github.com/refinedev/refine) as the headless admin/dashboard layer. Refine is purpose-built for CRUD-heavy data UIs — site management, user administration, billing, plan limits, super-admin controls — which is exactly what the SaaS hub needs. It provides authentication flows, role-based access control, data provider connectors (wired directly to Supabase), and `useTable`/`useDataGrid` hooks that eliminate weeks of boilerplate. It does not touch the template engine, generator, or Electron builder — those are pure Node.js pipelines.

---

## Monorepo Structure

```
nexcms/
├── packages/
│   ├── types/                ← All TypeScript interfaces — ProjectSchema, SiteRecord,
│   │                           BlockSchema, PluginManifest, IntegrationRecord, etc.
│   ├── generator/            ← project.json → Astro output files
│   ├── template-engine/      ← Manifest reader + block/slot mapper
│   ├── asset-tools/          ← sharp + satori (images, favicons, OG)
│   ├── seo-tools/            ← Sitemap, robots.txt, meta, Schema.org
│   ├── ai-tools/             ← Gemini API — description writer, alt text, SEO, color
│   ├── pdf-tools/            ← jsPDF menu export, QR code generation
│   ├── extensions/           ← Extension registry — JSON config + npm plugin resolver
│   ├── integrations/         ← Third-party API clients + OAuth
│   │   ├── square/           ← Catalog, Orders, Gift Cards, Loyalty
│   │   ├── meta/             ← Facebook + Instagram Graph API
│   │   ├── twitter/          ← X API v2
│   │   ├── google/           ← Business Profile + Maps
│   │   ├── apple-maps/       ← Business Connect
│   │   └── index.ts          ← Registry + shared types
│   ├── builder/              ← LOCAL: Electron shell + React 19 + Vite wizard
│   │   ├── src/              ← React wizard UI (desktop-first, 1280px)
│   │   └── electron/         ← main.ts, preload.ts, ipc/ handlers
│   ├── cli/                  ← LOCAL: nexcms CLI — spawns Electron, triggers export
│   └── saas/                 ← SAAS: Next.js + Refine (mobile-first, 390px)
│       ├── dashboard/        ← Client + admin + super-admin (Refine resources)
│       ├── editor/           ← Block-level DnD editor
│       └── renderer/         ← Tenant-aware site renderer
├── templates/
│   ├── restaurant/           ← nexcms.template.json v2.0 + Astro pages (Phase 1)
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
├── tsconfig.base.json
├── AGENTS.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── .env.example
└── README.md
```

---

## Roadmap

| Phase | Timeline | Status | Goal |
|---|---|---|---|
| **Phase 0 — Plan** | Jul 2026 | ✅ Complete | Types (`ProjectSchema` v2.0, all interfaces), manifest spec, monorepo scaffold, docs |
| **Phase 1 — Generator** | Jul–Sep 2026 | 🔄 In Progress | `template-engine` ✅ · `generator` (next) · Restaurant + Hearth · Electron shell · CLI → Astro zip |
| **Phase 2 — Local Builder** | Sep–Nov 2026 | ⬜ Planned | Full Electron wizard. All 8 types. All 6 styles. Block DnD. Media library. PDF/QR export. |
| **Phase 3 — Integrations** | Nov 2026–Jan 2027 | ⬜ Planned | Square (full), Meta, Google, Apple Maps, Yelp. OAuth flows. AI tools (Gemini). Existing website import. |
| **Phase 4 — SaaS Foundation** | Jan–Mar 2027 | ⬜ Planned | Supabase, auth, mobile dashboard (Next.js + Refine), live editing, super-admin, service tiers, custom domains. |
| **Phase 5 — Content Engine** | Mar–May 2027 | ⬜ Planned | Blog, events, specials board, press section. Multi-location support. Email capture. Reservations. |
| **Phase 6 — Extensions** | May–Jul 2027 | ⬜ Planned | npm plugin registry, CDN library picker, script injection, GitHub push, one-click deploy. |
| **Phase 7 — Polish** | Jul–Sep 2027 | ⬜ Planned | Analytics, Core Web Vitals, PWA, accessibility audit, print assets, multilingual, RTL. |
| **Phase 8 — Launch** | Q4 2027 | ⬜ Planned | nexcms.io public, docs site, pricing, template marketplace, White-Glove onboarding. |

### Phase 1 Progress

| Item | Status |
|---|---|
| `packages/types` — full `ProjectSchema` v2.0 | ✅ Done |
| `templates/restaurant/nexcms.template.json` v2.0 | ✅ Done |
| `packages/template-engine` — `loadManifest`, `resolveSlots`, `resolveBlocks`, `resolveTemplate` | ✅ Done |
| `packages/generator` — `generate()` implementation | 🔄 Next |
| `templates/restaurant/` Astro pages (7 pages) | ⬜ Queued |
| `styles/hearth/` — CSS tokens + Tailwind config | ⬜ Queued |
| `packages/builder` — Electron main + preload + IPC | ⬜ Queued |
| CLI → Electron spawn wired | ⬜ Queued |

---

## Getting Started

> ⚠️ NexCMS is in **Phase 1 — Generator Core**. The full builder is available in Phase 2.

```bash
# Future launch command (Phase 2+)
npx nexcms

# Or install globally
npm install -g nexcms
nexcms
```

**Requirements:** Node.js 22+. That's it.

### CLI Reference

```bash
nexcms                    # Launch the Electron wizard
nexcms new                # Start a new project
nexcms export             # Export to deployable zip
nexcms export --source    # Export full Astro source
nexcms preview            # Preview built site locally
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the full guide.

1. Fork this repo
2. Branch: `feature/[package]-[description]`
3. Commit: Conventional Commits format
4. Open a PR

---

## License

MIT — free to use, modify, and distribute. Forever.

```
Copyright (c) 2026 Nathaniel Cowperthwaite (ShadowWalkerNC)
```

**Nate Cowperthwaite** ([@ShadowWalkerNC](https://github.com/ShadowWalkerNC)) — Chef. Developer. Builder of things.

*NexCMS exists because restaurant owners shouldn't need a developer to have a great website.*
