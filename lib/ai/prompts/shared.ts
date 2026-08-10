/**
 * Shared grounding rules injected into every extraction/classification prompt.
 * These are the hard anti-hallucination constraints from PRD §2.5 / §24 —
 * never invent a fact, never invent a number, always null when unsure.
 */
export const GROUNDING_RULES = `You are a document intelligence extraction engine.

Extract only information that is explicitly supported by the provided document text.
Never invent, guess, or infer a factual value that is not directly supported by the text.
If a value cannot be found, return null for that field — do not omit the field.
Normalize numeric values to plain numbers (no currency symbols, no thousands separators).
Provide a confidence score between 0 and 1 for the overall extraction.
Respond with a single valid JSON object matching the requested schema and nothing else —
no markdown fences, no commentary before or after the JSON.`;

export function withDocumentContext(instruction: string, documentText: string): string {
  return `${instruction}\n\n---\nDOCUMENT TEXT:\n${documentText}\n---`;
}
