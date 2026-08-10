import type { ClassificationResult } from "@/lib/ai/schemas/common";
import type { InvoiceExtractionV1 } from "@/lib/ai/schemas/invoice";
import type { PurchaseOrderExtractionV1 } from "@/lib/ai/schemas/purchase-order";
import type { ContractExtractionV1 } from "@/lib/ai/schemas/contract";
import type { RegulatoryFilingExtractionV1 } from "@/lib/ai/schemas/regulatory-filing";
import type { SummaryResult } from "@/lib/ai/schemas/summary";
import type { ComplianceEvaluationResult } from "@/lib/ai/schemas/compliance";
import type { ComparisonExplanationResult } from "@/lib/ai/schemas/comparison-explanation";
import type { DocumentType } from "@/lib/ai/schemas/common";

export interface ClassificationInput {
  documentText: string;
}

export interface ExtractionInput {
  documentText: string;
}

export interface SummaryInput {
  documentText: string;
  documentType: DocumentType;
}

export interface ComplianceInput {
  documentText: string;
  rules: string[];
}

export interface ComparisonExplanationInput {
  computedComparisonJson: string;
}

/**
 * Port that the rest of the application depends on — no code outside
 * lib/ai/groq.ts may import the Groq SDK directly (PRD §10, §81).
 */
export interface AIProvider {
  classify(input: ClassificationInput): Promise<ClassificationResult>;
  extractInvoice(input: ExtractionInput): Promise<InvoiceExtractionV1>;
  extractPurchaseOrder(input: ExtractionInput): Promise<PurchaseOrderExtractionV1>;
  extractContract(input: ExtractionInput): Promise<ContractExtractionV1>;
  extractRegulatoryFiling(input: ExtractionInput): Promise<RegulatoryFilingExtractionV1>;
  summarize(input: SummaryInput): Promise<SummaryResult>;
  evaluateCompliance(input: ComplianceInput): Promise<ComplianceEvaluationResult>;
  explainComparison(input: ComparisonExplanationInput): Promise<ComparisonExplanationResult>;
}
