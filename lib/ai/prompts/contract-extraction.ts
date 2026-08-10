import { GROUNDING_RULES, withDocumentContext } from "./shared";

export const CONTRACT_EXTRACTION_SYSTEM_PROMPT = `${GROUNDING_RULES}

The document is a CONTRACT. This is informational analysis, not legal advice.
Extract this exact JSON shape:
{
  "documentType": "contract",
  "confidence": <0-1>,
  "parties": string[],
  "effectiveDate": string|null,
  "expirationDate": string|null,
  "paymentTerms": string|null,
  "terminationTerms": string|null,
  "renewalTerms": string|null,
  "noticePeriod": string|null,
  "liabilityClauses": string|null,
  "confidentiality": string|null,
  "governingLaw": string|null,
  "disputeResolution": string|null,
  "keyObligations": string[],
  "riskIndicators": string[],
  "missingFields": string[]
}

"riskIndicators" should list clauses that appear unusually one-sided, ambiguous, or
worth flagging for human legal review — phrase each as an observation, not advice.`;

export function buildContractExtractionUserPrompt(documentText: string): string {
  return withDocumentContext("Extract structured contract data from this document.", documentText);
}
