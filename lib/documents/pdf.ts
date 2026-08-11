import { AppError } from "@/lib/errors/app-error";
import type { DocumentPage } from "@/types/document";

/** Below this average chars/page, a PDF is treated as scanned/image-based (PRD §15 Path B). */
const MIN_CHARS_PER_PAGE_FOR_TEXT_PATH = 20;

// pdf-parse internally uses pdfjs-dist 2.x which requires browser globals
// (DOMMatrix, ImageData, Path2D) that are normally polyfilled by @napi-rs/canvas.
// That native package isn't available in Vercel serverless, so we provide
// minimal stubs here — pdfjs only calls them during canvas *rendering*, and
// we only call getTextContent() (no rendering path), so stubs are safe.
if (typeof globalThis.DOMMatrix === "undefined") {
  class MinDOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    is2D = true; isIdentity = true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(_?: any) {}
    multiply() { return new MinDOMMatrix(); }
    translate() { return new MinDOMMatrix(); }
    scale() { return new MinDOMMatrix(); }
    rotate() { return new MinDOMMatrix(); }
    inverse() { return new MinDOMMatrix(); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformPoint(p: any) { return p; }
    toFloat32Array() { return new Float32Array(16); }
    toFloat64Array() { return new Float64Array(16); }
    toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
  }
  (globalThis as Record<string, unknown>).DOMMatrix = MinDOMMatrix;
}
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as Record<string, unknown>).ImageData = class {
    width = 0; height = 0; data = new Uint8ClampedArray(0);
    constructor(w = 0, h = 0) { this.width = w; this.height = h; this.data = new Uint8ClampedArray(w * h * 4); }
  };
}
if (typeof globalThis.Path2D === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  (globalThis as Record<string, unknown>).Path2D = class {};
}

// pdf-parse is a CJS module kept in serverExternalPackages so Turbopack
// loads it via require() rather than the broken ESM shim.
interface PdfParseResult {
  numpages: number;
  text: string;
}
interface PdfPageData {
  getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
}
interface PdfParseOptions {
  pagerender?: (pageData: PdfPageData) => Promise<string>;
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
