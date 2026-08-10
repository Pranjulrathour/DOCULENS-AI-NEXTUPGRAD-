# API Reference

All routes run on the Node.js runtime (`export const runtime = "nodejs"`) —
`sharp`, `tesseract.js`, and `pdfjs-dist` aren't Edge-compatible. None of
these routes require auth (out of scope for this MVP per the PRD).

## `POST /api/analyze`

Request: `multipart/form-data`, field `file`.

```json
{
  "success": true,
  "requestId": "req_...",
  "document": { "fileName": "...", "mimeType": "...", "sizeBytes": 0, "pageCount": 1, "requiredOcr": false },
  "documentText": "...",
  "classification": { "documentType": "invoice", "confidence": 0.97, "reason": "..." },
  "extraction": { "documentType": "invoice", "...": "..." },
  "summary": { "bullets": ["..."] },
  "issues": [{ "id": "...", "severity": "warning", "title": "...", "description": "..." }],
  "processing": { "durationMs": 0, "stages": [{ "name": "parse", "durationMs": 0 }] }
}
```

`extraction` is `null` for `receipt`/`report`/`other` document types — no
dedicated schema exists for those in this MVP. `documentText` is included so
the client can pass it forward to `/api/compliance` without re-uploading.

## `POST /api/compare`

Request: `multipart/form-data`, fields `invoice` and `purchaseOrder`.

```json
{
  "success": true,
  "requestId": "req_...",
  "score": 94,
  "status": "strong_match",
  "fieldComparisons": [{ "field": "vendor", "label": "Vendor", "invoiceValue": "...", "poValue": "...", "status": "match" }],
  "lineItemComparisons": [{ "invoiceDescription": "...", "poDescription": "...", "quantity": { "...": "..." } }],
  "summary": ["..."],
  "aiExplanation": { "text": "...", "disclaimer": "...", "lineItemNotes": [], "materiallySignificant": false }
}
```

`aiExplanation` is `null` if the AI call fails — the deterministic result is
still returned; the explanation is a bonus, not a dependency.

## `POST /api/compliance`

Request (JSON):

```json
{ "document": { "text": "..." }, "rules": ["Payment terms must not exceed 30 days."] }
```

Response:

```json
{
  "success": true,
  "requestId": "req_...",
  "overallScore": 80,
  "status": "needs_review",
  "results": [{ "rule": "...", "status": "fail", "reason": "...", "evidence": "...", "confidence": 1 }]
}
```

## `POST /api/summarize`

Request: `{ "documentText": "...", "documentType": "invoice" }`. Returns
`{ "success": true, "requestId": "...", "summary": { "bullets": ["..."] } }`.
Exists as a standalone endpoint for re-summarizing without a full re-analyze;
`/api/analyze` already calls the same logic inline.

## Errors

Every failure returns the same envelope, with an HTTP status of `429` for
`AI_RATE_LIMIT` and `400` for everything else:

```json
{ "requestId": "req_...", "success": false, "error": { "code": "AI_OUTPUT_INVALID", "message": "...", "retryable": false } }
```

`code` is one of the values in `lib/errors/app-error.ts#APP_ERROR_CODES`.
`message` is always a user-safe string — internal details (stack traces,
raw SDK errors) never appear in the response body or get logged with
document content attached.
