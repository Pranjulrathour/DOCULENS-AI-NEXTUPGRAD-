import { AppError } from "@/lib/errors/app-error";
import type { DocumentPage } from "@/types/document";

/** Below this average chars/page, a PDF is treated as scanned/image-based (PRD §15 Path B). */
const MIN_CHARS_PER_PAGE_FOR_TEXT_PATH = 20;

async function loadPdfDocument(buffer: Buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(buffer);
  // pdf.js logs a harmless "standardFontDataUrl not provided" warning here
  // since we never call render() — text extraction (getTextContent) doesn't
  // need font data, and pointing it at a real path breaks under Turbopack's
  // externalized-package resolution, so the warning is left as-is.
  return pdfjs.getDocument({ data, isEvalSupported: false }).promise;
}

export interface PdfExtractionResult {
  pages: DocumentPage[];
  fullText: string;
  requiresOcr: boolean;
}

async function extractTextPerPage(
  pdf: Awaited<ReturnType<typeof loadPdfDocument>>,
): Promise<DocumentPage[]> {
  const pages: DocumentPage[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const text = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    const viewport = page.getViewport({ scale: 1 });
    pages.push({ pageNumber, text, width: viewport.width, height: viewport.height });
  }
  return pages;
}

/**
 * Only Path A (text-based PDFs) is supported. Rasterizing scanned PDF pages
 * server-side for OCR requires a native canvas implementation; the only
 * available option in this environment (@napi-rs/canvas driving pdf.js's
 * render()) crashes the Node process at the native layer on certain pages
 * rather than throwing a catchable error — unacceptable in production.
 * Surfacing a clear, honest error here is preferable to a feature that can
 * take the whole server down (PRD Rule 4 — no fake functionality).
 */
export async function extractPdf(buffer: Buffer): Promise<PdfExtractionResult> {
  let pdf: Awaited<ReturnType<typeof loadPdfDocument>>;
  try {
    pdf = await loadPdfDocument(buffer);
  } catch (error) {
    throw new AppError("PDF_PARSE_FAILED", {
      internalMessage: error instanceof Error ? error.message : String(error),
      cause: error,
    });
  }

  const pages = await extractTextPerPage(pdf);
  const totalChars = pages.reduce((sum, p) => sum + (p.text?.length ?? 0), 0);
  const requiresOcr = totalChars / Math.max(pages.length, 1) < MIN_CHARS_PER_PAGE_FOR_TEXT_PATH;

  if (requiresOcr) {
    throw new AppError("OCR_FAILED", {
      userMessage:
        "This PDF appears to be scanned or image-based. Scanned-PDF OCR isn't supported yet in this MVP — please upload the page as an image (PNG/JPG) instead.",
      internalMessage: `PDF has ${pages.length} pages with only ${totalChars} extractable characters; scanned-PDF rasterization is disabled (unstable native renderer).`,
    });
  }

  const fullText = pages.map((p) => `[Page ${p.pageNumber}]\n${p.text ?? ""}`).join("\n\n");
  return { pages, fullText, requiresOcr: false };
}
