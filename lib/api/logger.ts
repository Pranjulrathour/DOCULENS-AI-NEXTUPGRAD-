/**
 * Minimal structured logging (PRD §65). Never log full document content,
 * prompts, or API keys — only operational metadata.
 */
export interface LogFields {
  requestId: string;
  operation: string;
  durationMs?: number;
  fileType?: string;
  fileSizeBytes?: number;
  success: boolean;
  errorCode?: string;
}

export function logRequest(fields: LogFields): void {
  const { requestId, operation, durationMs, fileType, fileSizeBytes, success, errorCode } = fields;
  console.log(
    JSON.stringify({
      requestId,
      operation,
      durationMs,
      fileType,
      fileSizeBytes,
      success,
      errorCode,
      timestamp: new Date().toISOString(),
    }),
  );
}
