// @nexcms/template-engine — Phase 1 stub
// Responsibility: reads nexcms.template.json manifests,
// maps ProjectSchema values into content slots,
// and returns a resolved slot map ready for the generator.

import type { TemplateManifest, ProjectSchema } from '@nexcms/types';

export interface SlotMap {
  [slotField: string]: unknown;
}

/**
 * loadManifest — reads and validates a nexcms.template.json file.
 */
export async function loadManifest(
  _templateDir: string,
): Promise<TemplateManifest> {
  throw new Error(
    'template-engine.loadManifest() is not yet implemented. Phase 1.'
  );
}

/**
 * resolveSlots — maps ProjectSchema values into template slots.
 */
export function resolveSlots(
  _manifest: TemplateManifest,
  _schema: ProjectSchema,
): SlotMap {
  throw new Error(
    'template-engine.resolveSlots() is not yet implemented. Phase 1.'
  );
}
