import { AppError } from "@/lib/errors/app-error";
import type { DocumentPage } from "@/types/document";

const MIN_CHARS_PER_PAGE_FOR_TEXT_PATH = 20;

// pdfjs-dist v5 references DOMMatrix at module evaluation time (not just during
// rendering). Vercel serverless Node.js has no browser globals, so we polyfill
// before the dynamic import() fires. pdfjs only uses DOMMatrix for canvas
// rendering; we call getTextContent() only, so a no-op stub is safe.
if (typeof globalThis.DOMMatrix === "undefined") {
  const NM = class DOMMatrix {
    a=1;b=0;c=0;d=1;e=0;f=0;
    m11=1;m12=0;m13=0;m14=0;m21=0;m22=1;m23=0;m24=0;
    m31=0;m32=0;m33=1;m34=0;m41=0;m42=0;m43=0;m44=1;
    is2D=true;isIdentity=true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(_?: any) {}
    static fromMatrix() { return new NM(); }
    static fromFloat32Array() { return new NM(); }
    static fromFloat64Array() { return new NM(); }
    multiply() { return new NM(); }
    translate() { return new NM(); }
    scale() { return new NM(); }
    scaleNonUniform() { return new NM(); }
    scale3d() { return new NM(); }
    rotate() { return new NM(); }
    rotateFromVector() { return new NM(); }
    rotateAxisAngle() { return new NM(); }
    skewX() { return new NM(); }
    skewY() { return new NM(); }
    flipX() { return new NM(); }
    flipY() { return new NM(); }
    inverse() { return new NM(); }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformPoint(p: any) { return p ?? { x: 0, y: 0, z: 0, w: 1 }; }
    toFloat32Array() { return new Float32Array(16); }
    toFloat64Array() { return new Float64Array(16); }
    toString() { return "matrix(1, 0, 0, 1, 0, 0)"; }
  };
  (globalThis as Record<string, unknown>).DOMMatrix = NM;
}
if (typeof globalThis.Path2D === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  (globalThis as Record<string, unknown>).Path2D = class Path2D {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(_?: any) {}
  };
}

let _workerConfigured = false;

async function loadPdfDocument(buffer: Buffer) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  if (!_workerConfigured) {
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
    console.error("[PDFJS_ERROR]", msg);
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
