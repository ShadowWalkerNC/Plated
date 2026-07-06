export interface Condition {
  /** Dot-notation token key, e.g. 'businessType' or 'social.instagram' */
  token: string;
  /** If provided, the token value must equal this string */
  equals?: string;
  /** If true, the result is negated */
  not?: boolean;
}

/**
 * Evaluates a single conditional expression against a flat token map.
 *
 * - With `equals`: true iff tokens[token] === equals
 * - Without `equals`: true iff tokens[token] is a non-empty string
 * - `not: true` inverts the result
 */
export function evaluateConditional(
  condition: Condition,
  tokens: Record<string, string>,
): boolean {
  const value = tokens[condition.token] ?? '';

  let result: boolean;
  if (condition.equals !== undefined) {
    result = value === condition.equals;
  } else {
    result = value !== '';
  }

  return condition.not ? !result : result;
}
