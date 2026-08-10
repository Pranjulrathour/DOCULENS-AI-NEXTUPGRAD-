import { NextRequest, NextResponse } from "next/server";
import { extractValidatedFile, fileToNormalizedDocument } from "@/lib/api/multipart";
import { createRequestId } from "@/lib/api/request-id";
import { logRequest } from "@/lib/api/logger";
import { getAIProvider } from "@/lib/ai/groq";
import { extractByDocumentType } from "@/lib/analysis/extract-by-type";
import { buildIssuesFromAnalysis } from "@/lib/analysis/issues";
import { StageTimer } from "@/lib/analysis/stage-timer";
import { toAppError } from "@/lib/errors/app-error";
import type { AnalysisResult } from "@/types/analysis";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const timer = new StageTimer();
  let fileType = "unknown";
  let fileSizeBytes = 0;

  try {
    const formData = await request.formData();
    const file = await timer.run("validate", () => extractValidatedFile(formData, "file"));
    fileType = file.type;
    fileSizeBytes = file.size;

    const normalized = await timer.run("parse", () => fileToNormalizedDocument(file));
    const aiProvider = getAIProvider();

    const classification = await timer.run("classify", () =>
      aiProvider.classify({ documentText: normalized.text }),
    );

    const extraction = await timer.run("extract", () =>
      extractByDocumentType(classification.documentType, normalized.text, aiProvider),
    );

    const summary = await timer.run("summarize", () =>
      aiProvider.summarize({ documentText: normalized.text, documentType: classification.documentType }),
    );

    const issues = buildIssuesFromAnalysis(classification, extraction, normalized.metadata.requiredOcr);

    const result: AnalysisResult = {
      requestId,
      document: {
        fileName: normalized.fileName,
        mimeType: normalized.mimeType,
        sizeBytes: normalized.sizeBytes,
        pageCount: normalized.pageCount,
        requiredOcr: normalized.metadata.requiredOcr,
      },
      documentText: normalized.text,
      classification,
      extraction,
      summary,
      issues,
      processing: timer.finish(),
    };

    logRequest({ requestId, operation: "analyze", durationMs: result.processing.durationMs, fileType, fileSizeBytes, success: true });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    const appError = toAppError(error);
    logRequest({ requestId, operation: "analyze", fileType, fileSizeBytes, success: false, errorCode: appError.code });
    return NextResponse.json({ requestId, ...appError.toResponseBody() }, { status: appError.code === "AI_RATE_LIMIT" ? 429 : 400 });
  }
}
