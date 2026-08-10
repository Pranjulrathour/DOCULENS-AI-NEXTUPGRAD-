import { NextRequest, NextResponse } from "next/server";
import { extractValidatedFile, fileToNormalizedDocument } from "@/lib/api/multipart";
import { createRequestId } from "@/lib/api/request-id";
import { logRequest } from "@/lib/api/logger";
import { getAIProvider } from "@/lib/ai/groq";
import { compareInvoiceToPurchaseOrder } from "@/lib/comparison/comparator";
import { StageTimer } from "@/lib/analysis/stage-timer";
import { AppError, toAppError } from "@/lib/errors/app-error";

export const runtime = "nodejs";

const COMPARISON_DISCLAIMER =
  "Line-item product matching and materiality judgments are AI interpretations, not deterministic facts.";

export async function POST(request: NextRequest) {
  const requestId = createRequestId();
  const timer = new StageTimer();

  try {
    const formData = await request.formData();
    const [invoiceFile, poFile] = await Promise.all([
      extractValidatedFile(formData, "invoice"),
      extractValidatedFile(formData, "purchaseOrder"),
    ]);

    const [invoiceDoc, poDoc] = await timer.run("parse", () =>
      Promise.all([fileToNormalizedDocument(invoiceFile), fileToNormalizedDocument(poFile)]),
    );

    const aiProvider = getAIProvider();

    const [invoiceExtraction, poExtraction] = await timer.run("extract", () =>
      Promise.all([
        aiProvider.extractInvoice({ documentText: invoiceDoc.text }),
        aiProvider.extractPurchaseOrder({ documentText: poDoc.text }),
      ]),
    );

    const comparison = await timer.run("compare", async () =>
      compareInvoiceToPurchaseOrder(invoiceExtraction, poExtraction),
    );

    const explanation = await timer.run("explain", async () => {
      try {
        return await aiProvider.explainComparison({
          computedComparisonJson: JSON.stringify(comparison),
        });
      } catch (error) {
        if (error instanceof AppError) throw error;
        return null;
      }
    });

    const processing = timer.finish();
    logRequest({ requestId, operation: "compare", durationMs: processing.durationMs, success: true });

    return NextResponse.json({
      success: true,
      requestId,
      score: comparison.score,
      status: comparison.status,
      fieldComparisons: comparison.fieldComparisons,
      lineItemComparisons: comparison.lineItemComparisons,
      summary: comparison.summary,
      aiExplanation: explanation
        ? { text: explanation.overallExplanation, disclaimer: COMPARISON_DISCLAIMER, lineItemNotes: explanation.lineItemNotes, materiallySignificant: explanation.materiallySignificant }
        : null,
      processing,
    });
  } catch (error) {
    const appError = toAppError(error);
    logRequest({ requestId, operation: "compare", success: false, errorCode: appError.code });
    return NextResponse.json({ requestId, ...appError.toResponseBody() }, { status: appError.code === "AI_RATE_LIMIT" ? 429 : 400 });
  }
}
