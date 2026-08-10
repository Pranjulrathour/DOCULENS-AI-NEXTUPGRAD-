import { z } from "zod";
import { ConfidenceSchema, NullableNumberSchema, NullableStringSchema } from "./common";
import { InvoiceLineItemSchema, PartySchema } from "./invoice";

export const PurchaseOrderExtractionV1Schema = z.object({
  documentType: z.literal("purchase_order"),
  confidence: ConfidenceSchema,

  poNumber: NullableStringSchema,
  poDate: NullableStringSchema,

  vendor: PartySchema,
  buyer: PartySchema,

  currency: NullableStringSchema,

  lineItems: z.array(InvoiceLineItemSchema),

  subtotal: NullableNumberSchema,
  taxAmount: NullableNumberSchema,
  totalAmount: NullableNumberSchema,

  deliveryDate: NullableStringSchema,
  paymentTerms: NullableStringSchema,

  missingFields: z.array(z.string()),
});
export type PurchaseOrderExtractionV1 = z.infer<typeof PurchaseOrderExtractionV1Schema>;
