import { z } from "zod";
import { ConfidenceSchema, NullableStringSchema } from "./common";

export const ComplianceRuleResultSchema = z.object({
  rule: z.string(),
  status: z.enum(["pass", "warning", "fail", "not_applicable"]),
  reason: z.string(),
  evidence: NullableStringSchema,
  confidence: ConfidenceSchema,
});
export type ComplianceRuleResultAI = z.infer<typeof ComplianceRuleResultSchema>;

export const ComplianceEvaluationResultSchema = z.object({
  results: z.array(ComplianceRuleResultSchema),
});
export type ComplianceEvaluationResult = z.infer<
  typeof ComplianceEvaluationResultSchema
>;
