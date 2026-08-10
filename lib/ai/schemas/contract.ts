import { z } from "zod";
import { ConfidenceSchema, NullableStringSchema } from "./common";

export const ContractExtractionV1Schema = z.object({
  documentType: z.literal("contract"),
  confidence: ConfidenceSchema,

  parties: z.array(z.string()),
  effectiveDate: NullableStringSchema,
  expirationDate: NullableStringSchema,
  paymentTerms: NullableStringSchema,
  terminationTerms: NullableStringSchema,
  renewalTerms: NullableStringSchema,
  noticePeriod: NullableStringSchema,
  liabilityClauses: NullableStringSchema,
  confidentiality: NullableStringSchema,
  governingLaw: NullableStringSchema,
  disputeResolution: NullableStringSchema,
  keyObligations: z.array(z.string()),
  riskIndicators: z.array(z.string()),

  missingFields: z.array(z.string()),
});
export type ContractExtractionV1 = z.infer<typeof ContractExtractionV1Schema>;

/** Every UI surface rendering contract analysis must display this alongside it — see PRD §22. */
export const CONTRACT_ANALYSIS_DISCLAIMER =
  "AI-generated contract analysis is for informational review and does not constitute legal advice.";
