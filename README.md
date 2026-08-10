# DocuLens AI

> **Intelligent Document Analysis, Comparison & Compliance Platform**

[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![Groq](https://img.shields.io/badge/AI-Groq_API-orange)](https://console.groq.com/)
[![Tests](https://img.shields.io/badge/Tests-44_passing-brightgreen)](tests/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

**DocuLens AI** transforms complex business documents into structured intelligence using large language models. Upload an invoice, purchase order, contract, or regulatory filing — get classification, field extraction, deterministic mismatch detection, compliance evaluation, and plain-language summaries.

Built as a single Next.js application: no database, no auth layer, no separate backend service. Enterprise-grade code; intentionally minimal infrastructure.

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Models Used](#models-used)
- [Setup](#setup)
- [Supported File Types](#supported-file-types)
- [API Reference](#api-reference)
- [Invoice vs PO Matching](#invoice-vs-po-matching)
- [Compliance Engine](#compliance-engine)
- [Test Documents](#test-documents)
- [Design Decisions](#design-decisions)
- [Error Codes](#error-codes)
- [Testing](#testing)
- [Security](#security)
- [Deployment](#deployment)
- [Production Readiness](#production-readiness)
- [Limitations & Roadmap](#limitations--roadmap)

---

## Features

### Document Analysis (`/analyze`)
- Upload PDF, DOCX, XLSX, TXT, PNG, JPG, JPEG, or WEBP (up to 20 MB)
- Auto-classify into: **Invoice**, **Purchase Order**, **Contract**, **Regulatory Filing**, **Receipt**, **Report**, or **Other** — with confidence score and reasoning
- Extract structured fields per document type: line items, amounts, dates, parties, risk indicators, filing references
- Generate a plain-language executive summary tailored to the document category
- OCR for image-based documents (PNG/JPG/WEBP) via Tesseract.js
- Per-page text extraction from text-based PDFs via pdf.js

### Invoice vs Purchase Order Comparison (`/compare`)
- Upload an invoice and a purchase order simultaneously
- Deterministic field-by-field comparison with configurable tolerances
- Weighted match score across 7 dimensions with animated SVG ring (spring physics)
- AI-generated explanation of every discrepancy, labeled with explicit disclaimer
- Match status buckets: **Strong Match** ≥ 85%, **Partial Match** ≥ 60%, **Poor Match** below 60%
- Materially significant flag when total variance exceeds threshold

### Compliance Rule Evaluation (`/compliance`)
- Type any number of free-form compliance rules in plain English
- Deterministic engine handles payment-term day limits and required-field presence rules
- Non-deterministic rules batched into a single AI call (not one per rule — cost-efficient)
- Returns per-rule PASS / FAIL / WARN with a reason for each

### Document Summary
- Standalone summary endpoint for any supported document type
- Streaming-ready API architecture (SSE compatible)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js App (single process — frontend + backend)          │
│                                                             │
│  ┌─────────────┐    ┌──────────────────────────────────┐   │
│  │  UI Pages   │───▶│  API Routes (app/api/*/route.ts) │   │
│  │  /analyze   │    │  POST /api/analyze               │   │
│  │  /compare   │    │  POST /api/compare               │   │
│  │  /compliance│    │  POST /api/compliance            │   │
│  └─────────────┘    │  POST /api/summarize             │   │
│                      └──────────────┬───────────────────┘   │
│                                     │                        │
│                      ┌──────────────▼───────────────────┐   │
│                      │  lib/ — Business Logic           │   │
│                      │  ├── ai/provider.ts (port)       │   │
│                      │  ├── ai/groq.ts (Groq SDK only)  │   │
│                      │  ├── comparison/ (deterministic) │   │
│                      │  ├── compliance/ (deterministic) │   │
│                      │  └── documents/ (parsers)        │   │
│                      └──────────────┬───────────────────┘   │
│                                     │                        │
│                      ┌──────────────▼───────────────────┐   │
│                      │  Groq API (external)             │   │
│                      └──────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Folder Structure

```
app/
├── api/                     # Next.js API Routes (the backend)
│   ├── analyze/route.ts     # POST /api/analyze
│   ├── compare/route.ts     # POST /api/compare
│   ├── compliance/route.ts  # POST /api/compliance
│   └── summarize/route.ts   # POST /api/summarize
├── analyze/                 # /analyze page
├── compare/                 # /compare page
├── compliance/              # /compliance page
└── page.tsx                 # Landing/home page

lib/
├── ai/
│   ├── provider.ts          # AIProvider interface (port abstraction)
│   ├── groq.ts              # GroqProvider — only file that imports Groq SDK
│   ├── prompts/             # System + user prompt templates per task
│   └── schemas/             # Zod schemas for every AI response
├── comparison/
│   ├── comparator.ts        # Deterministic field comparator
│   ├── scoring.ts           # Weighted match score computation
│   ├── normalization.ts     # String/numeric normalization utilities
│   └── types.ts             # MATCH_WEIGHTS constant + domain types
├── compliance/
│   └── rules.ts             # Deterministic rule pattern engine
├── documents/
│   ├── pdf.ts               # pdf.js text extraction (text-based PDFs only)
│   ├── image.ts             # Tesseract.js OCR for PNG/JPG/WEBP
│   ├── docx.ts              # mammoth DOCX → plain text
│   └── xlsx.ts              # SheetJS multi-sheet extraction
├── errors/
│   └── app-error.ts         # AppError, AppErrorCode, toAppError()
├── validation/
│   └── files.ts             # Extension + MIME + size validation
└── config.ts                # Env config (server-only)

components/
├── comparison/              # Match score ring, field diff table, explanation card
├── document-viewer/         # File preview, extraction result cards
├── compliance/              # Rule list editor, result badges
└── ui/                      # shadcn/ui base components

tests/
├── unit/                    # Pure logic tests (Vitest) — no network, no AI
└── fixtures/                # Zod-validated JSON fixtures for demo scenarios

test-documents/              # 11 ready-to-use test files (all supported formats)
docs/                        # Architecture decisions, API reference, deployment guide
```

### Layering Rule

```
UI Pages → API Routes → lib/ (Business Logic) → AIProvider Port → Groq SDK
```

- API routes never import the Groq SDK — only `lib/ai/groq.ts` does
- Domain logic (`lib/comparison/`, `lib/compliance/`) has zero imports from `app/api/` or vendor AI SDKs
- `AIProvider` interface allows swapping Groq for any OpenAI-compatible provider by changing one file

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript strict) |
| Styling | Tailwind CSS v4 + shadcn/ui (Base UI variant) |
| Animation | Motion (Framer Motion successor) |
| AI Inference | Groq API (OpenAI-compatible) |
| PDF Parsing | pdfjs-dist (legacy build, text extraction only) |
| OCR | Tesseract.js (LSTM engine, English) |
| DOCX | mammoth |
| XLSX | SheetJS (xlsx) |
| Schema Validation | Zod v3 |
| Icons | Lucide React |
| Testing | Vitest |
| Linting | ESLint (Next.js flat config) |
| Type Checking | TypeScript strict mode |

---

## Models Used

All accessed via Groq API (OpenAI-compatible endpoint):

| Purpose | Model | Env var |
|---|---|---|
| Classification, extraction, summaries | `openai/gpt-oss-20b` | `GROQ_FAST_MODEL` |
| Complex reasoning, comparison explanation | `openai/gpt-oss-120b` | `GROQ_REASONING_MODEL` |
| Vision / image understanding | `qwen/qwen3.6-27b` | `GROQ_VISION_MODEL` |

Model names are environment-configurable — no code changes needed if Groq retires a model.

---

## Setup

### Prerequisites

- Node.js 20+
- A Groq API key ([console.groq.com](https://console.groq.com) — free tier available)

### Install

```bash
git clone https://github.com/Pranjulrathour/DOCULENS-AI-NEXTUPGRAD-.git
cd DOCULENS-AI-NEXTUPGRAD-
npm install
```

### Configure

Create `.env.local` in the project root:

```env
GROQ_API_KEY=your_groq_api_key_here

GROQ_FAST_MODEL=openai/gpt-oss-20b
GROQ_REASONING_MODEL=openai/gpt-oss-120b
GROQ_VISION_MODEL=qwen/qwen3.6-27b

MAX_FILE_SIZE_MB=20
MAX_IMAGE_DIMENSION=2000
AMOUNT_TOLERANCE_PERCENT=1
QUANTITY_TOLERANCE=0
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables Reference

| Variable | Purpose | Default |
|---|---|---|
| `GROQ_API_KEY` | Server-only Groq key. **Never** prefix `NEXT_PUBLIC_`. | required |
| `GROQ_FAST_MODEL` | Model for classification, extraction, summaries | `openai/gpt-oss-20b` |
| `GROQ_REASONING_MODEL` | Model for complex reasoning and explanation | `openai/gpt-oss-120b` |
| `GROQ_VISION_MODEL` | Model for vision tasks | `qwen/qwen3.6-27b` |
| `MAX_FILE_SIZE_MB` | Upload size limit in MB | `20` |
| `MAX_IMAGE_DIMENSION` | Max image dimension before downscaling | `2000` |
| `AMOUNT_TOLERANCE_PERCENT` | Amount variance tolerance for comparison | `1` |
| `QUANTITY_TOLERANCE` | Quantity variance tolerance for comparison | `0` |

---

## Supported File Types

| Extension | Parser | Notes |
|---|---|---|
| `.pdf` | pdf.js | Text-based PDFs only. Scanned PDFs return `OCR_FAILED` — upload as PNG/JPG instead |
| `.docx` | mammoth | Full text + structure extraction |
| `.xlsx` | SheetJS | All sheets extracted and concatenated |
| `.txt` | Native Buffer | UTF-8 plain text |
| `.png` `.jpg` `.jpeg` `.webp` | Tesseract.js | OCR via LSTM engine, English language pack |

---

## API Reference

### `POST /api/analyze`

Multipart form upload. Field name: `file`.

**Success response:**
```json
{
  "classification": {
    "type": "invoice",
    "confidence": 0.97,
    "reasoning": "Document contains invoice number, line items with unit prices, and payment terms."
  },
  "extraction": {
    "invoiceNumber": "INV-2026-0047",
    "vendor": {
      "name": "Meridian Office Supplies",
      "address": "42 Commerce Park, Andheri East, Mumbai 400069",
      "taxId": "GSTIN 27AADCM1234A1Z5"
    },
    "buyer": {
      "name": "Solstice Retail Group",
      "address": "Plot 7, Industrial Estate, Pune 411001",
      "taxId": "GSTIN 27BBBFS5678B1Z1"
    },
    "lineItems": [
      {
        "description": "A4 Copy Paper (Box of 500 sheets)",
        "quantity": 120,
        "unitPrice": 850,
        "total": 102000
      }
    ],
    "subtotal": 312150,
    "tax": 56188,
    "total": 368338,
    "currency": "INR",
    "paymentTerms": "Net 30",
    "issueDate": "2026-07-14",
    "dueDate": "2026-08-13",
    "poReference": "PO-44210"
  },
  "summary": "Invoice from Meridian Office Supplies to Solstice Retail Group for office supplies totaling ₹3,68,338 with Net 30 payment terms.",
  "issues": [],
  "stageDurations": {
    "classify": 320,
    "extract": 890,
    "summarize": 410
  }
}
```

**Error response:**
```json
{
  "error": {
    "code": "FILE_TOO_LARGE",
    "message": "File exceeds the 20 MB limit. Please upload a smaller file.",
    "retryable": false
  }
}
```

---

### `POST /api/compare`

Multipart form upload. Fields: `invoice`, `purchaseOrder`.

**Success response:**
```json
{
  "score": 30,
  "status": "poor_match",
  "fields": {
    "vendor": {
      "match": true,
      "invoiceValue": "Crestwood Industrial Supplies",
      "poValue": "Crestwood Industrial Supplies"
    },
    "total": {
      "match": false,
      "invoiceValue": 375538,
      "poValue": 345538,
      "variance": 8.67,
      "direction": "invoice_higher"
    }
  },
  "lineItemResults": [
    {
      "invoiceItem": { "description": "Steel Filing Cabinet", "quantity": 12, "unitPrice": 8750 },
      "poItem": { "description": "Steel Filing Cabinet", "quantity": 10, "unitPrice": 8750 },
      "match": false,
      "mismatch": { "field": "quantity", "invoiceValue": 12, "poValue": 10, "variance": 20 }
    }
  ],
  "mismatches": [
    {
      "field": "quantity",
      "description": "Quantity mismatch: invoice has 12, PO has 10 (20.00% variance)",
      "severity": "high",
      "materiallySignificant": true
    }
  ],
  "materiallySignificant": true,
  "explanation": {
    "text": "The invoice and purchase order show significant discrepancies...",
    "disclaimer": "This explanation is AI-generated. The match score and field comparisons above are deterministic."
  }
}
```

---

### `POST /api/compliance`

JSON body.

**Request:**
```json
{
  "document": {
    "text": "INVOICE INV-2026-0047\nPayment Terms: Net 30\nGST No: 27AADCM1234A1Z5\n..."
  },
  "rules": [
    "Payment terms must not exceed Net 30",
    "Invoice must contain a GST number",
    "The vendor address must be present"
  ]
}
```

**Success response:**
```json
{
  "results": [
    {
      "rule": "Payment terms must not exceed Net 30",
      "status": "pass",
      "reason": "Document specifies 'Net 30' which meets the maximum of 30 days.",
      "method": "deterministic"
    },
    {
      "rule": "Invoice must contain a GST number",
      "status": "pass",
      "reason": "GST number found: 27AADCM1234A1Z5",
      "method": "deterministic"
    },
    {
      "rule": "The vendor address must be present",
      "status": "pass",
      "reason": "Vendor address is present in the document.",
      "method": "ai"
    }
  ]
}
```

---

## Invoice vs PO Matching

Match score is computed with weighted, configurable dimensions in `lib/comparison/types.ts`:

| Dimension | Weight | Method |
|---|---|---|
| Vendor name | 15% | Token-overlap Jaccard similarity (threshold 0.6) |
| PO Number | 15% | Exact match after normalization |
| Line items | 25% | Per-item matching by description similarity + field comparison |
| Quantity | 15% | Exact (tolerance configurable via `QUANTITY_TOLERANCE`) |
| Unit price | 10% | Variance % (tolerance configurable via `AMOUNT_TOLERANCE_PERCENT`) |
| Tax | 10% | Variance % |
| Total | 10% | Variance % |

The weights are asserted to sum to 1.0 at module load — a startup crash rather than a silently wrong score.

String fields use token-overlap similarity so `"ABC Technologies Pvt. Ltd."` and `"abc technologies pvt ltd"` match without collapsing genuinely different vendors together. The AI only adds a plain-language explanation and same-product semantic judgment for line items worded differently — always labeled "AI Interpretation", never presented as the deterministic result.

---

## Compliance Engine

Rules are free text, one per line. Evaluated in two passes:

**Pass 1 — Deterministic (fast, zero AI cost):**
- Payment-term day limits: `"Payment terms must not exceed Net N"` — extracts N, searches for `Net \d+` in document text, compares numerically
- Required field presence: `"X must contain Y"` / `"Y must be present"` — keyword search requiring ALL extracted keywords to be present (not just any one)

**Pass 2 — AI batch (for rules that don't match deterministic patterns):**
- All remaining rules batched into a single LLM call per document — not one call per rule
- Result labeled `method: "ai"` in the response

---

## Test Documents

The `test-documents/` folder contains 11 pre-built files for manual testing:

| File | Category | What to test |
|---|---|---|
| `invoice-alpha.pdf` | Invoice | Analyze → expect full extraction. Compare with `purchase-order-alpha.docx` → **100% Strong Match** |
| `purchase-order-alpha.docx` | Purchase Order | Matching baseline for alpha invoice |
| `invoice-beta.pdf` | Invoice | Compare with `purchase-order-beta.docx` → **~30% Poor Match** (qty 12 vs 10) |
| `purchase-order-beta.docx` | Purchase Order | Baseline with qty 10; invoice has 12 |
| `contract-vendor-agreement.pdf` | Contract | Analyze → risk indicator: one-sided indemnification clause |
| `regulatory-filing-disclosure.txt` | Regulatory Filing | Analyze → REG-QCD-2026-Q2-0447, Q2 FY2026-27 |
| `receipt-retail.png` | Receipt | OCR extraction — Greenleaf Supermart, 3 items |
| `quarterly-financial-report.xlsx` | Report | Multi-sheet P&L + regional breakdown |
| `scanned-invoice.jpg` | Invoice (OCR) | OCR from JPEG — Pinnacle Hardware, INV-33210 |
| `packing-slip.jpeg` | Other | No monetary values — should classify as "other" |
| `product-label.webp` | Other | Product label — should classify as "other" |

**Recommended test sequence:**
1. Analyze each file individually on `/analyze`
2. Run `invoice-alpha.pdf` + `purchase-order-alpha.docx` on `/compare` → Strong Match
3. Run `invoice-beta.pdf` + `purchase-order-beta.docx` on `/compare` → Poor Match with mismatch report
4. Test `/compliance` with `invoice-alpha.pdf` text and rules like `"Payment terms must not exceed Net 30"`, `"Invoice must contain a GST number"`

---

## Design Decisions

### Deterministic-First Philosophy
Math never goes to the AI. Differences, variance percentages, match scores, and field-presence checks are computed in pure TypeScript. The LLM handles classification, extraction, semantic judgement on ambiguous compliance rules, and human-readable explanation.

This means: if the AI hallucinated a 0% variance on mismatched quantities, the deterministic comparator would still catch it. AI is an interpreter, not the source of mathematical truth.

### AIProvider Port Abstraction
`lib/ai/provider.ts` defines the `AIProvider` interface. `lib/ai/groq.ts` is the only file that imports the Groq SDK. Swapping to OpenAI, Anthropic, or a local Ollama instance requires changing exactly one file.

### Zod at Every AI Boundary
Every model response goes through: raw output → strip markdown fences → `JSON.parse` → `schema.safeParse`. A parse failure becomes `AI_OUTPUT_INVALID`, never a silently rendered bad value. All schema fields are `nullable()` — the model can return `null` for any field it can't confidently extract, which is far preferable to hallucinating a value.

### No Database, No Auth
Per PRD requirements: no user accounts, no persistence, no analytics. Everything lives in browser memory for the session duration. This makes the app trivially deployable and horizontally scalable at zero additional infra cost.

### Error Architecture
`AppErrorCode` is a stable union type. `AppError` carries a `userMessage` (shown in UI) and `internalMessage` (logged server-side only). The two are never mixed — the API key, document content, and stack traces never reach the client response body.

### Native Dependency Strategy
`sharp`, `tesseract.js`, and `pdfjs-dist` are listed in `serverExternalPackages` in `next.config.ts`, preventing Turbopack from trying to bundle native `.node` binaries. They're `require()`'d by Node at runtime instead.

### Scanned PDF Limitation
Rasterizing scanned PDF pages for OCR requires a native canvas implementation. `@napi-rs/canvas` — the only option available in this environment — crashed the Node process at the native layer on certain pages (not a catchable JS exception). Rather than ship a feature that can take the server down, a clear `OCR_FAILED` error is returned with instructions to re-upload as PNG/JPG. This is documented, honest behavior rather than hidden instability.

---

## Error Codes

| Code | Meaning | User-facing | Retryable |
|---|---|---|---|
| `FILE_INVALID` | Empty or corrupt file | Yes | No |
| `FILE_TOO_LARGE` | Exceeds `MAX_FILE_SIZE_MB` | Yes | No |
| `UNSUPPORTED_FORMAT` | Extension or MIME type not allowed | Yes | No |
| `PDF_PARSE_FAILED` | pdf.js could not open the file | Yes | No |
| `OCR_FAILED` | Scanned PDF or unreadable image | Yes | No |
| `AI_REQUEST_FAILED` | Groq API returned non-200 | Internal | Yes (1 retry) |
| `AI_RATE_LIMIT` | Groq 429 — rate limit | Yes | Yes (after backoff) |
| `AI_OUTPUT_INVALID` | Model response failed Zod schema | Internal | No |
| `COMPARISON_FAILED` | Comparison logic threw unexpectedly | Internal | No |
| `COMPLIANCE_FAILED` | Compliance evaluation threw unexpectedly | Internal | No |
| `UNKNOWN_ERROR` | Unexpected error not matching any above | Internal | No |

---

## Testing

```bash
npm test          # 44 Vitest unit tests — all pure logic, no AI calls
npm run lint      # ESLint (zero errors)
npx tsc --noEmit  # TypeScript strict (zero errors)
npm run build     # Production build verification
```

### Unit Test Files

| File | What it covers |
|---|---|
| `comparator.test.ts` | Field comparison, normalization, variance math |
| `comparator-fixtures.test.ts` | PRD demo scenarios with Zod-validated JSON fixtures |
| `scoring.test.ts` | MATCH_WEIGHTS sums to 1, score-to-status thresholds |
| `normalization.test.ts` | String similarity, numeric edge cases |
| `compliance-rules.test.ts` | Deterministic rule patterns (7 cases + subject/object regression) |
| `compliance-fixtures.test.ts` | Pass/fail fixture round-trips |
| `file-validation.test.ts` | Extension/MIME/size validation rejection paths |

All business logic under test is pure and synchronous — no mocked network calls, no AI dependency. The AI-dependent paths (classification accuracy, extraction quality) are validated end-to-end through Zod schemas at the API boundary — a schema failure surfaces as `AI_OUTPUT_INVALID`, never a silent bad result.

---

## Security

- `GROQ_API_KEY` read only in `lib/config.ts` (server module). Never prefixed `NEXT_PUBLIC_`, never logged, never sent to the client.
- API response logging: request ID, operation, duration, file type/size, success/error code only — **never** document content or credentials.
- Every API boundary validates input with Zod before any logic runs.
- Document content inside prompts is treated as untrusted data — system prompts instruct the model to extract facts, not follow instructions found within the document (prompt injection defense).
- `.env.local` is gitignored. `.env.example` documents required variables without real values.

For MVP scope exclusions (auth, rate limiting, audit logging), see [SECURITY.md](SECURITY.md).

---

## Deployment

### Vercel (Recommended)

```
1. Push to GitHub
2. Import repository into Vercel
3. Set environment variables in Vercel project settings:
   - GROQ_API_KEY
   - GROQ_FAST_MODEL
   - GROQ_REASONING_MODEL
   - GROQ_VISION_MODEL
   - MAX_FILE_SIZE_MB
   - AMOUNT_TOLERANCE_PERCENT
   - QUANTITY_TOLERANCE
4. Deploy
```

All API routes use `export const runtime = "nodejs"` — they cannot run on the Edge runtime because `tesseract.js`, `pdfjs-dist`, and `sharp` require Node.js native modules.

### Self-Hosted (Node.js)

```bash
npm run build
npm start
```

Set the environment variables above before starting. The app is stateless — run as many instances behind a load balancer as needed with no shared state required.

---

## Production Readiness

| Item | Status |
|---|---|
| Clean Architecture layering (no inward violations) | ✅ |
| TypeScript strict — zero errors | ✅ |
| ESLint clean — zero errors | ✅ |
| Unit tests present and passing (44 tests) | ✅ |
| Zod validation on all AI responses | ✅ |
| Structured logging at all API boundaries | ✅ |
| Error codes — user-safe messages never mixed with internals | ✅ |
| Secrets in env — `.env.example` present, nothing in git | ✅ |
| Deterministic comparison math (no AI for numbers) | ✅ |
| Hybrid retrieval | — N/A (no vector store in MVP) |
| Authentication + rate limiting | ⚠️ Out of scope for MVP |
| Docker / docker-compose | ⚠️ Not included (standard Next.js Dockerfile applies) |
| CI/CD pipeline | ⚠️ Not wired — add GitHub Actions for lint/test/build |
| Streaming responses (token-level) | ⚠️ API is SSE-ready; streaming UI not implemented |

---

## Limitations & Roadmap

### Current Limitations
- **Scanned/image-based PDFs** — not supported; upload as PNG/JPG instead (see design decision above)
- **No persistence** — refreshing the page loses the current analysis (intentional per PRD scope)
- **Rate limiting** — bounded single retry on Groq 429; no sophisticated backoff loop
- **English only** — Tesseract OCR is configured for English; other languages require adding language packs

### Roadmap (Not Implemented)
- JSON/CSV export of extraction and comparison results
- Ask-a-question-about-this-document (scoped to current document only)
- Side-by-side diff view for two documents of the same type
- Batch processing — upload a folder of invoices, get a summary report
- Streaming token output to the UI (SSE stream already wired at the API layer)
- Docker + GitHub Actions CI/CD
- Auth layer (API key or OAuth) for team deployments

---

## License

MIT — free to use, modify, and distribute.

---

**Author:** Pranjul Rathour
**Designation:** GenAI Engineer
**Organization:** NEXT UPGRAD WEB SOLUTIONS
