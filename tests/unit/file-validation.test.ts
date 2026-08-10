import { describe, expect, it } from "vitest";
import { validateUploadedFile } from "@/lib/validation/files";
import { AppError } from "@/lib/errors/app-error";

function expectAppErrorCode(fn: () => unknown, code: string) {
  try {
    fn();
    throw new Error("Expected AppError to be thrown");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).code).toBe(code);
  }
}

describe("validateUploadedFile", () => {
  it("accepts a valid PDF", () => {
    const result = validateUploadedFile({ name: "invoice.pdf", type: "application/pdf", size: 1024 });
    expect(result.extension).toBe(".pdf");
    expect(result.mimeType).toBe("application/pdf");
  });

  it("rejects an empty file", () => {
    expectAppErrorCode(() => validateUploadedFile({ name: "empty.txt", type: "text/plain", size: 0 }), "FILE_INVALID");
  });

  it("rejects a file over the configured size limit", () => {
    expectAppErrorCode(
      () => validateUploadedFile({ name: "huge.pdf", type: "application/pdf", size: 21 * 1024 * 1024 }),
      "FILE_TOO_LARGE",
    );
  });

  it("rejects an unsupported extension", () => {
    expectAppErrorCode(
      () => validateUploadedFile({ name: "malware.exe", type: "application/octet-stream", size: 1024 }),
      "UNSUPPORTED_FORMAT",
    );
  });

  it("rejects a mismatched extension/MIME-type pair", () => {
    expectAppErrorCode(
      () => validateUploadedFile({ name: "invoice.pdf", type: "image/png", size: 1024 }),
      "FILE_INVALID",
    );
  });

  it("relies on more than the extension alone — an unsupported declared MIME type is rejected even with a valid extension string appended", () => {
    expectAppErrorCode(
      () => validateUploadedFile({ name: "invoice.pdf", type: "application/x-msdownload", size: 1024 }),
      "UNSUPPORTED_FORMAT",
    );
  });
});
