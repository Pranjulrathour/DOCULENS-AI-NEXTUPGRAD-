import { z } from "zod";
import { ConfidenceSchema, NullableNumberSchema, NullableStringSchema } from "./common";

export const InvoiceLineItemSchema = z.object({
  description: NullableStringSchema,
  quantity: NullableNumberSchema,
  unitPrice: NullableNumberSchema,
  taxRate: NullableNumberSchema,
  taxAmount: NullableNumberSchema,
  total: NullableNumberSchema,
});
export type InvoiceLineItem = z.infer<typeof InvoiceLineItemSchema>;

export const PartySchema = z.object({
  name: NullableStringSchema,
  address: NullableStringSchema,
  taxId: NullableStringSchema,
  email: NullableStringSchema.optional(),
  phone: NullableStringSchema.optional(),
});
export type Party = z.infer<typeof PartySchema>;

export const InvoiceExtractionV1Schema = z.object({
  documentType: z.literal("invoice"),
  confidence: ConfidenceSchema,

  invoiceNumber: NullableStringSchema,
  invoiceDate: NullableStringSchema,
  dueDate: NullableStringSchema,

  vendor: PartySchema,
  buyer: PartySchema,

  purchaseOrderNumber: NullableStringSchema,
  currency: NullableStringSchema,

  lineItems: z.array(InvoiceLineItemSchema),

  subtotal: NullableNumberSchema,
  taxAmount: NullableNumberSchema,
  discount: NullableNumberSchema,
  totalAmount: NullableNumberSchema,

  paymentTerms: NullableStringSchema,
  bankDetails: NullableStringSchema,

  missingFields: z.array(z.string()),
});
export type InvoiceExtractionV1 = z.infer<typeof InvoiceExtractionV1Schema>;
