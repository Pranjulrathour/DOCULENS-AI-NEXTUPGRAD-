# Compliance Engine

## Input

Free-text rules, one per line (`lib/compliance/rules.ts#parseRulesFromText`
strips numbering like `"1. "` and drops blank lines).

## Deterministic-first evaluation (`lib/compliance/rules.ts`)

`evaluateRuleDeterministically(rule, documentText)` tries two patterns before
giving up and returning `null` (meaning: defer to AI):

1. **Payment-terms day limit** — `"payment terms must not exceed N days"`
   style rules are checked against a `"Net N"` pattern in the document text.
   If the document doesn't mention `Net N` at all, this returns `null` rather
   than guessing — free-text payment terms need the AI's reading
   comprehension.
2. **Field presence** — two sub-patterns, evaluated correctly for which side
   of the sentence is the actual field being checked:
   - `"<document> must contain <field>"` → checks for `<field>` (the object).
   - `"<field> must be present / is required / must be included"` → checks
     for `<field>` (the subject).

   Field-presence checking requires **every** keyword in the phrase to
   appear in the document, not just any one — `"purchase order number"`
   must find all three words, not pass because the document happens to
   contain the unrelated word "number" from "invoice number".

Both deterministic checks return `confidence: 1` (day limit, since it's exact
arithmetic on extracted text) or `confidence: 0.85` (field presence, since
keyword matching is a proxy for "the field is genuinely there").

## AI fallback (`lib/compliance/engine.ts`)

Rules that can't be resolved deterministically are batched into a **single**
AI call per document (`evaluateCompliance` in `lib/ai/provider.ts`) — not one
call per rule, per the PRD's cost-control guidance. The AI is instructed
(`lib/ai/prompts/compliance.ts`) that any rule it receives already couldn't
be resolved in code, so it should focus on genuine reading-comprehension
judgment, not re-attempt arithmetic.

## Scoring

`overallScore` = `round(pass-equivalent points / applicable rules × 100)`,
where `not_applicable` rules are excluded from the denominator entirely
(they shouldn't drag the score down for rules that don't apply), and
`warning` counts as half a point. `≥90 compliant`, `≥60 needs_review`, else
`non_compliant`.

## UI

Each rule result shows a status badge (never color-only — every status
pairs an icon with a label) and, on expand, the reason, evidence, and an
"AI confidence" badge with heuristic High/Medium/Low buckets — explicitly
not framed as a calibrated accuracy score.
