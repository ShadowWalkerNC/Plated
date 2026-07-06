import type { ProjectSchema } from '@plated/types';
import { resolveTokens } from './resolveTokens.js';
import { interpolate }    from './interpolate.js';

/**
 * Renders a template string against a ProjectSchema in one step.
 * Equivalent to: interpolate(template, resolveTokens(schema))
 */
export function renderTemplate(
  template: string,
  schema: ProjectSchema,
): string {
  return interpolate(template, resolveTokens(schema));
}
