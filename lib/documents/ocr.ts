import { createWorker } from "tesseract.js";
import { AppError } from "@/lib/errors/app-error";

/**
 * Runs Tesseract OCR over a single image buffer. Each call spins up and
 * terminates its own worker — acceptable for MVP request volume; a shared
 * worker pool would be the next optimization if throughput becomes an issue.
 */
export async function ocrImageBuffer(buffer: Buffer): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const { data } = await worker.recognize(buffer);
    return data.text.replace(/\s+/g, " ").trim();
  } catch (error) {
    throw new AppError("OCR_FAILED", {
      internalMessage: error instanceof Error ? error.message : String(error),
      cause: error,
    });
  } finally {
    await worker.terminate();
  }
}

export async function ocrPages(
  pages: { pageNumber: number; imageBase64?: string }[],
): Promise<Map<number, string>> {
  const results = new Map<number, string>();
  for (const page of pages) {
    if (!page.imageBase64) continue;
    const text = await ocrImageBuffer(Buffer.from(page.imageBase64, "base64"));
    results.set(page.pageNumber, text);
  }
  return results;
}
