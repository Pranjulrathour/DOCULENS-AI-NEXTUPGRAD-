# Security

## Secrets

`GROQ_API_KEY` is read only in `lib/config.ts` (server-only module,
imported exclusively by `lib/ai/groq.ts` and route handlers). It is never
prefixed with `NEXT_PUBLIC_`, never sent to the client, and never logged
(`lib/api/logger.ts` only logs request ID, operation, duration, file
type/size, and success/error code — never document content or credentials).

## Input validation

- File uploads: extension, declared MIME type (checked against and required
  to agree with the extension), and size are all validated before any
  parsing (`lib/validation/files.ts`). Empty and oversized files are
  rejected.
- API request bodies: validated with Zod (`lib/config.ts` for env vars,
  inline schemas in `app/api/compliance/route.ts` and
  `app/api/summarize/route.ts`).
- AI responses: every response is JSON-parsed and Zod-validated
  (`lib/ai/schemas/*.ts`) before it reaches the UI. A schema mismatch
  becomes `AI_OUTPUT_INVALID`, not a rendered bad value.

## Prompt-injection posture

Document content is treated as untrusted data inside every prompt — the
system prompts (`lib/ai/prompts/*.ts`) instruct the model to extract facts
from the document, not follow instructions found within it. There is no
code path where extracted document text is used as a system-level
instruction.

## What's explicitly out of scope for this MVP

Authentication, authorization, rate limiting, and audit logging are
out of scope per the PRD (no user accounts, no persistence). If this app
moves beyond a demo/MVP, add:

- Per-IP or per-API-key rate limiting on `/api/*` (currently unprotected
  beyond Groq's own rate limits, which surface as `AI_RATE_LIMIT`).
- Request auth (API key or session) before any `/api/*` call proceeds.
- Structured audit logging of who analyzed what, when.

## Dependency notes

Native/binary dependencies (`sharp`, `tesseract.js`, `pdfjs-dist`) are kept
external to the server bundle (`serverExternalPackages` in
`next.config.ts`) rather than papered over — see
`docs/document-processing.md` for the specific case (scanned-PDF
rasterization) that was removed after it crashed the Node process rather
than shipped as unstable functionality.
