import type { AppErrorCode } from "@/lib/errors/app-error";

export class ClientApiError extends Error {
  readonly code: AppErrorCode;
  readonly retryable: boolean;

  constructor(code: AppErrorCode, message: string, retryable: boolean) {
    super(message);
    this.name = "ClientApiError";
    this.code = code;
    this.retryable = retryable;
  }
}

interface ErrorResponseBody {
  success: false;
  error: { code: AppErrorCode; message: string; retryable: boolean };
}

async function unwrap<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok || body?.success === false) {
    const errorBody = body as ErrorResponseBody;
    throw new ClientApiError(
      errorBody?.error?.code ?? "UNKNOWN_ERROR",
      errorBody?.error?.message ?? "Something went wrong. Please try again.",
      errorBody?.error?.retryable ?? false,
    );
  }
  return body as T;
}

export async function postFormData<T>(url: string, formData: FormData): Promise<T> {
  const response = await fetch(url, { method: "POST", body: formData });
  return unwrap<T>(response);
}

export async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return unwrap<T>(response);
}
