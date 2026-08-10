import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createRequestId } from "@/lib/api/request-id";
import { logRequest } from "@/lib/api/logger";
import { getAIProvider } from "@/lib/ai/groq";
import { evaluateCompliance } from "@/lib/compliance/engine";
import { parseRulesFromText } from "@/lib/compliance/rules";
import { AppError, toAppError } from "@/lib/errors/app-error";

export const runtime = "nodejs";

const RequestSchema = z.object({
  document: z.object({ text: z.string().min(1) }),
  rules: z.union([z.array(z.string()), z.string()]),
});

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const start = Date.now();

  try {
    const body = RequestSchema.safeParse(await request.json());
    if (!body.success) {
      throw new AppError("COMPLIANCE_FAILED", {
        internalMessage: `Invalid request body: ${body.error.message}`,
      });
    }

    const rawRules = body.data.rules;
    const rules = Array.isArray(rawRules)
      ? rawRules.map((text, i) => ({ id: `rule_${i + 1}`, text })).filter((r) => r.text.trim().length > 0)
      : parseRulesFromText(rawRules);

    if (rules.length === 0) {
      throw new AppError("COMPLIANCE_FAILED", { userMessage: "Please provide at least one compliance rule." });
    }

    const result = await evaluateCompliance(rules, body.data.document.text, getAIProvider());

    logRequest({ requestId, operation: "compliance", durationMs: Date.now() - start, success: true });
    return NextResponse.json({ success: true, requestId, ...result });
  } catch (error) {
    const appError = toAppError(error);
    logRequest({ requestId, operation: "compliance", durationMs: Date.now() - start, success: false, errorCode: appError.code });
    return NextResponse.json({ requestId, ...appError.toResponseBody() }, { status: appError.code === "AI_RATE_LIMIT" ? 429 : 400 });
  }
}
