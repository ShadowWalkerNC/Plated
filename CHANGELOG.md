# Changelog

All notable changes to NexCMS are documented here.
Format: [Conventional Commits](https://www.conventionalcommits.org/) — `type(scope): description`

---

## [Unreleased]

### Phase 0 — Architecture & Planning

#### Added
- `packages/types/` — `ProjectSchema`, `SiteRecord`, `UserRecord`, `FormSubmission`, `MediaRecord`, `TemplateManifest` interfaces locked (CP1 ✅)
- `packages/generator/` — stub with `generate()` entry point and `GenerateResult` type
- `packages/template-engine/` — stub with `loadManifest()` and `resolveSlots()` entry points
- `packages/asset-tools/` — stub with `generateFavicons()`, `optimizeImage()`, `generateOgImage()`, `extractPrimaryColor()`
- `packages/seo-tools/` — stub with `generateSitemap()`, `generateRobotsTxt()`, `generateMetaTags()`, `generateSchemaOrg()`
- `packages/builder/` — Phase 2 stub (React 19 + Vite wizard UI)
- `packages/cli/` — stub CLI with `new`, `export`, `preview` commands
- `packages/saas/` — Phase 3 stub (Astro hybrid SaaS Hub)
- `templates/restaurant/nexcms.template.json` — restaurant template manifest with 21 content slots across 6 wizard steps (CP2 ✅, CP7 ✅)
- `styles/hearth/variables.css` — CSS variable tokens for all 3 Hearth variants (default, warm, cool)
- `styles/hearth/tailwind.config.ts` — Tailwind config mapping CSS vars to utility classes
- `turbo.json` — Turborepo pipeline (build, dev, lint, test, type-check, clean) (CP4 ✅)
- `pnpm-workspace.yaml` — pnpm workspaces configuration
- `tsconfig.base.json` — shared TypeScript base config
- `.env.example` — all environment variables documented
- `.gitignore` — comprehensive ignore rules
- `CHANGELOG.md` — this file
- `CONTRIBUTING.md` — contribution guide
- `AGENTS.md` — architectural decisions locked (CP3 ✅, CP5 ✅)
- `README.md` — full project documentation (CP6 ✅)

#### Phase 0 DoD
- [x] CP1 — `ProjectSchema` TypeScript interface locked
- [x] CP2 — `nexcms.template.json` manifest spec written
- [x] CP3 — Supabase schema designed (captured in AGENTS.md)
- [x] CP4 — Monorepo scaffolded
- [x] CP5 — Architectural decisions in AGENTS.md
- [x] CP6 — README + AGENTS updated
- [x] CP7 — Restaurant template stub created

**Phase 0 CLOSED. Phase 1 begins.**

---

## Phase 1 — Generator Core (Jul–Sep 2026)

> *Not yet started. See roadmap in README.md.*
