import { randomUUID } from "crypto";
import { AppError } from "@/lib/errors/app-error";
import type { NormalizedDocument, SupportedExtension, SupportedMimeType } from "@/types/document";
import { extractPdf } from "./pdf";
import { extractDocx } from "./docx";
import { extractXlsx } from "./xlsx";
import { processImage } from "./images";
import { ocrImageBuffer } from "./ocr";

export interface NormalizeInput {
  fileName: string;
  mimeType: SupportedMimeType;
  extension: SupportedExtension;
  buffer: Buffer;
}

export async function normalizeDocument(input: NormalizeInput): Promise<NormalizedDocument> {
  const id = randomUUID();
  const createdAt = new Date().toISOString();

  switch (input.extension) {
    case ".pdf": {
      // extractPdf throws OCR_FAILED for scanned/image-based PDFs — see lib/documents/pdf.ts.
      const { pages, fullText } = await extractPdf(input.buffer);
      return {
        id,
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.buffer.length,
        pageCount: pages.length,
        text: fullText,
        pages,
        metadata: { createdAt, sourceType: "upload", parser: "pdfjs", requiredOcr: false },
      };
    }

    case ".png":
    case ".jpg":
    case ".jpeg":
    case ".webp": {
      const processed = await processImage(input.buffer);
      const text = await ocrImageBuffer(processed.buffer);
      return {
        id,
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.buffer.length,
        pageCount: 1,
        text,
        pages: [
          {
            pageNumber: 1,
            text,
            imageBase64: processed.base64,
            width: processed.width,
            height: processed.height,
          },
        ],
        metadata: { createdAt, sourceType: "upload", parser: "sharp+tesseract", requiredOcr: true },
      };
    }

    case ".docx": {
      const { text, tables } = await extractDocx(input.buffer);
      return {
        id,
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.buffer.length,
        text,
        tables,
        metadata: { createdAt, sourceType: "upload", parser: "mammoth", requiredOcr: false },
      };
    }

    case ".xlsx": {
      const { text, tables } = extractXlsx(input.buffer);
      return {
        id,
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.buffer.length,
        text,
        tables,
        metadata: { createdAt, sourceType: "upload", parser: "sheetjs", requiredOcr: false },
      };
    }

    case ".txt": {
      const text = input.buffer.toString("utf-8");
      return {
        id,
        fileName: input.fileName,
        mimeType: input.mimeType,
        sizeBytes: input.buffer.length,
        text,
        metadata: { createdAt, sourceType: "upload", parser: "utf8", requiredOcr: false },
      };
    }

    default:
      throw new AppError("UNSUPPORTED_FORMAT", {
        internalMessage: `No parser registered for extension: ${input.extension}`,
      });
  }
}
