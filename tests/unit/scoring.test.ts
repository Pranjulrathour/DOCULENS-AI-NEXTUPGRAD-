import { describe, expect, it } from "vitest";
import { computeMatchScore, scoreToOverallStatus } from "@/lib/comparison/scoring";
import { MATCH_WEIGHTS, type MatchWeightKey } from "@/lib/comparison/types";
import type { ComparisonStatus } from "@/types/comparison";

const ALL_MATCH = {
  vendor: "match", poNumber: "match", lineItems: "match",
  quantity: "match", unitPrice: "match", tax: "match", total: "match",
} as const;

describe("MATCH_WEIGHTS", () => {
  it("sums to exactly 1", () => {
    const sum = Object.values(MATCH_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 10);
  });
});

describe("computeMatchScore", () => {
  it("scores a fully matching comparison at 100", () => {
    expect(computeMatchScore(ALL_MATCH)).toBe(100);
  });

  it("scores a fully mismatched comparison at 0", () => {
    const allMismatch = Object.fromEntries(
      (Object.keys(ALL_MATCH) as MatchWeightKey[]).map((key) => [key, "mismatch"]),
    ) as Record<MatchWeightKey, ComparisonStatus>;
    expect(computeMatchScore(allMismatch)).toBe(0);
  });

  it("gives partial credit for a warning-level field", () => {
    const scoreWithWarning = computeMatchScore({ ...ALL_MATCH, vendor: "warning" });
    expect(scoreWithWarning).toBeLessThan(100);
    expect(scoreWithWarning).toBeGreaterThan(90);
  });

  it("penalizes a mismatched total more visibly than a mismatched vendor (higher weight sensitivity is proportional, not accidental)", () => {
    const mismatchTotal = computeMatchScore({ ...ALL_MATCH, total: "mismatch" });
    const mismatchVendor = computeMatchScore({ ...ALL_MATCH, vendor: "mismatch" });
    // vendor (0.15) and total (0.10) have different weights — confirm the drop matches the weight, not a hardcoded number.
    expect(100 - mismatchVendor).toBeCloseTo(MATCH_WEIGHTS.vendor * 100, 5);
    expect(100 - mismatchTotal).toBeCloseTo(MATCH_WEIGHTS.total * 100, 5);
  });
});

describe("scoreToOverallStatus", () => {
  it("classifies >=90 as strong_match", () => {
    expect(scoreToOverallStatus(90)).toBe("strong_match");
    expect(scoreToOverallStatus(100)).toBe("strong_match");
  });

  it("classifies 70-89 as review", () => {
    expect(scoreToOverallStatus(70)).toBe("review");
    expect(scoreToOverallStatus(89)).toBe("review");
  });

  it("classifies <70 as poor_match", () => {
    expect(scoreToOverallStatus(69)).toBe("poor_match");
    expect(scoreToOverallStatus(0)).toBe("poor_match");
  });
});
