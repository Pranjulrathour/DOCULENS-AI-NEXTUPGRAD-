import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FieldRow } from "./field-row";
import { LineItemsTable } from "./line-items-table";
import { formatCurrency } from "@/lib/utils/format";
import type { ExtractionUnion } from "@/types/analysis";
import type { InvoiceExtractionV1 } from "@/lib/ai/schemas/invoice";
import type { PurchaseOrderExtractionV1 } from "@/lib/ai/schemas/purchase-order";
import type { ContractExtractionV1 } from "@/lib/ai/schemas/contract";
import { CONTRACT_ANALYSIS_DISCLAIMER } from "@/lib/ai/schemas/contract";
import type { RegulatoryFilingExtractionV1 } from "@/lib/ai/schemas/regulatory-filing";

function InvoiceFields({ data }: { data: InvoiceExtractionV1 }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Invoice Information</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60">
          <FieldRow label="Vendor" value={data.vendor.name} />
          <FieldRow label="Invoice Number" value={data.invoiceNumber} />
          <FieldRow label="Invoice Date" value={data.invoiceDate} />
          <FieldRow label="Due Date" value={data.dueDate} />
          <FieldRow label="PO Number" value={data.purchaseOrderNumber} />
          <FieldRow label="Payment Terms" value={data.paymentTerms} />
          <Separator className="my-1" />
          <FieldRow label="Subtotal" value={data.subtotal} formatter={(v) => formatCurrency(Number(v), data.currency)} />
          <FieldRow label="Tax" value={data.taxAmount} formatter={(v) => formatCurrency(Number(v), data.currency)} />
          <FieldRow label="Total" value={data.totalAmount} formatter={(v) => formatCurrency(Number(v), data.currency)} />
        </CardContent>
      </Card>
      <LineItemsTable lineItems={data.lineItems} currency={data.currency} />
    </>
  );
}

function PurchaseOrderFields({ data }: { data: PurchaseOrderExtractionV1 }) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">Purchase Order Information</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60">
          <FieldRow label="Vendor" value={data.vendor.name} />
          <FieldRow label="PO Number" value={data.poNumber} />
          <FieldRow label="PO Date" value={data.poDate} />
          <FieldRow label="Delivery Date" value={data.deliveryDate} />
          <FieldRow label="Payment Terms" value={data.paymentTerms} />
          <Separator className="my-1" />
          <FieldRow label="Subtotal" value={data.subtotal} formatter={(v) => formatCurrency(Number(v), data.currency)} />
          <FieldRow label="Tax" value={data.taxAmount} formatter={(v) => formatCurrency(Number(v), data.currency)} />
          <FieldRow label="Total" value={data.totalAmount} formatter={(v) => formatCurrency(Number(v), data.currency)} />
        </CardContent>
      </Card>
      <LineItemsTable lineItems={data.lineItems} currency={data.currency} />
    </>
  );
}

function ContractFields({ data }: { data: ContractExtractionV1 }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">Contract Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">{CONTRACT_ANALYSIS_DISCLAIMER}</p>
        <div className="divide-y divide-border/60">
          <FieldRow label="Parties" value={data.parties.join(", ") || null} />
          <FieldRow label="Effective Date" value={data.effectiveDate} />
          <FieldRow label="Expiration Date" value={data.expirationDate} />
          <FieldRow label="Payment Terms" value={data.paymentTerms} />
          <FieldRow label="Termination Terms" value={data.terminationTerms} />
          <FieldRow label="Renewal Terms" value={data.renewalTerms} />
          <FieldRow label="Notice Period" value={data.noticePeriod} />
          <FieldRow label="Governing Law" value={data.governingLaw} />
          <FieldRow label="Dispute Resolution" value={data.disputeResolution} />
        </div>
        {data.riskIndicators.length > 0 && (
          <div>
            <p className="mb-1 text-sm font-medium text-foreground">Risk Indicators</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {data.riskIndicators.map((risk, i) => <li key={i}>{risk}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RegulatoryFields({ data }: { data: RegulatoryFilingExtractionV1 }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">Regulatory Filing Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="divide-y divide-border/60">
          <FieldRow label="Entity Name" value={data.entityName} />
          <FieldRow label="Filing Type" value={data.filingType} />
          <FieldRow label="Reporting Period" value={data.reportingPeriod} />
          <FieldRow label="Filing Date" value={data.filingDate} />
          <FieldRow label="Reference Numbers" value={data.referenceNumbers.join(", ") || null} />
        </div>
        {data.keyDisclosures.length > 0 && (
          <div>
            <p className="mb-1 text-sm font-medium text-foreground">Key Disclosures</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {data.keyDisclosures.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ExtractionSection({ extraction }: { extraction: ExtractionUnion }) {
  if (!extraction) return null;

  switch (extraction.documentType) {
    case "invoice":
      return <InvoiceFields data={extraction} />;
    case "purchase_order":
      return <PurchaseOrderFields data={extraction} />;
    case "contract":
      return <ContractFields data={extraction} />;
    case "regulatory_filing":
      return <RegulatoryFields data={extraction} />;
  }
}
