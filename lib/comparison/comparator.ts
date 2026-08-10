import type { InvoiceExtractionV1, InvoiceLineItem } from "@/lib/ai/schemas/invoice";
import type { PurchaseOrderExtractionV1 } from "@/lib/ai/schemas/purchase-order";
import type {
  ComparisonResult,
  FieldComparison,
  LineItemComparison,
  ComparisonStatus,
} from "@/types/comparison";
import { getConfig } from "@/lib/config";
import {
  normalizeString,
  numericDifference,
  stringSimilarity,
  variancePercent,
  STRING_MATCH_THRESHOLD,
} from "./normalization";
import { computeMatchScore, scoreToOverallStatus, overallStatusLabel } from "./scoring";
import type { MatchWeightKey } from "./types";

function compareStringField(
  field: string,
  label: string,
  invoiceValue: string | null | undefined,
  poValue: string | null | undefined,
): FieldComparison {
  const iv = invoiceValue ?? null;
  const pv = poValue ?? null;

  if (!iv || !pv) {
    return { field, label, invoiceValue: iv, poValue: pv, status: "missing" };
  }

  const similarity = stringSimilarity(iv, pv);
  const status: ComparisonStatus =
    similarity === 1 ? "match" : similarity >= STRING_MATCH_THRESHOLD ? "warning" : "mismatch";

  return { field, label, invoiceValue: iv, poValue: pv, status };
}

function compareNumericField(
  field: string,
  label: string,
  invoiceValue: number | null | undefined,
  poValue: number | null | undefined,
  tolerancePercent: number,
): FieldComparison {
  const iv = invoiceValue ?? null;
  const pv = poValue ?? null;

  if (iv === null || pv === null) {
    return { field, label, invoiceValue: iv, poValue: pv, status: "missing" };
  }

  const difference = numericDifference(iv, pv) ?? 0;
  const variance = variancePercent(iv, pv) ?? 0;
  const status: ComparisonStatus = variance <= tolerancePercent ? "match" : "mismatch";

  return { field, label, invoiceValue: iv, poValue: pv, status, difference, variancePercent: variance };
}

function pairLineItems(
  invoiceItems: InvoiceLineItem[],
  poItems: InvoiceLineItem[],
): Array<[InvoiceLineItem | null, InvoiceLineItem | null]> {
  const remainingPo = [...poItems];
  const pairs: Array<[InvoiceLineItem | null, InvoiceLineItem | null]> = [];

  for (const invoiceItem of invoiceItems) {
    let bestIndex = -1;
    let bestScore = 0;
    remainingPo.forEach((poItem, index) => {
      const score = stringSimilarity(invoiceItem.description, poItem.description);
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });

    if (bestIndex !== -1 && bestScore >= STRING_MATCH_THRESHOLD) {
      pairs.push([invoiceItem, remainingPo[bestIndex]]);
      remainingPo.splice(bestIndex, 1);
    } else {
      pairs.push([invoiceItem, null]);
    }
  }

  for (const leftoverPoItem of remainingPo) {
    pairs.push([null, leftoverPoItem]);
  }

  return pairs;
}

function compareLineItems(
  invoiceItems: InvoiceLineItem[],
  poItems: InvoiceLineItem[],
  amountTolerance: number,
  quantityTolerance: number,
): LineItemComparison[] {
  return pairLineItems(invoiceItems, poItems).map(([invoiceItem, poItem]) => ({
    invoiceDescription: invoiceItem?.description ?? null,
    poDescription: poItem?.description ?? null,
    quantity: compareNumericField("quantity", "Quantity", invoiceItem?.quantity, poItem?.quantity, quantityTolerance),
    unitPrice: compareNumericField("unitPrice", "Unit Price", invoiceItem?.unitPrice, poItem?.unitPrice, amountTolerance),
    taxRate: compareNumericField("taxRate", "Tax Rate", invoiceItem?.taxRate, poItem?.taxRate, amountTolerance),
    total: compareNumericField("total", "Line Total", invoiceItem?.total, poItem?.total, amountTolerance),
  }));
}

function aggregateLineItemStatus(lineItems: LineItemComparison[], field: "quantity" | "unitPrice" | "taxRate" | "total"): ComparisonStatus {
  if (lineItems.length === 0) return "not_applicable";
  const statuses = lineItems.map((item) => item[field].status);
  if (statuses.every((s) => s === "match" || s === "not_applicable")) return "match";
  if (statuses.some((s) => s === "mismatch")) return "mismatch";
  if (statuses.some((s) => s === "missing")) return "missing";
  return "warning";
}

function buildSummary(overall: ComparisonOverallStatusLike, mismatchedFields: string[]): string[] {
  const bullets: string[] = [`Match score: ${overallStatusLabel(overall.status)} (${overall.score}%).`];
  if (mismatchedFields.length === 0) {
    bullets.push("All compared fields are consistent between invoice and purchase order.");
  } else {
    bullets.push(`Discrepancies found in: ${mismatchedFields.join(", ")}.`);
  }
  return bullets;
}

type ComparisonOverallStatusLike = { status: ReturnType<typeof scoreToOverallStatus>; score: number };

export function compareInvoiceToPurchaseOrder(
  invoice: InvoiceExtractionV1,
  po: PurchaseOrderExtractionV1,
): ComparisonResult {
  const config = getConfig();
  const amountTolerance = config.AMOUNT_TOLERANCE_PERCENT;
  const quantityTolerance = config.QUANTITY_TOLERANCE;

  const vendorComparison = compareStringField("vendor", "Vendor", invoice.vendor.name, po.vendor.name);
  const poNumberComparison = compareStringField(
    "poNumber",
    "PO Number",
    invoice.purchaseOrderNumber,
    po.poNumber,
  );
  const totalComparison = compareNumericField(
    "totalAmount",
    "Total",
    invoice.totalAmount,
    po.totalAmount,
    amountTolerance,
  );
  const taxComparison = compareNumericField(
    "taxAmount",
    "Tax",
    invoice.taxAmount,
    po.taxAmount,
    amountTolerance,
  );

  const lineItemComparisons = compareLineItems(
    invoice.lineItems,
    po.lineItems,
    amountTolerance,
    quantityTolerance,
  );

  const statusByWeightKey: Record<MatchWeightKey, ComparisonStatus> = {
    vendor: vendorComparison.status,
    poNumber: poNumberComparison.status,
    lineItems: lineItemComparisons.length > 0
      ? aggregateLineItemStatus(lineItemComparisons, "total")
      : "not_applicable",
    quantity: aggregateLineItemStatus(lineItemComparisons, "quantity"),
    unitPrice: aggregateLineItemStatus(lineItemComparisons, "unitPrice"),
    tax: taxComparison.status,
    total: totalComparison.status,
  };

  const score = computeMatchScore(statusByWeightKey);
  const status = scoreToOverallStatus(score);

  const fieldComparisons = [vendorComparison, poNumberComparison, taxComparison, totalComparison];
  const mismatchedFields = fieldComparisons
    .filter((f) => f.status === "mismatch" || f.status === "warning")
    .map((f) => f.label);

  return {
    score,
    status,
    fieldComparisons,
    lineItemComparisons,
    summary: buildSummary({ status, score }, mismatchedFields),
  };
}

export { normalizeString };
