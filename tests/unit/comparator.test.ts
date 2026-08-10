import { describe, expect, it } from "vitest";
import { compareInvoiceToPurchaseOrder } from "@/lib/comparison/comparator";
import { makeInvoice, makePurchaseOrder } from "../fixtures/factories";

describe("compareInvoiceToPurchaseOrder", () => {
  it("scores a fully matching invoice/PO pair as a strong match (PRD §69 Invoice A / PO A)", () => {
    const result = compareInvoiceToPurchaseOrder(makeInvoice(), makePurchaseOrder());

    expect(result.status).toBe("strong_match");
    expect(result.score).toBe(100);
    expect(result.fieldComparisons.every((f) => f.status === "match")).toBe(true);
  });

  it("flags a quantity mismatch (PRD §69 Invoice B: invoice qty 12 vs PO qty 10)", () => {
    const invoice = makeInvoice({
      lineItems: [
        { description: "Laptop Stand", quantity: 12, unitPrice: 5000, taxRate: 18, taxAmount: 9000, total: 70800 },
      ],
      subtotal: 60000,
      taxAmount: 10800,
      totalAmount: 70800,
    });
    const po = makePurchaseOrder();

    const result = compareInvoiceToPurchaseOrder(invoice, po);

    const quantityComparison = result.lineItemComparisons[0].quantity;
    expect(quantityComparison.status).toBe("mismatch");
    expect(quantityComparison.invoiceValue).toBe(12);
    expect(quantityComparison.poValue).toBe(10);
    expect(result.status).not.toBe("strong_match");
  });

  it("treats near-identical vendor names as a match after normalization", () => {
    const invoice = makeInvoice({ vendor: { name: "ABC Technologies Pvt. Ltd.", address: null, taxId: null, email: null, phone: null } });
    const po = makePurchaseOrder({ vendor: { name: "abc technologies pvt ltd", address: null, taxId: null } });

    const result = compareInvoiceToPurchaseOrder(invoice, po);
    const vendorField = result.fieldComparisons.find((f) => f.field === "vendor");
    expect(vendorField?.status).toBe("match");
  });

  it("never coerces materially different vendors into a match", () => {
    const invoice = makeInvoice({ vendor: { name: "ABC Technologies", address: null, taxId: null, email: null, phone: null } });
    const po = makePurchaseOrder({ vendor: { name: "Global Industrial Supplies", address: null, taxId: null } });

    const result = compareInvoiceToPurchaseOrder(invoice, po);
    const vendorField = result.fieldComparisons.find((f) => f.field === "vendor");
    expect(vendorField?.status).toBe("mismatch");
  });

  it("marks a field as missing rather than mismatched when either side is null", () => {
    const invoice = makeInvoice({ purchaseOrderNumber: null });
    const po = makePurchaseOrder();

    const result = compareInvoiceToPurchaseOrder(invoice, po);
    const poNumberField = result.fieldComparisons.find((f) => f.field === "poNumber");
    expect(poNumberField?.status).toBe("missing");
  });

  it("computes variance percent using deterministic math, not AI", () => {
    const invoice = makeInvoice({ totalAmount: 59000 });
    const po = makePurchaseOrder({ totalAmount: 50000 });

    const result = compareInvoiceToPurchaseOrder(invoice, po);
    const totalField = result.fieldComparisons.find((f) => f.field === "totalAmount");
    expect(totalField?.difference).toBe(9000);
    expect(totalField?.variancePercent).toBeCloseTo(18, 5);
    expect(totalField?.status).toBe("mismatch");
  });
});
