import type { AnalysisResult } from "./analysis";
import type { ComparisonOverallStatus, FieldComparison, LineItemComparison } from "./comparison";
import type { ComplianceResult } from "./compliance";
import type { ComparisonExplanationResult } from "@/lib/ai/schemas/comparison-explanation";
import type { ProcessingMetadata } from "./analysis";

export type AnalyzeResponse = { success: true } & AnalysisResult;

export interface CompareResponse {
  success: true;
  requestId: string;
  score: number;
  status: ComparisonOverallStatus;
  fieldComparisons: FieldComparison[];
  lineItemComparisons: LineItemComparison[];
  summary: string[];
  aiExplanation:
    | (Omit<ComparisonExplanationResult, "overallExplanation"> & { text: string; disclaimer: string })
    | null;
  processing: ProcessingMetadata;
}

export type ComplianceResponse = { success: true; requestId: string } & ComplianceResult;
