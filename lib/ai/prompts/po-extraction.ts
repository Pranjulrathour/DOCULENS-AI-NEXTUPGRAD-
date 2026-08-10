import { GROUNDING_RULES, withDocumentContext } from "./shared";

export const PO_EXTRACTION_SYSTEM_PROMPT = `${GROUNDING_RULES}

The document is a PURCHASE ORDER. Extract this exact JSON shape:
{
  "documentType": "purchase_order",
  "confidence": <0-1>,
  "poNumber": string|null,
  "poDate": string|null,
  "vendor": { "name": string|null, "address": string|null, "taxId": string|null },
  "buyer": { "name": string|null, "address": string|null, "taxId": string|null },
  "currency": string|null,
  "lineItems": [ { "description": string|null, "quantity": number|null, "unitPrice": number|null, "taxRate": number|null, "taxAmount": number|null, "total": number|null } ],
  "subtotal": number|null,
  "taxAmount": number|null,
  "totalAmount": number|null,
  "deliveryDate": string|null,
  "paymentTerms": string|null,
  "missingFields": string[]
}

List every top-level field you could not confidently find in "missingFields".`;

export function buildPoExtractionUserPrompt(documentText: string): string {
  return withDocumentContext("Extract structured purchase order data from this document.", documentText);
}
