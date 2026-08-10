# Testing

## What's covered (`tests/unit/`)

| File | Covers |
|---|---|
| `comparator.test.ts` | Field/line-item comparison, normalization edge cases, deterministic variance math |
| `comparator-fixtures.test.ts` | The PRD §69 demo scenario against real Zod-validated JSON fixtures |
| `scoring.test.ts` | `MATCH_WEIGHTS` sums to 1, score-to-status thresholds, weighted credit math |
| `normalization.test.ts` | String normalization, token-overlap similarity, numeric difference/variance |
| `compliance-rules.test.ts` | Deterministic rule pattern matching, including the "must contain" subject/object fix |
| `compliance-fixtures.test.ts` | Pass/fail JSON fixtures run through the real rule evaluator |
| `file-validation.test.ts` | Extension/MIME/size validation, including mismatched extension-vs-MIME rejection |

Run:

```bash
npm test
```

All business logic under test is pure and synchronous — no mocked network
calls, no AI involved. This is intentional: the PRD explicitly separates
"things code should verify deterministically" from "things that need a live
model," and only the former are unit-tested here. Testing the AI-dependent
paths (classification accuracy, extraction quality) would require either a
live Groq key or a mocking layer beyond this MVP's scope; those paths are
instead exercised manually via `curl` against the running dev server (see
below) and validated end-to-end through the Zod schemas at the API
boundary — a schema failure surfaces as `AI_OUTPUT_INVALID`, never a silent
bad result.

## Manual end-to-end verification performed during development

Every parser was exercised against the running dev server with real files:

- `.txt`, `.xlsx` (via SheetJS-generated fixture), `.png` (via a rendered
  test image, OCR'd through the real Tesseract pipeline), `.pdf`
  (text-based, via a pdf-lib-generated fixture), and a scanned/image-only
  `.pdf` (confirmed it now fails cleanly with `OCR_FAILED` instead of
  crashing the server — see `docs/document-processing.md`).
- File-validation rejection paths: empty file, unsupported extension.
- `/api/compliance` end-to-end with real rule text (deterministic day-limit
  and field-presence rules), confirming exact PRD §69-style pass/fail output.

## Fixtures (`tests/fixtures/`)

- `factories.ts` — `makeInvoice()`/`makePurchaseOrder()` builders with sane
  defaults, used for ad-hoc test cases via `{ ...overrides }`.
- `invoice-match.json` / `purchase-order.json` — PRD §69 "Invoice A / PO A":
  identical values, expected to score a strong match.
- `invoice-mismatch.json` — PRD §69 "Invoice B": quantity 12 vs the PO's 10,
  expected to surface a quantity mismatch.
- `compliance-pass.json` / `compliance-fail.json` — a compliant and a
  non-compliant document against the same three rules.

## CI checklist

```bash
npm run lint       # eslint, zero errors
npx tsc --noEmit   # strict TypeScript, zero errors
npm test           # vitest, all passing
npm run build      # production build must succeed
```
