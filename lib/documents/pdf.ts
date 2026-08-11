import { getDocumentProxy, extractText } from "unpdf";
import { AppError } from "@/lib/errors/app-error";
import type { DocumentPage } from "@/types/document";

/** Below this average chars/page, a PDF is treated as scanned/image-based (PRD §15 Path B). */
const MIN_CHARS_PER_PAGE_FOR_TEXT_PATH = 20;

export interface PdfExtractionResult {
  pages: DocumentPage[];
  fullText: string;
  requiresOcr: boolean;
}

/**
 * Only Path A (text-based PDFs) is supported. Rasterizing scanned PDF pages
 * server-side for OCR requires a native canvas implementation, which is
 * unreliable across serverless runtimes. Surfacing a clear, honest error here
 * is preferable to a feature that can crash the whole function (PRD Rule 4 —
 * no fake functionality).
 *
 * Uses `unpdf`, a pdf.js wrapper purpose-built for serverless/edge runtimes —
 * it runs pdf.js's parser in-process without any Worker/DOMMatrix dependency,
 * which is what made pdfjs-dist and pdf-parse fail under Vercel's Node.js
 * serverless functions (no browser globals, no Worker threads available).
 */
export async function extractPdf(buffer: Buffer): Promise<PdfExtractionResult> {
  let pageTexts: string[];
  let totalPages: number;

  try {
    const data = new Uint8Array(buffer);
    const pdf = await getDocumentProxy(data);
    const result = await extractText(pdf, { mergePages: false });
    pageTexts = result.text;
    totalPages = result.totalPages;
  } catch (error) {
    throw new AppError("PDF_PARSE_FAILED", {
      internalMessage: error instanceof Error ? error.message : String(error),
      cause: error,
    });
  }

  const pages: DocumentPage[] = pageTexts.map((text, index) => ({
    pageNumber: index + 1,
    text: text.replace(/\s+/g, " ").trim(),
  }));

  const totalChars = pages.reduce((sum, p) => sum + (p.text?.length ?? 0), 0);
  const requiresOcr = totalChars / Math.max(totalPages, 1) < MIN_CHARS_PER_PAGE_FOR_TEXT_PATH;

  if (requiresOcr) {
    throw new AppError("OCR_FAILED", {
      userMessage:
        "This PDF appears to be scanned or image-based. Scanned-PDF OCR isn't supported yet in this MVP — please upload the page as an image (PNG/JPG) instead.",
      internalMessage: `PDF has ${totalPages} pages with only ${totalChars} extractable characters; scanned-PDF rasterization is disabled (unstable native renderer).`,
    });
  }

  const fullText = pages.map((p) => `[Page ${p.pageNumber}]\n${p.text ?? ""}`).join("\n\n");
  return { pages, fullText, requiresOcr: false };
}
