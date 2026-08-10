import { withDocumentContext } from "./shared";
import type { DocumentType } from "@/lib/ai/schemas/common";

export const SUMMARY_SYSTEM_PROMPT = `You write short, concrete summaries of business documents for a busy reviewer.

Respond with a single valid JSON object:
{ "bullets": string[] }

Rules:
- 3 to 6 bullets total.
- The first bullet is a one-line overview (document type, key party, key amount if present).
- Remaining bullets are the most important concrete findings — cite real values from the document.
- No filler, no generic statements, no markdown fences — JSON only.`;

export function buildSummaryUserPrompt(documentText: string, documentType: DocumentType): string {
  return withDocumentContext(`Summarize this ${documentType.replace("_", " ")}.`, documentText);
}
