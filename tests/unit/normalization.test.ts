import { describe, expect, it } from "vitest";
import { normalizeString, stringSimilarity, numericDifference, variancePercent } from "@/lib/comparison/normalization";

describe("normalizeString", () => {
  it("lowercases, trims, collapses spaces, and strips harmless punctuation", () => {
    expect(normalizeString("  ABC Technologies Pvt. Ltd.  ")).toBe("abc technologies pvt ltd");
  });

  it("returns an empty string for null/undefined", () => {
    expect(normalizeString(null)).toBe("");
    expect(normalizeString(undefined)).toBe("");
  });
});

describe("stringSimilarity", () => {
  it("returns 1 for an exact normalized match", () => {
    expect(stringSimilarity("ABC Ltd.", "abc ltd")).toBe(1);
  });

  it("returns a high score for token-overlapping near-duplicates", () => {
    expect(stringSimilarity("HP Business Laptop 14-inch", "HP 14-inch Business Laptop")).toBeGreaterThan(0.6);
  });

  it("returns 0 when either input is empty", () => {
    expect(stringSimilarity("", "something")).toBe(0);
    expect(stringSimilarity(null, "something")).toBe(0);
  });

  it("scores unrelated strings low", () => {
    expect(stringSimilarity("ABC Technologies", "Global Industrial Supplies")).toBeLessThan(0.3);
  });
});

describe("numericDifference / variancePercent", () => {
  it("computes signed difference", () => {
    expect(numericDifference(59000, 50000)).toBe(9000);
  });

  it("returns null when either value is null", () => {
    expect(numericDifference(null, 50000)).toBeNull();
    expect(variancePercent(59000, null)).toBeNull();
  });

  it("avoids division by zero — treats 0 vs 0 as no variance", () => {
    expect(variancePercent(0, 0)).toBe(0);
  });

  it("avoids division by zero — treats nonzero vs 0 as maximal variance", () => {
    expect(variancePercent(100, 0)).toBe(100);
  });

  it("computes percentage variance relative to the PO value", () => {
    expect(variancePercent(55, 50)).toBeCloseTo(10, 5);
  });
});
