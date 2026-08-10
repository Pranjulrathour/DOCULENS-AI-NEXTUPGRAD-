/**
 * String/numeric normalization for comparison. Deterministic only — no AI
 * involved here (PRD §27-28). Never over-normalize: two materially different
 * vendor names must never be coerced into a match.
 */

const HARMLESS_PUNCTUATION = /[.,;:'"()]/g;

export function normalizeString(value: string | null | undefined): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replace(HARMLESS_PUNCTUATION, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Token-overlap similarity in [0, 1] — cheap, deterministic, and good enough to
 * decide "likely the same entity" without any AI call. */
export function stringSimilarity(a: string | null | undefined, b: string | null | undefined): number {
  const normalizedA = normalizeString(a);
  const normalizedB = normalizeString(b);
  if (!normalizedA || !normalizedB) return 0;
  if (normalizedA === normalizedB) return 1;

  const tokensA = new Set(normalizedA.split(" "));
  const tokensB = new Set(normalizedB.split(" "));
  const intersection = [...tokensA].filter((t) => tokensB.has(t)).length;
  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
}

/** Above this similarity, two strings are treated as an equivalent match. */
export const STRING_MATCH_THRESHOLD = 0.6;

export function numericDifference(a: number | null, b: number | null): number | null {
  if (a === null || b === null) return null;
  return a - b;
}

export function variancePercent(a: number | null, b: number | null): number | null {
  if (a === null || b === null) return null;
  if (b === 0) return a === 0 ? 0 : 100;
  return Math.abs((a - b) / b) * 100;
}
