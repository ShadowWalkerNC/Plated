/**
 * Replaces all {{token}} placeholders in a template string.
 * Tokens not found in the map are left as-is.
 * Does not mutate the source string.
 */
export function interpolate(
  template: string,
  tokens: Record<string, string>,
): string {
  return template.replace(/\{\{([^}]+)\}\}/g, (_match, key: string) => {
    const k = key.trim();
    return Object.prototype.hasOwnProperty.call(tokens, k) ? tokens[k]! : `{{${k}}}`;
  });
}
