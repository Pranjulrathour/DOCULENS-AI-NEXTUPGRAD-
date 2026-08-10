# Architecture

DocuLens AI is a single Next.js 16 App Router application. There is no
separate backend service — API routes under `app/api/*/route.ts` are the
entire server side.

## Layers

```
app/*/page.tsx        → Presentation (client components, calls fetch() against /api/*)
app/api/*/route.ts    → Request orchestration (validate → parse → classify → extract → business logic → respond)
lib/ai/*              → AI provider port + Groq implementation + prompts + Zod schemas
lib/documents/*        → Format-specific parsers behind normalize.ts
lib/comparison/*       → Deterministic invoice↔PO comparison engine
lib/compliance/*       → Deterministic + AI-assisted compliance engine
lib/validation/*       → File validation (extension + MIME + size)
lib/errors/*           → AppError — the only error type that crosses the API boundary
types/*                 → Domain types (Document, Issue, Analysis, Comparison, Compliance)
components/*            → UI, grouped by feature (upload, analysis, comparison, compliance, document-viewer)
hooks/*                 → Client-side state machines wrapping each API call (idle/busy/success/error)
```

## Dependency direction

Pages depend on hooks, hooks depend on `lib/api/client.ts`, which only
talks to this app's own `/api/*` routes — never to Groq or a vector DB
directly. Route handlers depend on `lib/ai/provider.ts` (an interface), not
`lib/ai/groq.ts` (the implementation) — `getAIProvider()` is the one place
that wires the two together. Swapping AI vendors means changing
`lib/ai/groq.ts` (or adding `lib/ai/openai.ts` and switching
`getAIProvider()`) — nothing else in the app imports an AI SDK.

## Why no database

Every request is self-contained: `/api/analyze` returns the full extracted
text and structured data in its response body, and the client re-sends that
text to `/api/compliance` or holds two files in memory for `/api/compare`.
This matches the PRD's explicit MVP scope (no persistence, no auth, no
analytics) and keeps the app horizontally stateless — any instance can serve
any request.

## Why native/binary dependencies are marked `serverExternalPackages`

`sharp`, `tesseract.js`, and `pdfjs-dist` ship compiled or WASM binaries that
Turbopack/webpack cannot place inside a bundled server chunk. `next.config.ts`
lists them under `serverExternalPackages` so Next.js requires them at runtime
instead of trying to bundle them — without this, the production build fails
with "non-ecmascript placeable asset" errors.
