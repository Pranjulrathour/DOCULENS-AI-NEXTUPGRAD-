# AI Pipeline

## Provider abstraction

`lib/ai/provider.ts` defines `AIProvider` — eight methods (`classify`,
`extractInvoice`, `extractPurchaseOrder`, `extractContract`,
`extractRegulatoryFiling`, `summarize`, `evaluateCompliance`,
`explainComparison`). `lib/ai/groq.ts` implements it via `groq-sdk`.
`getAIProvider()` is a lazy singleton — every route handler calls that
function, never `new GroqProvider()` or the Groq SDK directly.

## Model routing

Two models, both environment-configurable (`GROQ_FAST_MODEL`,
`GROQ_REASONING_MODEL`):

- **Fast model** — classification, invoice extraction, PO extraction, summaries.
- **Reasoning model** — contract extraction, regulatory filing extraction,
  compliance evaluation, comparison explanation. These tasks involve longer
  documents, more ambiguity, or judgment calls the fast model is less
  reliable at.

## Request flow (`completeJson` in `lib/ai/groq.ts`)

```
prompt (lib/ai/prompts/*.ts)
  → Groq chat completion, response_format: json_object, temperature 0.1
  → strip markdown code fences if present
  → JSON.parse
  → Zod schema.safeParse (lib/ai/schemas/*.ts)
  → on failure at any step: AppError("AI_OUTPUT_INVALID")
  → on HTTP 429: one bounded retry (500ms backoff), then AppError("AI_RATE_LIMIT")
  → on any other failure: AppError("AI_REQUEST_FAILED")
```

No response is ever rendered to the UI without passing Zod validation first.
There is no code path that displays a raw, unvalidated model response.

## Anti-hallucination rules (`lib/ai/prompts/shared.ts`)

Every extraction prompt shares `GROUNDING_RULES`, which instructs the model
to:

- Extract only what's explicitly supported by the document text.
- Return `null` for anything not found — never guess.
- Normalize numbers to plain values (no currency symbols/separators).
- Report a confidence score.

Schemas make every field `nullable()` so a `null` response is always valid,
not something the model has to work around by inventing a placeholder.

## Prompt/schema versioning

Prompts live in `lib/ai/prompts/*.ts`, one file per task — never inline in a
route handler. Schemas are named with an explicit version suffix
(`InvoiceExtractionV1Schema`) so a future breaking schema change ships as
`V2` alongside `V1`, not a silent mutation.
