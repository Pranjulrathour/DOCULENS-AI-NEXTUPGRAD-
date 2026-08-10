# Comparison Engine

`lib/comparison/comparator.ts` is the only place invoice/PO comparison logic
lives — it is pure, synchronous, and has no AI or I/O dependency, so it's
directly unit-testable (see `tests/unit/comparator.test.ts`).

## Normalization (`lib/comparison/normalization.ts`)

- Strings: lowercase, strip harmless punctuation, collapse whitespace.
- Similarity: token-overlap (Jaccard-style) score in `[0, 1]` —
  `stringSimilarity("ABC Technologies Pvt. Ltd.", "abc technologies pvt ltd")`
  returns `1` after normalization; unrelated vendor names score low. This is
  deliberately conservative: it must never coerce two materially different
  entities into a match.
- Numbers: `numericDifference` (signed difference) and `variancePercent`
  (`|a - b| / b * 100`, with explicit handling for `b === 0` to avoid
  division by zero).

## Field comparison

Each field becomes a `FieldComparison` with a `ComparisonStatus`:
`match | mismatch | warning | missing | not_applicable`. String fields use
the similarity threshold (`STRING_MATCH_THRESHOLD = 0.6`) to decide
`match`/`warning`/`mismatch`; numeric fields compare variance against the
configurable tolerance (`AMOUNT_TOLERANCE_PERCENT`, `QUANTITY_TOLERANCE`).
Either side being `null` is `missing`, never silently treated as a match or
mismatch.

## Line-item pairing

Invoice and PO line items aren't guaranteed to be in the same order or worded
identically. `pairLineItems` greedily matches each invoice item to its
highest-similarity unclaimed PO item (above the threshold); anything left
over becomes an unpaired item on either side. This is the same normalization
primitive as vendor matching, just applied per line item.

## Scoring (`lib/comparison/scoring.ts`)

```ts
MATCH_WEIGHTS = { vendor: 0.15, poNumber: 0.15, lineItems: 0.25,
                  quantity: 0.15, unitPrice: 0.10, tax: 0.10, total: 0.10 }
```

The weights are asserted to sum to 1 at module load (fails fast if someone
edits one without updating the others). Each weighted key gets a credit
(`match`/`not_applicable` = 1, `warning` = 0.5, `mismatch`/`missing` = 0);
`computeMatchScore` is `round(Σ weight × credit × 100)`.
`scoreToOverallStatus` buckets the result: `≥90 strong_match`, `≥70 review`,
else `poor_match`.

## Where the AI comes in

Only after the deterministic result exists: `/api/compare` serializes the
computed `ComparisonResult` and asks the AI to (a) explain it in plain
language and (b) judge whether differently-worded line-item descriptions
likely refer to the same product. The AI never recomputes a number — the
prompt (`lib/ai/prompts/comparison-explanation.ts`) explicitly tells it not
to. The UI labels this output "AI Interpretation" and includes a disclaimer,
never presenting it as the deterministic result.
