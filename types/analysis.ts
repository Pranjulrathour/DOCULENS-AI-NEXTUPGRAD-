import type { ClassificationResult } from "@/lib/ai/schemas/common";
import type { InvoiceExtractionV1 } from "@/lib/ai/schemas/invoice";
import type { PurchaseOrderExtractionV1 } from "@/lib/ai/schemas/purchase-order";
import type { ContractExtractionV1 } from "@/lib/ai/schemas/contract";
import type { RegulatoryFilingExtractionV1 } from "@/lib/ai/schemas/regulatory-filing";
import type { SummaryResult } from "@/lib/ai/schemas/summary";
import type { Issue } from "./issue";

export type ExtractionUnion =
  | InvoiceExtractionV1
  | PurchaseOrderExtractionV1
  | ContractExtractionV1
  | RegulatoryFilingExtractionV1
  | null;

export interface ProcessingStage {
  name: string;
  durationMs: number;
}

export interface ProcessingMetadata {
  durationMs: number;
  stages: ProcessingStage[];
}

export interface AnalysisResult {
  requestId: string;
  document: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    pageCount?: number;
    requiredOcr: boolean;
  };
  documentText: string;
  classification: ClassificationResult;
  extraction: ExtractionUnion;
  summary: SummaryResult;
  issues: Issue[];
  processing: ProcessingMetadata;
}
