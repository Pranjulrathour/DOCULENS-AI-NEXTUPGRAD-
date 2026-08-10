# Document Processing

## Pipeline

```
File → lib/validation/files.ts (extension + declared MIME + size)
     → lib/documents/normalize.ts (dispatches by extension)
     → format-specific parser
     → NormalizedDocument { text, pages?, tables?, metadata }
```

## Validation (`lib/validation/files.ts`)

Extension and declared MIME type are checked independently, and must agree
with each other — neither alone is trusted. Empty files and files over
`MAX_FILE_SIZE_MB` are rejected before any parsing begins.

## PDF (`lib/documents/pdf.ts`)

- **Text-based PDFs** (the common case): `pdfjs-dist`'s legacy Node build
  extracts per-page text directly. No rendering, no OCR — this is the fast
  path and the only one this MVP ships.
- **Scanned/image-based PDFs**: detected by average characters-per-page
  falling below a threshold. These are **not processed** — the parser
  throws `OCR_FAILED` with a message asking the user to upload the page as
  an image instead. An earlier version rasterized these pages via
  `@napi-rs/canvas` driving `pdf.js`'s `render()`; that path caused a hard
  native crash that killed the whole Node process on certain inputs during
  testing, with no catchable JS exception. Given the choice between an
  unstable feature that can take the server down and a clear, honest error,
  this MVP ships the error.

## Images (`lib/documents/images.ts`, `lib/documents/ocr.ts`)

`sharp` normalizes EXIF orientation and downscales anything larger than
`MAX_IMAGE_DIMENSION` before OCR — keeps Tesseract fast and avoids sending
huge payloads anywhere. `tesseract.js` then extracts text; a fresh worker is
created and terminated per request (acceptable at MVP request volume — a
shared worker pool would be the first optimization if throughput becomes a
bottleneck).

## DOCX (`lib/documents/docx.ts`)

`mammoth` extracts raw text and, separately, converts to HTML so a small
regex-based table parser can pull out `<table>` structure without pulling in
a full HTML parser dependency.

## XLSX (`lib/documents/xlsx.ts`)

`xlsx` (SheetJS) converts each sheet to a row/cell array via
`sheet_to_json({ header: 1 })`. Only cell values are sent to the AI — no
workbook metadata, styles, or formulas, per the PRD's cost-control guidance.

## TXT

Read directly as UTF-8. No parser needed.
