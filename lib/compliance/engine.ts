import type { ComplianceResult, ComplianceRule, ComplianceRuleResult } from "@/types/compliance";
import type { AIProvider } from "@/lib/ai/provider";
import { evaluateRuleDeterministically } from "./rules";
import { AppError } from "@/lib/errors/app-error";

const OVERALL_THRESHOLDS = { compliant: 90, needsReview: 60 };

function scoreFromResults(results: ComplianceRuleResult[]): number {
  const scored = results.filter((r) => r.status !== "not_applicable");
  if (scored.length === 0) return 100;
  const points = scored.reduce((sum, r) => {
    if (r.status === "pass") return sum + 1;
    if (r.status === "warning") return sum + 0.5;
    return sum;
  }, 0);
  return Math.round((points / scored.length) * 100);
}

function overallStatusFromScore(score: number): ComplianceResult["status"] {
  if (score >= OVERALL_THRESHOLDS.compliant) return "compliant";
  if (score >= OVERALL_THRESHOLDS.needsReview) return "needs_review";
  return "non_compliant";
}

/**
 * Evaluates each rule deterministically where possible; any rule that can't
 * be resolved by code is batched into a single AI call (PRD §60 — minimize
 * AI calls) rather than one call per rule.
 */
export async function evaluateCompliance(
  rules: ComplianceRule[],
  documentText: string,
  aiProvider: AIProvider,
): Promise<ComplianceResult> {
  const results: ComplianceRuleResult[] = new Array(rules.length);
  const aiRuleIndices: number[] = [];

  rules.forEach((rule, index) => {
    const deterministic = evaluateRuleDeterministically(rule, documentText);
    if (deterministic) {
      results[index] = deterministic;
    } else {
      aiRuleIndices.push(index);
    }
  });

  if (aiRuleIndices.length > 0) {
    let aiResults;
    try {
      aiResults = await aiProvider.evaluateCompliance({
        documentText,
        rules: aiRuleIndices.map((i) => rules[i].text),
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("COMPLIANCE_FAILED", { cause: error });
    }

    aiRuleIndices.forEach((ruleIndex, aiResultIndex) => {
      const aiResult = aiResults.results[aiResultIndex];
      results[ruleIndex] = aiResult ?? {
        rule: rules[ruleIndex].text,
        status: "not_applicable",
        reason: "The AI did not return a result for this rule.",
        evidence: null,
        confidence: 0,
      };
    });
  }

  const score = scoreFromResults(results);
  return { overallScore: score, status: overallStatusFromScore(score), results };
}
