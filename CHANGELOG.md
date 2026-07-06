# Changelog — Plated

Format: [Conventional Commits](https://www.conventionalcommits.org/) — `type(scope): description`

---

## [Unreleased — Phase 1: Generator Core]

> Jul–Sep 2026. In progress.

### Planned
- `packages/generator/` — full `generate()` implementation: ProjectSchema → Astro file output
- `packages/builder/electron/` — Electron main.ts, preload.ts, IPC handler stubs
- `packages/cli/` — CLI wired to spawn Electron binary
- CulinaryOS extension install command (confirm name + integration contract)
- White-label license purchase URL
- Turborepo pipeline: generator build verified end-to-end

---

## [v5.0.0] — July 6, 2026 — Open-Core Pivot

### docs: reposition as open-source CulinaryOS module, open-core licensing

Full pivot from SaaS/subscription model to open-core. Plated is now MIT-licensed with an
optional $299 white-label commercial license. Major version updates available at $79 each.
All SaaS, subscription, and feature-bloat plans removed.

#### README.md v5.0
- Reframed as open-source restaurant website module + CulinaryOS native extension
- Removed: Stripe billing, Free/Pro/Agency tiers, SaaS-first framing
- Added: CulinaryOS Integration section with dual-mode architecture diagrams
- Added: Licensing table (MIT free / $299 white-label / $79 per major version)
- Expanded themes table: 3 → all 6 real themes (hearth, canvas, midnight, market, coast, ember)
- Added `pitch/` to monorepo structure map
- Removed: `STRIPE_SECRET_KEY` from env vars table
- Added MIT, CulinaryOS native, and status badges

#### styles/README.md v5.0
- Renamed from `# NexCMS Themes` → `# Plated Themes`
- Content unchanged — all 6 themes already correctly documented

#### pitch/index.html v5.0
- Full 11-slide rewrite: open-core + CulinaryOS positioning
- Slide 1: Title — open-source · CulinaryOS module pill badges
- Slide 2: Problem — ops/web gap framing
- Slide 3: Reality — stats reframed around the gap
- Slide 4: Solution — dual-mode split (standalone vs CulinaryOS native)
- Slide 5: Themes — expanded from 3 → 6 real themes with correct names, fonts, accent colours
- Slide 6: Comparison — Plated vs custom build vs Squarespace vs WordPress
- Slide 7: Ecosystem — POS, KDS, RecipeOS, Admin Client, MCP, Extensions
- Slide 8: Pricing — Free MIT / $299 white-label / $79 per major version
- Slide 9: License FAQ — 6 Q&As
- Slide 10: Get started — `git clone` + `plated init` + `culinary ext add plated`
- Slide 11: CTA — GitHub star + white-label license buttons

---

## [v4.0.0] — July 4, 2026 — Full Reassessment

### docs: complete project reassessment and master rewrite

All documentation rewritten following full feature gap analysis.
Project rules expanded from 15 to 20. Architectural decisions expanded from 10 to 15.

#### README.md v4.0
- Added complete integrations table and reservations integrations
- Added marketing, analytics, and AI tools sections
- Added three-layer extension system
- Added content engine, media library, accessibility, and performance features
- Updated tech stack and monorepo structure

#### AGENTS.md v4.0
- Added Decisions 11–15
- Updated D6, D8, D9
- Supabase schema: added content_posts table
- Project rules expanded: 15 → 20

#### CONTRIBUTING.md v4.0
- Updated scopes and rules to reflect new packages and project rules

#### .env.example v4.0
- Total env vars: 28

---

## [v3.0.0] — July 4, 2026

### docs: master plan update — Electron, block DnD, extensions, integrations, service tiers

- README v3: Added Electron, block DnD, dual extension system, integrations, service tiers, 8-step wizard
- AGENTS v3: Added Decisions 6–10
- .env.example: Added 14 integration env vars

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
- Restaurant template manifest
- Hearth style tokens
- Base TypeScript config
- .gitignore, .env.example
