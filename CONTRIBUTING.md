# Contributing to NexCMS

NexCMS is open source (MIT) and welcomes contributions — templates, styles, bug reports, and code.

---

## Getting Started

```bash
# Prerequisites: Node.js 22+, pnpm 9+

# Clone the repo
git clone https://github.com/ShadowWalkerNC/NexCMS.git
cd NexCMS

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Type-check everything
pnpm type-check
```

---

## Branch Naming

| Type | Pattern | Example |
|---|---|---|
| Feature | `feature/[package]-[description]` | `feature/generator-slot-mapping` |
| Bug fix | `fix/[package]-[issue]` | `fix/types-schema-optional-fields` |
| Chore | `chore/[scope]` | `chore/turbo-pipeline` |
| Docs | `docs/[topic]` | `docs/template-manifest-spec` |

---

## Commit Format

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

Longer description if needed.
```

**Types:** `feat` · `fix` · `docs` · `chore` · `refactor` · `test` · `style`

**Scopes:** `types` · `generator` · `template-engine` · `asset-tools` · `seo-tools` · `builder` · `cli` · `saas` · `templates` · `styles` · `docs`

---

## Key Rules

1. **Read `AGENTS.md` before writing any code.** It contains locked architectural decisions that must not be reversed.
2. **`packages/types/` is the single source of truth.** Never define types in other packages.
3. **Business type templates contain zero styling.** Structure and content slots only.
4. **Style templates contain zero content logic.** CSS variables only.
5. **No Python in the build pipeline.** All tooling uses Node.js.
6. **No production code before Phase 0 closes.** See Phase 0 DoD in README.
7. **All new environment variables must be added to `.env.example`.**

---

## Pull Requests

1. Fork the repo
2. Create a branch following the naming convention above
3. Commit using Conventional Commits format
4. Open a pull request with a clear description of what changed and why
5. Reference any relevant Phase 0 checkpoints or roadmap items

---

## License

By contributing, you agree your contributions will be licensed under the MIT License.
