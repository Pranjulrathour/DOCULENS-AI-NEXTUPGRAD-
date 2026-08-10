import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfidenceBadge } from "@/components/common/confidence-badge";
import type { ClassificationResult } from "@/lib/ai/schemas/common";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  invoice: "Invoice",
  purchase_order: "Purchase Order",
  contract: "Contract",
  regulatory_filing: "Regulatory Filing",
  receipt: "Receipt",
  report: "Report",
  other: "Other Document",
};

export function ClassificationCard({ classification }: { classification: ClassificationResult }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">Document Type</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-xl font-semibold text-foreground">
            {DOCUMENT_TYPE_LABELS[classification.documentType] ?? classification.documentType}
          </p>
          <ConfidenceBadge confidence={classification.confidence} />
        </div>
        <p className="text-sm text-muted-foreground">{classification.reason}</p>
      </CardContent>
    </Card>
  );
}
