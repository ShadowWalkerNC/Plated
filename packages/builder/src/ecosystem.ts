/**
 * Ecosystem notes — Open SaaS & OpenShip
 * ======================================
 * Inspiration only. Plated keeps Astro + Electron + Supabase (locked decisions).
 *
 * Open SaaS (wasp-lang/open-saas, OpenSaaS Stack UI):
 *   - Composable layers: primitives → fields → standalone → shell
 *   - CSS-variable theming shared across the admin chrome
 *   - Adopted here as packages/builder components/{ui,fields,builder}
 *
 * OpenShip (openshiporg/openship) + Openfront Restaurant:
 *   - shadcn dashboard chrome, dual-sidebar + inspector patterns
 *   - Channel → fulfillment mental model maps later to Plated Square /
 *     multi-location / order widgets (Phase 3+), not a stack replacement
 *   - AGPL license on Openship — do not copy code; reimplement patterns
 *
 * Explicit non-goals (AGENTS.md):
 *   Next.js, Wasp, Keystone, Prisma/Drizzle as Plated core, Tauri, Python
 */
export const ECOSYSTEM_NOTES = {
  openSaas: {
    layers: ['ui', 'fields', 'builder', 'shell'] as const,
    theme: 'css-variables',
  },
  openShip: {
    patterns: ['dashboard-chrome', 'inspector-panel', 'channel-routing-ux'] as const,
    license: 'AGPL-3.0 — patterns only, no code copy',
  },
} as const;
