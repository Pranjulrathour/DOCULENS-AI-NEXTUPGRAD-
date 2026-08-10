export const APP_ERROR_CODES = [
  "FILE_INVALID",
  "FILE_TOO_LARGE",
  "UNSUPPORTED_FORMAT",
  "PDF_PARSE_FAILED",
  "OCR_FAILED",
  "AI_REQUEST_FAILED",
  "AI_RATE_LIMIT",
  "AI_OUTPUT_INVALID",
  "COMPARISON_FAILED",
  "COMPLIANCE_FAILED",
  "UNKNOWN_ERROR",
] as const;

export type AppErrorCode = (typeof APP_ERROR_CODES)[number];

const DEFAULT_USER_MESSAGES: Record<AppErrorCode, string> = {
  FILE_INVALID: "This file couldn't be read. Please check it isn't corrupted and try again.",
  FILE_TOO_LARGE: "This file exceeds the maximum allowed size.",
  UNSUPPORTED_FORMAT: "This file format isn't supported.",
  PDF_PARSE_FAILED: "We couldn't read this PDF. It may be corrupted or password-protected.",
  OCR_FAILED: "We couldn't extract text from this scanned document.",
  AI_REQUEST_FAILED: "The AI service temporarily rejected the request.",
  AI_RATE_LIMIT: "AI service limit reached. Please wait a moment and try again.",
  AI_OUTPUT_INVALID: "The document could not be reliably analyzed.",
  COMPARISON_FAILED: "We couldn't compare these documents.",
  COMPLIANCE_FAILED: "We couldn't evaluate compliance for this document.",
  UNKNOWN_ERROR: "Something went wrong. Please try again.",
};

/**
 * Application-level error carrying a stable machine-readable code and a
 * user-safe message. Internal details (e.g. raw SDK errors) stay in
 * `cause`/`internalMessage` and must never reach the client response.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly userMessage: string;
  readonly retryable: boolean;

  constructor(
    code: AppErrorCode,
    options?: { internalMessage?: string; userMessage?: string; retryable?: boolean; cause?: unknown },
  ) {
    super(options?.internalMessage ?? DEFAULT_USER_MESSAGES[code]);
    this.name = "AppError";
    this.code = code;
    this.userMessage = options?.userMessage ?? DEFAULT_USER_MESSAGES[code];
    this.retryable = options?.retryable ?? false;
    if (options?.cause) this.cause = options.cause;
  }

  toResponseBody() {
    return {
      success: false as const,
      error: { code: this.code, message: this.userMessage, retryable: this.retryable },
    };
  }
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  return new AppError("UNKNOWN_ERROR", {
    internalMessage: error instanceof Error ? error.message : String(error),
    cause: error,
  });
}
