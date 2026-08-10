import { z } from "zod";

/** Confidence must be a normalized probability, never assumed calibrated — see PRD §77. */
export const ConfidenceSchema = z.number().min(0).max(1);

export const NullableStringSchema = z.string().nullable();
export const NullableNumberSchema = z.number().nullable();

export const DocumentTypeSchema = z.enum([
  "invoice",
  "purchase_order",
  "contract",
  "regulatory_filing",
  "receipt",
  "report",
  "other",
]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

export const ClassificationResultSchema = z.object({
  documentType: DocumentTypeSchema,
  confidence: ConfidenceSchema,
  reason: z.string(),
});
export type ClassificationResult = z.infer<typeof ClassificationResultSchema>;
