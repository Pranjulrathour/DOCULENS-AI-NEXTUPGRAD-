export const MATCH_WEIGHTS = {
  vendor: 0.15,
  poNumber: 0.15,
  lineItems: 0.25,
  quantity: 0.15,
  unitPrice: 0.1,
  tax: 0.1,
  total: 0.1,
} as const;

export type MatchWeightKey = keyof typeof MATCH_WEIGHTS;

/** Sanity check kept next to the constant it validates, run once at module load. */
const WEIGHT_SUM = Object.values(MATCH_WEIGHTS).reduce((sum, w) => sum + w, 0);
if (Math.abs(WEIGHT_SUM - 1) > 1e-6) {
  throw new Error(`MATCH_WEIGHTS must sum to 1, got ${WEIGHT_SUM}`);
}

export const SCORE_THRESHOLDS = {
  strongMatch: 90,
  review: 70,
} as const;
