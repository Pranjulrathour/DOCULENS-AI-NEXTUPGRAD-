import { withDocumentContext } from "./shared";

export const CLASSIFICATION_SYSTEM_PROMPT = `You are a document classification engine for a business document intelligence system.

Classify the document into exactly one of these categories:
invoice, purchase_order, contract, regulatory_filing, receipt, report, other.

Respond with a single valid JSON object:
{
  "documentType": "<one of the categories above>",
  "confidence": <number between 0 and 1>,
  "reason": "<one sentence citing concrete evidence from the document>"
}

No markdown fences, no commentary — JSON only.`;

export function buildClassificationUserPrompt(documentText: string): string {
  return withDocumentContext("Classify this document.", documentText);
}
