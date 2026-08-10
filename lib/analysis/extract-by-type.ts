import type { AIProvider } from "@/lib/ai/provider";
import type { DocumentType } from "@/lib/ai/schemas/common";
import type { ExtractionUnion } from "@/types/analysis";

/**
 * Routes to the correct extractor for the classified document type.
 * receipt/report/other have no dedicated structured schema in this MVP
 * (PRD §6 scopes structured extraction to invoice/PO/contract/regulatory) —
 * those types get a summary only, extraction stays null.
 */
export async function extractByDocumentType(
  documentType: DocumentType,
  documentText: string,
  aiProvider: AIProvider,
): Promise<ExtractionUnion> {
  switch (documentType) {
    case "invoice":
      return aiProvider.extractInvoice({ documentText });
    case "purchase_order":
      return aiProvider.extractPurchaseOrder({ documentText });
    case "contract":
      return aiProvider.extractContract({ documentText });
    case "regulatory_filing":
      return aiProvider.extractRegulatoryFiling({ documentText });
    case "receipt":
    case "report":
    case "other":
      return null;
  }
}
