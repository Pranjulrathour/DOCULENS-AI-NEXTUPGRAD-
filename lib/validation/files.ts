import { AppError } from "@/lib/errors/app-error";
import type { SupportedExtension, SupportedMimeType } from "@/types/document";
import { getConfig } from "@/lib/config";

const EXTENSION_TO_MIME: Record<SupportedExtension, SupportedMimeType> = {
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
};

const ALLOWED_EXTENSIONS = Object.keys(EXTENSION_TO_MIME) as SupportedExtension[];
const ALLOWED_MIME_TYPES = new Set(Object.values(EXTENSION_TO_MIME));

export interface ValidatedFile {
  extension: SupportedExtension;
  mimeType: SupportedMimeType;
}

function getExtension(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  return idx === -1 ? "" : fileName.slice(idx).toLowerCase();
}

/**
 * Validates extension, declared MIME type, and size before any parsing occurs.
 * Extension and MIME must independently point to a supported, matching format —
 * relying on either alone is insufficient (PRD §14).
 */
export function validateUploadedFile(file: {
  name: string;
  type: string;
  size: number;
}): ValidatedFile {
  const config = getConfig();
  const maxBytes = config.MAX_FILE_SIZE_MB * 1024 * 1024;

  if (file.size <= 0) {
    throw new AppError("FILE_INVALID", { internalMessage: `Empty file: ${file.name}` });
  }

  if (file.size > maxBytes) {
    throw new AppError("FILE_TOO_LARGE", {
      userMessage: `File exceeds the ${config.MAX_FILE_SIZE_MB} MB limit.`,
      internalMessage: `File ${file.name} is ${file.size} bytes, limit ${maxBytes} bytes`,
    });
  }

  const extension = getExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(extension as SupportedExtension)) {
    throw new AppError("UNSUPPORTED_FORMAT", {
      internalMessage: `Unsupported extension: ${extension}`,
    });
  }

  const expectedMime = EXTENSION_TO_MIME[extension as SupportedExtension];
  const declaredMime = file.type as SupportedMimeType;

  if (declaredMime && !ALLOWED_MIME_TYPES.has(declaredMime)) {
    throw new AppError("UNSUPPORTED_FORMAT", {
      internalMessage: `Unsupported MIME type: ${declaredMime}`,
    });
  }

  if (declaredMime && declaredMime !== expectedMime) {
    throw new AppError("FILE_INVALID", {
      internalMessage: `Extension ${extension} does not match declared MIME type ${declaredMime}`,
    });
  }

  return { extension: extension as SupportedExtension, mimeType: expectedMime };
}
