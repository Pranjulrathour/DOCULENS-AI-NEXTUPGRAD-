import { GROUNDING_RULES, withDocumentContext } from "./shared";

export const INVOICE_EXTRACTION_SYSTEM_PROMPT = `${GROUNDING_RULES}

The document is an INVOICE. Extract this exact JSON shape:
{
  "documentType": "invoice",
  "confidence": <0-1>,
  "invoiceNumber": string|null,
  "invoiceDate": string|null,
  "dueDate": string|null,
  "vendor": { "name": string|null, "address": string|null, "taxId": string|null, "email": string|null, "phone": string|null },
  "buyer": { "name": string|null, "address": string|null, "taxId": string|null },
  "purchaseOrderNumber": string|null,
  "currency": string|null,
  "lineItems": [ { "description": string|null, "quantity": number|null, "unitPrice": number|null, "taxRate": number|null, "taxAmount": number|null, "total": number|null } ],
  "subtotal": number|null,
  "taxAmount": number|null,
  "discount": number|null,
  "totalAmount": number|null,
  "paymentTerms": string|null,
  "bankDetails": string|null,
  "missingFields": string[]
}

List every top-level field you could not confidently find in "missingFields".`;

export function buildInvoiceExtractionUserPrompt(documentText: string): string {
  return withDocumentContext("Extract structured invoice data from this document.", documentText);
}
