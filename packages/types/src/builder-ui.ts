/**
 * Builder UI — composable Local Builder chrome.
 *
 * Layered after Open SaaS Stack's composability model
 * (primitives → fields → standalone → shell), adapted for Plated:
 *
 *   L1  components/ui/*        shadcn/Radix primitives
 *   L2  components/fields/*    Plated-aware form fields
 *   L3  components/builder/*   Editor chrome / panels
 *   L4  EditorShell / Wizard   Full surfaces
 *
 * OpenShip / Openfront inspiration (patterns only — not a stack swap):
 *   - Dual-sidebar + inspector panels (dashboard chrome)
 *   - Theme via CSS variables (same as shadcn/OpenSaaS)
 *   - Future Phase 3: Square/order flows may mirror Openship channel→fulfillment UX
 *
 * Do NOT import Next.js, Wasp, Keystone, or Prisma into this package.
 */

/** Accent presets for the Local Builder chrome (not customer site themes). */
export type BuilderAccentPreset =
  | 'ember'   // Plated default — warm terracotta
  | 'ink'     // High-contrast dark primary
  | 'gold'    // Secondary brand gold
  | 'custom'; // User-supplied hex via BuilderThemeConfig.primary

/**
 * Runtime theme for the Electron builder UI.
 * Maps onto shadcn CSS variables (`--primary`, `--radius`, …).
 * Customer site styles remain in `styles/<id>/variables.css` (D3).
 */
export interface BuilderThemeConfig {
  /** Accent preset or custom */
  accent: BuilderAccentPreset;
  /** Used when accent === 'custom'. Hex preferred, e.g. `#8a4b2f`. */
  primary?: string;
  /** Border radius base in rem (shadcn `--radius`). Default 0.625. */
  radius?: number;
  /** Force light / dark / follow OS. */
  colorMode?: 'light' | 'dark' | 'system';
  /** Compact density for dense editor panels. */
  density?: 'comfortable' | 'compact';
}

/** Shared props for Level-2 field components (Open SaaS FieldProps-inspired). */
export type BuilderFieldProps<T = string> = {
  name: string;
  label: string;
  value: T;
  onChange: (value: T) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  /** read = display only; edit = interactive (default). */
  mode?: 'read' | 'edit';
  className?: string;
};
