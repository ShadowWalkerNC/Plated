# Changelog

All notable changes to NexCMS are documented here.
Format: [Conventional Commits](https://www.conventionalcommits.org/) — `type(scope): description`

---

## [Unreleased — Phase 1]

### Phase 1 — Generator Core (Jul–Sep 2026)

> *In progress. See roadmap in README.md.*

---

## [Phase 0 — Complete]

### Architecture & Planning — Closed Jul 4, 2026

#### Added
- `packages/types/` — `ProjectSchema`, `SiteRecord`, `UserRecord`, `FormSubmission`, `MediaRecord`, `TemplateManifest` interfaces locked (CP1 ✅)
- `packages/generator/` — stub with `generate()` entry point and `GenerateResult` type
- `packages/template-engine/` — stub with `loadManifest()` and `resolveSlots()` entry points
- `packages/asset-tools/` — stub with `generateFavicons()`, `optimizeImage()`, `generateOgImage()`, `extractPrimaryColor()`
- `packages/seo-tools/` — stub with `generateSitemap()`, `generateRobotsTxt()`, `generateMetaTags()`, `generateSchemaOrg()`
- `packages/builder/` — Phase 2 stub (Electron + React 19 + Vite wizard UI)
- `packages/cli/` — stub CLI with `new`, `export`, `preview` commands
- `packages/saas/` — Phase 4 stub (Astro hybrid SaaS Hub)
- `templates/restaurant/nexcms.template.json` — restaurant template manifest with 21 content slots across 6 wizard steps (CP2 ✅, CP7 ✅)
- `styles/hearth/variables.css` — CSS variable tokens for all 3 Hearth variants
- `styles/hearth/tailwind.config.ts` — Tailwind config mapping CSS vars to utility classes
- `turbo.json` — Turborepo pipeline (build, dev, lint, test, type-check, clean) (CP4 ✅)
- `pnpm-workspace.yaml` — pnpm workspaces configuration
- `tsconfig.base.json` — shared TypeScript base config
- `.env.example` — all environment variables documented
- `.gitignore` — comprehensive ignore rules
- `CHANGELOG.md` — this file
- `CONTRIBUTING.md` — contribution guide
- `AGENTS.md` v1–v2 — architectural decisions locked (CP3 ✅, CP5 ✅)
- `README.md` v1–v2 — full project documentation (CP6 ✅)

#### Phase 0 DoD — All Checkpoints Complete
- [x] CP1 — `ProjectSchema` TypeScript interface locked
- [x] CP2 — `nexcms.template.json` manifest spec written
- [x] CP3 — Supabase schema designed
- [x] CP4 — Monorepo scaffolded
- [x] CP5 — Architectural decisions in AGENTS.md
- [x] CP6 — README + AGENTS updated
- [x] CP7 — Restaurant template stub created

#### docs: master plan update — Jul 4, 2026
- `README.md` v3.0 — full master plan: Electron, block-level DnD, dual extension system,
  Square/Meta/Google/Apple Maps integrations, existing website import, service tiers,
  8-step wizard flow, updated roadmap (Phases 1–7), integration env vars table
- `AGENTS.md` v3.0 — 10 locked architectural decisions: added Decision 6 (Electron),
  Decision 7 (block-level DnD + @dnd-kit), Decision 8 (dual extensions),
  Decision 9 (integration architecture + packages/integrations/ structure),
  Decision 10 (service tiers + Supabase schema fields)
- `AGENTS.md` — added `packages/extensions/` and `packages/integrations/` to monorepo
  structure and project rules (rules 12–15 added)
- `AGENTS.md` — updated Supabase schema with `integrations` table, `sites.tier`,
  `sites.managed_by`, `sites.billing_status`
- `.env.example` — added 14 integration env vars: Square, Meta, Twitter/X, Google,
  Apple Maps, ENCRYPTION_KEY
- `CHANGELOG.md` — this update

**Phase 0 CLOSED. Phase 1 active.**
