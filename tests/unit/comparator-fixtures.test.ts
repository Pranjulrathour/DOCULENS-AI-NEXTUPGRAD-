import { describe, expect, it } from "vitest";
import { compareInvoiceToPurchaseOrder } from "@/lib/comparison/comparator";
import { InvoiceExtractionV1Schema } from "@/lib/ai/schemas/invoice";
import { PurchaseOrderExtractionV1Schema } from "@/lib/ai/schemas/purchase-order";
import invoiceMatch from "../fixtures/invoice-match.json";
import invoiceMismatch from "../fixtures/invoice-mismatch.json";
import purchaseOrderFixture from "../fixtures/purchase-order.json";

describe("comparator against JSON fixtures (PRD §68-69)", () => {
  it("Invoice A vs PO A is a strong match", () => {
    const result = compareInvoiceToPurchaseOrder(
      InvoiceExtractionV1Schema.parse(invoiceMatch),
      PurchaseOrderExtractionV1Schema.parse(purchaseOrderFixture),
    );
    expect(result.status).toBe("strong_match");
  });

  it("Invoice B (qty 12) vs PO A (qty 10) surfaces a quantity mismatch", () => {
    const result = compareInvoiceToPurchaseOrder(
      InvoiceExtractionV1Schema.parse(invoiceMismatch),
      PurchaseOrderExtractionV1Schema.parse(purchaseOrderFixture),
    );
    expect(result.lineItemComparisons[0].quantity.status).toBe("mismatch");
    expect(result.status).not.toBe("strong_match");
  });
});
