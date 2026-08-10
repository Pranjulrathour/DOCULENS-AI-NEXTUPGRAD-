import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRequestId } from "@/lib/api/request-id";
import { logRequest } from "@/lib/api/logger";
import { getAIProvider } from "@/lib/ai/groq";
import { DocumentTypeSchema } from "@/lib/ai/schemas/common";
import { toAppError } from "@/lib/errors/app-error";

export const runtime = "nodejs";

const RequestSchema = z.object({
  documentText: z.string().min(1),
  documentType: DocumentTypeSchema,
});

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const start = Date.now();

  try {
    const body = RequestSchema.parse(await request.json());
    const summary = await getAIProvider().summarize(body);

    logRequest({ requestId, operation: "summarize", durationMs: Date.now() - start, success: true });
    return NextResponse.json({ success: true, requestId, summary });
  } catch (error) {
    const appError = toAppError(error);
    logRequest({ requestId, operation: "summarize", durationMs: Date.now() - start, success: false, errorCode: appError.code });
    return NextResponse.json({ requestId, ...appError.toResponseBody() }, { status: appError.code === "AI_RATE_LIMIT" ? 429 : 400 });
  }
}
