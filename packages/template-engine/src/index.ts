// @plated/template-engine — Phase 1
// Reads plated.template.json manifests, maps ProjectSchema values into
// content slots, and provides template string interpolation utilities.

import { readFile } from 'node:fs/promises';
import { join }     from 'node:path';
import type { TemplateManifest, ProjectSchema } from '@plated/types';
import { resolveTokens } from './resolveTokens.js';

export type { Condition }  from './conditional.js';
export { resolveTokens };
export { interpolate }     from './interpolate.js';
export { evaluateConditional } from './conditional.js';
export { renderTemplate }  from './renderTemplate.js';

export interface SlotMap {
  [slotField: string]: unknown;
}

/**
 * loadManifest — reads and parses a plated.template.json file.
 * Throws if the file is missing or not valid JSON.
 */
export async function loadManifest(
  templateDir: string,
): Promise<TemplateManifest> {
  const filePath = join(templateDir, 'plated.template.json');
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw) as TemplateManifest;
}

/**
 * resolveSlots — maps a ProjectSchema onto the content slots declared
 * in a TemplateManifest.  Returns a SlotMap keyed by slot.field.
 *
 * For Phase 1, all values are sourced from resolveTokens().
 * Complex types (hours, menu, schedule) return the raw sub-object.
 */
export function resolveSlots(
  manifest: TemplateManifest,
  schema: ProjectSchema,
): SlotMap {
  const tokens = resolveTokens(schema);
  const result: SlotMap = {};

  for (const slot of manifest.slots) {
    if (Object.prototype.hasOwnProperty.call(tokens, slot.field)) {
      result[slot.field] = tokens[slot.field];
    } else {
      // For complex slots (menu, hours, location, etc.)
      // resolve by dot-path traversal on the raw schema object.
      result[slot.field] = getByPath(schema as unknown as Record<string, unknown>, slot.field);
    }
  }

  return result;
}

/** Traverses a nested object by dot-notation path. */
function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc !== null && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}
