import { AppError } from "@/lib/errors/app-error";
import type { DocumentPage } from "@/types/document";

const MIN_CHARS_PER_PAGE_FOR_TEXT_PATH = 20;

let _workerConfigured = false;

async function loadPdfDocument(buffer: Buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!_workerConfigured) {
    // Run in-process without a separate worker thread.
    // Empty string is the documented no-worker sentinel for Node.js environments.
    pdfjs.GlobalWorkerOptions.workerSrc = "";
    _workerConfigured = true;
  }
  const data = new Uint8Array(buffer);
  return pdfjs.getDocument({
    data,
    isEvalSupported: false,
    disableFontFace: true,
    verbosity: 0,
  }).promise;
}

export interface PdfExtractionResult {
  pages: DocumentPage[];
  fullText: string;
  requiresOcr: boolean;
}

export async function extractPdf(buffer: Buffer): Promise<PdfExtractionResult> {
  let pdf: Awaited<ReturnType<typeof loadPdfDocument>>;
  try {
    pdf = await loadPdfDocument(buffer);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    // Temporary: log full error so Vercel logs reveal the real cause
    console.error("[PDFJS_ERROR]", msg, error instanceof Error ? error.stack : "");
    throw new AppError("PDF_PARSE_FAILED", {
      internalMessage: msg,
      cause: error,
    });
  }

  const pages: DocumentPage[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const tc = await page.getTextContent();
    const text = tc.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    pages.push({ pageNumber: i, text });
  }

  const totalChars = pages.reduce((s, p) => s + (p.text?.length ?? 0), 0);
  const requiresOcr =
    totalChars / Math.max(pages.length, 1) < MIN_CHARS_PER_PAGE_FOR_TEXT_PATH;

  if (requiresOcr) {
    throw new AppError("OCR_FAILED", {
      userMessage:
        "This PDF appears to be scanned or image-based. Please upload the page as an image (PNG/JPG) instead.",
      internalMessage: `Only ${totalChars} chars across ${pages.length} pages.`,
    });
  }

  const fullText = pages
    .map((p) => `[Page ${p.pageNumber}]\n${p.text ?? ""}`)
    .join("\n\n");
  return { pages, fullText, requiresOcr: false };
}
