import { describe, expect, it } from "vitest";
import { evaluateRuleDeterministically, parseRulesFromText } from "@/lib/compliance/rules";

describe("parseRulesFromText", () => {
  it("splits numbered lines into individual rules, stripping the numbering", () => {
    const rules = parseRulesFromText(`1. Payment terms must not exceed 30 days.
2. Invoice must contain GST number.

3. Vendor name must match PO.`);

    expect(rules).toHaveLength(3);
    expect(rules[0].text).toBe("Payment terms must not exceed 30 days.");
    expect(rules[1].text).toBe("Invoice must contain GST number.");
  });

  it("drops blank lines", () => {
    expect(parseRulesFromText("Rule one.\n\n\nRule two.")).toHaveLength(2);
  });
});

describe("evaluateRuleDeterministically", () => {
  it("fails a payment-terms day-limit rule when the document exceeds the limit", () => {
    const result = evaluateRuleDeterministically(
      { id: "1", text: "Payment terms must not exceed 30 days." },
      "Payment Terms: Net 60",
    );
    expect(result?.status).toBe("fail");
    expect(result?.confidence).toBe(1);
  });

  it("passes a payment-terms day-limit rule when within the limit", () => {
    const result = evaluateRuleDeterministically(
      { id: "1", text: "Payment terms must not exceed 30 days." },
      "Payment Terms: Net 15",
    );
    expect(result?.status).toBe("pass");
  });

  it("defers to AI when no 'Net N' pattern exists for a day-limit rule", () => {
    const result = evaluateRuleDeterministically(
      { id: "1", text: "Payment terms must not exceed 30 days." },
      "Payment is due upon receipt.",
    );
    expect(result).toBeNull();
  });

  it("checks the object of 'must contain', not the subject", () => {
    const pass = evaluateRuleDeterministically(
      { id: "1", text: "Invoice must contain a GST number." },
      "This invoice includes GST number 29ABCDE1234F1Z5.",
    );
    expect(pass?.status).toBe("pass");

    const fail = evaluateRuleDeterministically(
      { id: "1", text: "Invoice must contain a GST number." },
      "This invoice has no tax details.",
    );
    expect(fail?.status).toBe("fail");
  });

  it("requires every keyword in a multi-word field phrase, not just any one", () => {
    // Document contains "number" (from "invoice number") but not "purchase order" —
    // a naive substring-match on any single keyword would wrongly pass this.
    const result = evaluateRuleDeterministically(
      { id: "1", text: "Purchase order number must be present." },
      "Invoice Number: INV-1001",
    );
    expect(result?.status).toBe("fail");
  });

  it("passes a subject-must-be-present rule when the phrase is fully present", () => {
    const result = evaluateRuleDeterministically(
      { id: "1", text: "Purchase order number must be present." },
      "Purchase Order Number: PO-5001",
    );
    expect(result?.status).toBe("pass");
  });

  it("returns null for rules requiring semantic judgment", () => {
    const result = evaluateRuleDeterministically(
      { id: "1", text: "The termination clause must be reasonable." },
      "Either party may terminate with 90 days notice.",
    );
    expect(result).toBeNull();
  });
});
