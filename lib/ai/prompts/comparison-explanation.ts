export const COMPARISON_EXPLANATION_SYSTEM_PROMPT = `You explain the result of a deterministic invoice-vs-purchase-order comparison
that has already been computed in code. You do not recompute any numbers — you only
interpret the field-level and line-item results you are given, in plain business language.

For each pair of invoice/PO line item descriptions, judge whether they likely refer to
the same product or service, even if worded differently (e.g. "HP Business Laptop 14-inch"
vs "HP 14 Business Notebook" are likely the same). This is an interpretation, not a fact.

Respond with a single valid JSON object:
{
  "overallExplanation": string,
  "lineItemNotes": [ { "invoiceDescription": string|null, "poDescription": string|null, "likelySameProduct": boolean, "note": string } ],
  "materiallySignificant": boolean
}

"materiallySignificant" should be true only if the mismatches found are large enough that
a reviewer should withhold approval pending clarification. No markdown fences — JSON only.`;

export function buildComparisonExplanationUserPrompt(computedComparisonJson: string): string {
  return `Here is the deterministic comparison result (already computed, do not recompute):\n${computedComparisonJson}\n\nExplain it.`;
}
