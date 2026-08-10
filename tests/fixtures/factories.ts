import type { InvoiceExtractionV1 } from "@/lib/ai/schemas/invoice";
import type { PurchaseOrderExtractionV1 } from "@/lib/ai/schemas/purchase-order";

export function makeInvoice(overrides: Partial<InvoiceExtractionV1> = {}): InvoiceExtractionV1 {
  return {
    documentType: "invoice",
    confidence: 0.95,
    invoiceNumber: "INV-1001",
    invoiceDate: "2026-08-01",
    dueDate: "2026-08-31",
    vendor: { name: "ABC Technologies Pvt Ltd", address: null, taxId: null, email: null, phone: null },
    buyer: { name: "XYZ Corp", address: null, taxId: null },
    purchaseOrderNumber: "PO-5001",
    currency: "INR",
    lineItems: [
      { description: "Laptop Stand", quantity: 10, unitPrice: 5000, taxRate: 18, taxAmount: 9000, total: 59000 },
    ],
    subtotal: 50000,
    taxAmount: 9000,
    discount: null,
    totalAmount: 59000,
    paymentTerms: "Net 30",
    bankDetails: null,
    missingFields: [],
    ...overrides,
  };
}

export function makePurchaseOrder(
  overrides: Partial<PurchaseOrderExtractionV1> = {},
): PurchaseOrderExtractionV1 {
  return {
    documentType: "purchase_order",
    confidence: 0.95,
    poNumber: "PO-5001",
    poDate: "2026-07-25",
    vendor: { name: "ABC Technologies Pvt Ltd", address: null, taxId: null },
    buyer: { name: "XYZ Corp", address: null, taxId: null },
    currency: "INR",
    lineItems: [
      { description: "Laptop Stand", quantity: 10, unitPrice: 5000, taxRate: 18, taxAmount: 9000, total: 59000 },
    ],
    subtotal: 50000,
    taxAmount: 9000,
    totalAmount: 59000,
    deliveryDate: "2026-08-10",
    paymentTerms: "Net 30",
    missingFields: [],
    ...overrides,
  };
}
