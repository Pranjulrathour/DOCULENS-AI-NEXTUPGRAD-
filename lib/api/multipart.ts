import { AppError } from "@/lib/errors/app-error";
import { validateUploadedFile } from "@/lib/validation/files";
import { normalizeDocument } from "@/lib/documents/normalize";
import type { NormalizedDocument } from "@/types/document";

export async function extractValidatedFile(formData: FormData, fieldName: string): Promise<File> {
  const file = formData.get(fieldName);
  if (!(file instanceof File)) {
    throw new AppError("FILE_INVALID", { internalMessage: `Missing file field: ${fieldName}` });
  }
  return file;
}

export async function fileToNormalizedDocument(file: File): Promise<NormalizedDocument> {
  const validated = validateUploadedFile({ name: file.name, type: file.type, size: file.size });
  const buffer = Buffer.from(await file.arrayBuffer());
  return normalizeDocument({
    fileName: file.name,
    mimeType: validated.mimeType,
    extension: validated.extension,
    buffer,
  });
}
