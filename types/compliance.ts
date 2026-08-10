export type ComplianceStatus = "pass" | "warning" | "fail" | "not_applicable";

export interface ComplianceRule {
  id: string;
  text: string;
}

export interface ComplianceRuleResult {
  rule: string;
  status: ComplianceStatus;
  reason: string;
  evidence: string | null;
  confidence: number;
}

export type ComplianceOverallStatus = "compliant" | "needs_review" | "non_compliant";

export interface ComplianceResult {
  overallScore: number;
  status: ComplianceOverallStatus;
  results: ComplianceRuleResult[];
}
