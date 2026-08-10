# Deployment

## Target

Vercel free tier (per PRD §85 — ₹0 development and deployment cost).

## Steps

1. Push the repository to GitHub.
2. In Vercel, "Import Project" → select the repo.
3. Set environment variables (Project Settings → Environment Variables):
   - `GROQ_API_KEY` (required — server-only, never `NEXT_PUBLIC_`)
   - `GROQ_FAST_MODEL`, `GROQ_REASONING_MODEL`, `GROQ_VISION_MODEL`
   - Optionally override `MAX_FILE_SIZE_MB`, `MAX_IMAGE_DIMENSION`,
     `AMOUNT_TOLERANCE_PERCENT`, `QUANTITY_TOLERANCE`
4. Deploy. Vercel auto-detects Next.js; no custom build command needed.
5. Verify: upload works, `/api/analyze` returns a classification, `/api/compare`
   returns a score, `/api/compliance` returns rule results.

## Runtime notes

- All API routes declare `export const runtime = "nodejs"` — they depend on
  `sharp` (native), `tesseract.js` (WASM), and `pdfjs-dist`, none of which
  run on the Edge runtime.
- `next.config.ts` sets `serverExternalPackages` for those three libraries so
  the production bundler treats them as runtime dependencies instead of
  trying to inline them — without this the build fails.
- No database, no Redis, no external session store — every instance is
  stateless and horizontally scalable by default.

## Local production build check

```bash
npm run build
npm run start
```

Confirms the exact artifact Vercel will run, before pushing.

## Free-tier limits to watch

Groq's free/developer tier has rate limits that vary by model and change
over time. `AI_RATE_LIMIT` (HTTP 429) is surfaced cleanly to the user with a
"please wait a moment" message and a bounded single retry — there is no
retry loop that could make rate-limit pressure worse.
