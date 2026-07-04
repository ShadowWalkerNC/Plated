# Changelog — NexCMS

Format: [Conventional Commits](https://www.conventionalcommits.org/) — `type(scope): description`

---

## [Unreleased — Phase 1: Generator Core]

> Jul–Sep 2026. In progress.

### Planned
- `packages/generator/` — full `generate()` implementation: ProjectSchema → Astro file output
- `packages/template-engine/` — `loadManifest()`, `resolveSlots()`, `resolveBlocks()` implementations
- `packages/builder/electron/` — Electron main.ts, preload.ts, IPC handler stubs
- `packages/cli/` — CLI wired to spawn Electron binary
- `templates/restaurant/` — complete Astro template with all 6 page stubs
- `styles/hearth/` — complete CSS variable set + Tailwind config
- Turborepo pipeline: generator build verified end-to-end

---

## [v4.0.0] — July 4, 2026 — Full Reassessment

### docs: complete project reassessment and master rewrite

All documentation rewritten from scratch following full feature gap analysis.
Project rules expanded from 15 to 20. Architectural decisions expanded from 10 to 15.

#### README.md v4.0
- Added complete integrations table: Square (Catalog + Orders + Gift Cards + Loyalty),
  Meta/Instagram, Twitter/X, Google Business + Maps, Apple Maps, Yelp, TripAdvisor
- Added full reservations integrations: OpenTable, Resy, SevenRooms, Yelp, in-house form
- Added marketing integrations: Mailchimp, Klaviyo, Resend, Twilio, Tidio/Crisp
- Added analytics integrations: Plausible (default), GA4 (extension), Search Console
- Added AI tools section: Gemini — description, menu, alt text, SEO, color palette
- Added complete features list (80+ features across 9 categories)
- Added three-layer extension system: JSON config + npm plugins + CDN/script manager
- Added curated CDN library catalog: Swiper, GSAP, AOS, Lottie, Alpine, GLightbox,
  Flatpickr, Chart.js, vanilla-cookieconsent, QRCode.js
- Added content engine features: blog, events, specials board, press, multi-location
- Added media library features: background removal, image crop, Unsplash stock photos
- Added accessibility: WCAG 2.1 AA, RTL, multilingual (Astro i18n), semantic HTML
- Added performance: PWA, font subsetting, critical CSS, Core Web Vitals, structured data testing
- Added print assets: PDF menu (jsPDF), QR code (qrcode), business card export
- Updated tech stack table: added Gemini, jsPDF, qrcode, Plausible, @dnd-kit, CodeMirror 6
- Updated monorepo structure: added packages/ai-tools/, packages/pdf-tools/,
  packages/integrations/yelp/, builder/src/steps/, builder/src/editor/, builder/src/media/
- Updated roadmap: Phases 1–8 (added Phase 5 Content Engine, Phase 7 Polish, Phase 8 Launch)

#### AGENTS.md v4.0
- Added Decision 11: Content Engine — Astro Content Collections (no external CMS)
- Added Decision 12: AI Tools — Google Gemini API locked (no OpenAI/Anthropic)
- Added Decision 13: Analytics — Plausible default, GA4 as extension
- Added Decision 14: PDF + QR — jsPDF + qrcode npm package
- Added Decision 15: Multi-location — first-class feature, locations[] in ProjectSchema
- Updated D6 (Electron IPC): added removeBackground, generateQR, exportPDF channels
- Updated D8 (Extensions): expanded to 3-layer system (added CDN/script manager layer)
- Updated D9 (Integrations): added yelp/ to packages/integrations/
- Supabase schema: added content_posts table (blog, events, specials, press)
- Project rules expanded: 15 → 20 (added rules 16–20)
- Tech stack section expanded with full library list
- Agent confirmation block updated

#### CONTRIBUTING.md v4.0
- Updated scopes to include new packages: ai-tools, pdf-tools, extensions, integrations
- Updated rules to reflect all 20 project rules
- Added development setup notes for Electron

#### .env.example v4.0
- Added: GEMINI_API_KEY, YELP_API_KEY, PLAUSIBLE_API_KEY, PLAUSIBLE_DOMAIN,
  UNSPLASH_ACCESS_KEY, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN
- Total env vars: 28

---

## [v3.0.0] — July 4, 2026

### docs: master plan update — Electron, block DnD, extensions, integrations, service tiers

- README v3: Added Electron, block DnD, dual extension system (JSON + npm),
  Square/Meta/Google/Apple Maps integrations, service tiers, 8-step wizard, Phases 1–7
- AGENTS v3: Added Decisions 6–10 (Electron, DnD, extensions, integrations, tiers)
- AGENTS v3: Added integrations Supabase table, sites.tier/managed_by/billing_status
- .env.example: Added 14 integration env vars (Square, Meta, Twitter, Google, Apple Maps)

---

## [v2.0.0] — July 2, 2026

### docs: Phase 0 product pivot — full architectural rewrite

- README v2: Hospitality-first positioning, two-mode architecture, roadmap
- AGENTS v2: 5 locked decisions, monorepo structure, Supabase schema
- Phase 0 DoD: all 7 checkpoints complete

---

## [v1.0.0] — July 2, 2026

### chore: initial monorepo scaffold

- All package stubs created
- Turborepo + pnpm workspace configured
- Restaurant template manifest (CP2, CP7)
- Hearth style tokens
- Base TypeScript config
- .gitignore, .env.example
