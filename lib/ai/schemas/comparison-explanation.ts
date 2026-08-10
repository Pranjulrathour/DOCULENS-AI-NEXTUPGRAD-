import { z } from "zod";

export const LineItemMatchNoteSchema = z.object({
  invoiceDescription: z.string().nullable(),
  poDescription: z.string().nullable(),
  likelySameProduct: z.boolean(),
  note: z.string(),
});
export type LineItemMatchNote = z.infer<typeof LineItemMatchNoteSchema>;

export const ComparisonExplanationResultSchema = z.object({
  overallExplanation: z.string(),
  lineItemNotes: z.array(LineItemMatchNoteSchema),
  materiallySignificant: z.boolean(),
});
export type ComparisonExplanationResult = z.infer<
  typeof ComparisonExplanationResultSchema
>;
