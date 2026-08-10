import { GROUNDING_RULES, withDocumentContext } from "./shared";

export const REGULATORY_EXTRACTION_SYSTEM_PROMPT = `${GROUNDING_RULES}

The document is a REGULATORY FILING. Regulatory documents vary significantly in
structure — extract what is present and leave the rest null/empty. Extract this
exact JSON shape:
{
  "documentType": "regulatory_filing",
  "confidence": <0-1>,
  "entityName": string|null,
  "filingType": string|null,
  "reportingPeriod": string|null,
  "filingDate": string|null,
  "referenceNumbers": string[],
  "importantAmounts": [ { "label": string, "value": number|string } ],
  "keyDisclosures": string[],
  "exceptions": string[],
  "deadlines": string[],
  "complianceIndicators": string[],
  "missingFields": string[]
}`;

export function buildRegulatoryExtractionUserPrompt(documentText: string): string {
  return withDocumentContext("Extract structured regulatory filing data from this document.", documentText);
}
