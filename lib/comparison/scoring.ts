import type { ComparisonStatus } from "@/types/comparison";
import { MATCH_WEIGHTS, SCORE_THRESHOLDS, type MatchWeightKey } from "./types";
import type { ComparisonOverallStatus } from "@/types/comparison";

/** A field's contribution to the score: 1 for a clean match, partial credit for
 * a warning-level near-match, 0 for mismatch/missing. */
function statusToCredit(status: ComparisonStatus): number {
  switch (status) {
    case "match":
      return 1;
    case "warning":
      return 0.5;
    case "not_applicable":
      return 1;
    case "mismatch":
    case "missing":
      return 0;
  }
}

export function computeMatchScore(statusByWeightKey: Record<MatchWeightKey, ComparisonStatus>): number {
  let total = 0;
  for (const key of Object.keys(MATCH_WEIGHTS) as MatchWeightKey[]) {
    total += MATCH_WEIGHTS[key] * statusToCredit(statusByWeightKey[key]);
  }
  return Math.round(total * 100);
}

export function scoreToOverallStatus(score: number): ComparisonOverallStatus {
  if (score >= SCORE_THRESHOLDS.strongMatch) return "strong_match";
  if (score >= SCORE_THRESHOLDS.review) return "review";
  return "poor_match";
}

export function overallStatusLabel(status: ComparisonOverallStatus): string {
  switch (status) {
    case "strong_match":
      return "Strong Match";
    case "review":
      return "Review Required";
    case "poor_match":
      return "Poor Match";
  }
}
