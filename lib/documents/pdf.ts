import { AppError } from "@/lib/errors/app-error";
import type { DocumentPage } from "@/types/document";

/** Below this average chars/page, a PDF is treated as scanned/image-based (PRD §15 Path B). */
const MIN_CHARS_PER_PAGE_FOR_TEXT_PATH = 20;

// pdf-parse (and its bundled pdfjs-dist 2.x) requires browser globals that are
// normally provided by @napi-rs/canvas, which is unavailable in Vercel serverless.
// Stub them out — pdfjs only uses them for canvas *rendering*, never for text
// extraction, so no-ops are safe here.
if (typeof globalThis.DOMMatrix === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  const M = class {
    a=1;b=0;c=0;d=1;e=0;f=0;
    m11=1;m12=0;m13=0;m14=0;m21=0;m22=1;m23=0;m24=0;
    m31=0;m32=0;m33=1;m34=0;m41=0;m42=0;m43=0;m44=1;
    is2D=true;isIdentity=true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(_?:any){}
    multiply(){return new M();}translate(){return new M();}
    scale(){return new M();}rotate(){return new M();}inverse(){return new M();}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transformPoint(p:any){return p;}
    toFloat32Array(){return new Float32Array(16);}
    toFloat64Array(){return new Float64Array(16);}
    toString(){return "matrix(1,0,0,1,0,0)";}
  };
  (globalThis as Record<string,unknown>).DOMMatrix = M;
}
if (typeof globalThis.ImageData === "undefined") {
  (globalThis as Record<string,unknown>).ImageData = class {
    width=0;height=0;data=new Uint8ClampedArray(0);
    constructor(w=0,h=0){this.width=w;this.height=h;this.data=new Uint8ClampedArray(w*h*4);}
  };
}
if (typeof globalThis.Path2D === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-extraneous-class
  (globalThis as Record<string,unknown>).Path2D = class {};
}

interface PdfParseResult { numpages: number; text: string; }
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<PdfParseResult>;

export interface PdfExtractionResult {
  pages: DocumentPage[];
  fullText: string;
  requiresOcr: boolean;
}

export async function extractPdf(buffer: Buffer): Promise<PdfExtractionResult> {
  let result: PdfParseResult;
  try {
    result = await pdfParse(buffer);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[PDF_PARSE_DEBUG]", msg, error instanceof Error ? error.stack : "");
    throw new AppError("PDF_PARSE_FAILED", {
      internalMessage: msg,
      cause: error,
    });
  }

  const pageCount = Math.max(result.numpages, 1);
  const fullText = result.text ?? "";
  const totalChars = fullText.replace(/\s/g, "").length;
  const requiresOcr = totalChars / pageCount < MIN_CHARS_PER_PAGE_FOR_TEXT_PATH;

  if (requiresOcr) {
    throw new AppError("OCR_FAILED", {
      userMessage:
        "This PDF appears to be scanned or image-based. Scanned-PDF OCR isn't supported yet — please upload the page as an image (PNG/JPG) instead.",
      internalMessage: `PDF has ${pageCount} pages with only ${totalChars} extractable characters.`,
    });
  }

  // Split into per-page chunks on form-feed (\f) if present, otherwise one page.
  const rawPages = fullText.split("\f").filter((t) => t.trim().length > 0);
  const pages: DocumentPage[] =
    rawPages.length > 1
      ? rawPages.map((text, i) => ({ pageNumber: i + 1, text: text.replace(/\s+/g, " ").trim() }))
      : [{ pageNumber: 1, text: fullText.replace(/\s+/g, " ").trim() }];

  return { pages, fullText, requiresOcr: false };
}
