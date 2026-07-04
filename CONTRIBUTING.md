# Contributing to NexCMS

NexCMS is open source (MIT) and welcomes contributions — templates, styles, integrations, plugins, bug reports, and code.

**Before writing any code, read `AGENTS.md` in full.** It contains 15 locked architectural decisions and 20 hard rules.

---

## Development Setup

```bash
# Prerequisites: Node.js 22+, pnpm 9+, Bun (for dev runtime)

# Clone the repo
git clone https://github.com/ShadowWalkerNC/NexCMS.git
cd NexCMS

# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Type-check everything
pnpm type-check

# Run tests
pnpm test

# Start Local Builder in dev mode (Phase 2+)
pnpm dev:builder

# Start SaaS Hub in dev mode (Phase 4+)
pnpm dev:saas
```

### Electron Development (Phase 2+)

```bash
# Run the Electron app in development mode
cd packages/builder
pnpm dev:electron

# Build the Electron app for distribution
pnpm build:electron
```

---

## Package Scopes

Use these scopes in commit messages and branch names:

| Scope | Package |
|---|---|
| `types` | packages/types |
| `generator` | packages/generator |
| `template-engine` | packages/template-engine |
| `asset-tools` | packages/asset-tools |
| `seo-tools` | packages/seo-tools |
| `ai-tools` | packages/ai-tools |
| `pdf-tools` | packages/pdf-tools |
| `extensions` | packages/extensions |
| `integrations` | packages/integrations |
| `builder` | packages/builder |
| `cli` | packages/cli |
| `saas` | packages/saas |
| `templates` | templates/* |
| `styles` | styles/* |
| `docs` | README, AGENTS, CHANGELOG, CONTRIBUTING |

---

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/[scope]-[description]` | `feature/generator-slot-mapping` |
| Bug fix | `fix/[scope]-[issue]` | `fix/types-schema-optional-fields` |
| Chore | `chore/[scope]` | `chore/turbo-pipeline` |
| Docs | `docs/[topic]` | `docs/integration-guide` |

---

## Commit Format

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

Optional longer description.
```

**Types:** `feat` · `fix` · `docs` · `chore` · `refactor` · `test` · `style`

---

## Hard Rules (from AGENTS.md)

1. **`packages/types/` only.** Never define TypeScript interfaces in other packages.
2. **Templates = structure only.** Zero styling in `templates/`.
3. **Styles = CSS variables only.** Zero content logic in `styles/`.
4. **No Python.** All tooling in Node.js/Bun.
5. **Local Builder is offline-capable.** No database, server, or API calls required for core export.
6. **Service role key is server-side only.** Never in client bundles or PUBLIC_ env vars.
7. **All new env vars go in `.env.example`** with a comment explaining the source.
8. **DnD: @dnd-kit only.** Do not introduce other drag-and-drop libraries.
9. **AI: Gemini only.** Do not introduce OpenAI, Anthropic, or other AI providers.
10. **Analytics: Plausible default.** GA4 only as a JSON config opt-in extension.

---

## Adding a New Integration

1. Create `packages/integrations/[provider]/` with `client.ts`, `oauth.ts`, `types.ts`
2. Export an `IntegrationClient` from `index.ts` conforming to the shared interface in `packages/types/`
3. Register in `packages/integrations/index.ts`
4. Add wizard Step 3 UI component in `packages/builder/src/steps/step3-socials/`
5. Add OAuth token handling (Local: encrypted file via IPC, SaaS: Supabase `integrations` table)
6. Add required env vars to `.env.example`
7. Document in `docs/integrations/[provider].md`

## Adding a New Template

1. Create `templates/[business-type]/` with `nexcms.template.json` manifest
2. Define all pages, sections, and blocks — zero styling
3. Add to the business type registry in `packages/types/`
4. Add wizard Step 7 thumbnail asset
5. Write tests in `templates/[business-type]/__tests__/`

## Writing a Plugin

1. Create a new npm package named `nexcms-plugin-[name]`
2. Export a default `NexCMSPlugin` object (see `packages/types/` for the interface)
3. Include a `nexcms-plugin.json` manifest at the root
4. Test against the extension registry in `packages/extensions/`
5. Publish to npm and submit a PR to add to the official plugin catalog

---

## Pull Requests

1. Fork the repo
2. Create a branch following the naming convention
3. Write tests for any new functionality
4. Ensure `pnpm type-check` and `pnpm test` pass
5. Open a PR with a clear description referencing the relevant phase and package

---

## License

By contributing, you agree your contributions will be licensed under the MIT License.
