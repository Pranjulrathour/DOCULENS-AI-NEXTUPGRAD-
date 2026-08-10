import { describe, expect, it } from "vitest";
import { evaluateRuleDeterministically, parseRulesFromText } from "@/lib/compliance/rules";
import type { ComplianceStatus } from "@/types/compliance";
import passFixture from "../fixtures/compliance-pass.json";
import failFixture from "../fixtures/compliance-fail.json";

function runFixture(fixture: { documentText: string; rules: string[]; expectedStatuses: ComplianceStatus[] }) {
  const rules = parseRulesFromText(fixture.rules.join("\n"));
  return rules.map((rule) => evaluateRuleDeterministically(rule, fixture.documentText));
}

describe("compliance fixtures (PRD §68)", () => {
  it("passes every rule in the compliant fixture", () => {
    const results = runFixture(passFixture as never);
    results.forEach((result, i) => {
      expect(result?.status).toBe(passFixture.expectedStatuses[i]);
    });
  });

  it("fails every rule in the non-compliant fixture", () => {
    const results = runFixture(failFixture as never);
    results.forEach((result, i) => {
      expect(result?.status).toBe(failFixture.expectedStatuses[i]);
    });
  });
});
