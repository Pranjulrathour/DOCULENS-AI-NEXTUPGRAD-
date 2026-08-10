import { z } from "zod";
import { ConfidenceSchema, NullableStringSchema } from "./common";

export const RegulatoryFilingExtractionV1Schema = z.object({
  documentType: z.literal("regulatory_filing"),
  confidence: ConfidenceSchema,

  entityName: NullableStringSchema,
  filingType: NullableStringSchema,
  reportingPeriod: NullableStringSchema,
  filingDate: NullableStringSchema,
  referenceNumbers: z.array(z.string()),
  importantAmounts: z.array(
    z.object({ label: z.string(), value: z.union([z.number(), z.string()]) }),
  ),
  keyDisclosures: z.array(z.string()),
  exceptions: z.array(z.string()),
  deadlines: z.array(z.string()),
  complianceIndicators: z.array(z.string()),

  missingFields: z.array(z.string()),
});
export type RegulatoryFilingExtractionV1 = z.infer<
  typeof RegulatoryFilingExtractionV1Schema
>;
