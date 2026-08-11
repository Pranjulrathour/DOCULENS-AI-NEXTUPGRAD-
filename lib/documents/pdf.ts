import { AppError } from "@/lib/errors/app-error";
import type { DocumentPage } from "@/types/document";

/** Below this average chars/page, a PDF is treated as scanned/image-based (PRD §15 Path B). */
const MIN_CHARS_PER_PAGE_FOR_TEXT_PATH = 20;

// pdf-parse is a CJS module kept external in serverExternalPackages.
// TypeScript's ESM type shim for pdf-parse has no default export, so we
// load it via require() and type it inline to avoid TS2613/TS1192 errors.
interface PdfParseResult {
  numpages: number;
  text: string;
}
interface PdfParseOptions {
  pagerender?: (pageData: {
    getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
  }) => Promise<string>;
}
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (
  buf: Buffer,
  opts?: PdfParseOptions,
) => Promise<PdfParseResult>;

export interface PdfExtractionResult {
  pages: DocumentPage[];
  fullText: string;
  requiresOcr: boolean;
}

/**
 * Only Path A (text-based PDFs) is supported. Rasterizing scanned PDF pages
 * server-side for OCR requires a native canvas implementation; the only
 * available option in this environment crashes the Node process at the native
 * layer on certain pages rather than throwing a catchable error — unacceptable
 * in production. Surfacing a clear, honest error here is preferable to a
 * feature that can take the whole server down (PRD Rule 4 — no fake functionality).
 */
export async function extractPdf(buffer: Buffer): Promise<PdfExtractionResult> {
  // pdf-parse bundles pdfjs-dist 2.x with Node.js shims applied — no
  // GlobalWorkerOptions configuration is needed for serverless environments.
  const pages: DocumentPage[] = [];

  let result: PdfParseResult;
  try {
    result = await pdfParse(buffer, {
      pagerender(pageData) {
        return pageData.getTextContent().then((tc) => {
          const text = tc.items
            .map((item) => item.str ?? "")
            .join(" ")
            .replace(/\s+/g, " ")
            .trim();
          pages.push({ pageNumber: pages.length + 1, text });
          return text;
        });
      },
    });
  } catch (error) {
    throw new AppError("PDF_PARSE_FAILED", {
      internalMessage: error instanceof Error ? error.message : String(error),
      cause: error,
    });
  }

  const pageCount = result.numpages || Math.max(pages.length, 1);
  const totalChars = pages.reduce((sum, p) => sum + (p.text?.length ?? 0), 0);
  const requiresOcr = totalChars / pageCount < MIN_CHARS_PER_PAGE_FOR_TEXT_PATH;

  if (requiresOcr) {
    throw new AppError("OCR_FAILED", {
      userMessage:
        "This PDF appears to be scanned or image-based. Scanned-PDF OCR isn't supported yet in this MVP — please upload the page as an image (PNG/JPG) instead.",
      internalMessage: `PDF has ${pageCount} pages with only ${totalChars} extractable characters; scanned-PDF rasterization is disabled (unstable native renderer).`,
    });
  }

  const fullText =
    pages.length > 0
      ? pages.map((p) => `[Page ${p.pageNumber}]\n${p.text ?? ""}`).join("\n\n")
      : result.text;

  return { pages, fullText, requiresOcr: false };
}
