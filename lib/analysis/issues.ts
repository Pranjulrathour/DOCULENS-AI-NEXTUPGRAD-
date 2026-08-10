import { randomUUID } from "crypto";
import type { Issue } from "@/types/issue";
import type { ClassificationResult } from "@/lib/ai/schemas/common";
import type { ExtractionUnion } from "@/types/analysis";

const LOW_CONFIDENCE_THRESHOLD = 0.75;
const MEDIUM_CONFIDENCE_THRESHOLD = 0.9;

function makeIssue(severity: Issue["severity"], title: string, description: string): Issue {
  return { id: randomUUID(), severity, title, description };
}

/** Surfaces the "needs human review" signal PRD §78 calls out as essential UX. */
export function buildIssuesFromAnalysis(
  classification: ClassificationResult,
  extraction: ExtractionUnion,
  requiredOcr: boolean,
): Issue[] {
  const issues: Issue[] = [];

  if (classification.confidence < LOW_CONFIDENCE_THRESHOLD) {
    issues.push(
      makeIssue(
        "warning",
        "Low classification confidence",
        `Document type "${classification.documentType}" was detected with low confidence (${Math.round(classification.confidence * 100)}%). Needs human review.`,
      ),
    );
  } else if (classification.confidence < MEDIUM_CONFIDENCE_THRESHOLD) {
    issues.push(
      makeIssue(
        "info",
        "Medium classification confidence",
        `Document type detected with medium confidence (${Math.round(classification.confidence * 100)}%).`,
      ),
    );
  }

  if (requiredOcr) {
    issues.push(
      makeIssue(
        "info",
        "OCR was used",
        "This document required OCR/vision processing rather than direct text extraction, which can reduce field accuracy.",
      ),
    );
  }

  if (extraction && "missingFields" in extraction && extraction.missingFields.length > 0) {
    issues.push(
      makeIssue(
        "warning",
        "Some fields could not be found",
        `Needs human review: ${extraction.missingFields.join(", ")}.`,
      ),
    );
  }

  if (extraction && "confidence" in extraction && extraction.confidence < LOW_CONFIDENCE_THRESHOLD) {
    issues.push(
      makeIssue(
        "warning",
        "Low extraction confidence",
        `Extraction confidence is ${Math.round(extraction.confidence * 100)}%. Needs human review before relying on extracted values.`,
      ),
    );
  }

  return issues;
}
