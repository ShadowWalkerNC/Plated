/**
 * manifestLoader.ts — imports all 8 plated.template.json manifests
 * and registers them with @plated/astro-output before the generator
 * produces any page files.
 *
 * Why here and not in astro-output?
 * - astro-output is a pure code-generation library; it should not have
 *   a hard filesystem dependency on the templates/ directory.
 * - The generator package already owns the orchestration layer and has
 *   the correct relative path to the repo-root templates/ directory.
 *
 * Why JSON imports?
 * - Static, zero-runtime-cost, tree-shakeable.
 * - TypeScript resolveJsonModule handles them natively.
 * - Each file is typed-asserted to TemplateManifest so any structural
 *   drift is caught at compile time.
 */
import { registerManifest } from '@plated/astro-output';
import type { TemplateManifest } from '@plated/types';

// ── Static JSON imports ────────────────────────────────────────────────────
// Paths are relative to this file: packages/generator/src/
// → ../../.. goes to repo root → templates/<type>/plated.template.json

import restaurantManifest  from '../../../templates/restaurant/plated.template.json'   assert { type: 'json' };
import cafeManifest        from '../../../templates/cafe/plated.template.json'          assert { type: 'json' };
import barManifest         from '../../../templates/bar/plated.template.json'           assert { type: 'json' };
import bakeryManifest      from '../../../templates/bakery/plated.template.json'        assert { type: 'json' };
import cateringManifest    from '../../../templates/catering/plated.template.json'      assert { type: 'json' };
import foodTruckManifest   from '../../../templates/food-truck/plated.template.json'    assert { type: 'json' };
import foodStandManifest   from '../../../templates/food-stand/plated.template.json'    assert { type: 'json' };
import ghostKitchenManifest from '../../../templates/ghost-kitchen/plated.template.json' assert { type: 'json' };

// ── Registry ───────────────────────────────────────────────────────────────
// Cast through `unknown` first so TypeScript accepts the JSON type as
// TemplateManifest without requiring every optional field to be present.
const ALL_MANIFESTS: TemplateManifest[] = [
  restaurantManifest   as unknown as TemplateManifest,
  cafeManifest         as unknown as TemplateManifest,
  barManifest          as unknown as TemplateManifest,
  bakeryManifest       as unknown as TemplateManifest,
  cateringManifest     as unknown as TemplateManifest,
  foodTruckManifest    as unknown as TemplateManifest,
  foodStandManifest    as unknown as TemplateManifest,
  ghostKitchenManifest as unknown as TemplateManifest,
];

let _loaded = false;

/**
 * loadManifests — idempotent; safe to call multiple times.
 * Registers all 8 template manifests with the astro-output package
 * so that buildAstroProject() uses manifest-driven page rendering.
 */
export function loadManifests(): void {
  if (_loaded) return;
  for (const manifest of ALL_MANIFESTS) {
    registerManifest(manifest);
  }
  _loaded = true;
}
