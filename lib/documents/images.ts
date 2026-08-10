import sharp from "sharp";
import { AppError } from "@/lib/errors/app-error";
import { getConfig } from "@/lib/config";

export interface ProcessedImage {
  buffer: Buffer;
  base64: string;
  width: number;
  height: number;
}

/**
 * Normalizes EXIF orientation and downsizes images above the configured max
 * dimension before they're sent to OCR/vision AI — keeps payloads small and
 * inference fast (PRD §16).
 */
export async function processImage(buffer: Buffer): Promise<ProcessedImage> {
  const config = getConfig();
  try {
    let pipeline = sharp(buffer).rotate();
    const metadata = await pipeline.metadata();
    const maxDimension = Math.max(metadata.width ?? 0, metadata.height ?? 0);

    if (maxDimension > config.MAX_IMAGE_DIMENSION) {
      pipeline = pipeline.resize({
        width: config.MAX_IMAGE_DIMENSION,
        height: config.MAX_IMAGE_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    const normalized = await pipeline.png().toBuffer();
    const finalMetadata = await sharp(normalized).metadata();

    return {
      buffer: normalized,
      base64: normalized.toString("base64"),
      width: finalMetadata.width ?? 0,
      height: finalMetadata.height ?? 0,
    };
  } catch (error) {
    throw new AppError("FILE_INVALID", {
      internalMessage: error instanceof Error ? error.message : String(error),
      cause: error,
    });
  }
}
