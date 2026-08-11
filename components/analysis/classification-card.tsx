import { ConfidenceBadge } from "@/components/common/confidence-badge";
import type { ClassificationResult } from "@/lib/ai/schemas/common";
import {
  FileText,
  ClipboardCheck,
  ScrollText,
  Landmark,
  Receipt,
  BarChart2,
  File,
} from "lucide-react";

const DOC_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  invoice:            { label: "Invoice",           icon: FileText },
  purchase_order:     { label: "Purchase Order",    icon: ClipboardCheck },
  contract:           { label: "Contract",          icon: ScrollText },
  regulatory_filing:  { label: "Regulatory Filing", icon: Landmark },
  receipt:            { label: "Receipt",           icon: Receipt },
  report:             { label: "Report",            icon: BarChart2 },
  other:              { label: "Other Document",    icon: File },
};

export function ClassificationCard({ classification }: { classification: ClassificationResult }) {
  const cfg = DOC_CONFIG[classification.documentType] ?? DOC_CONFIG.other;
  const Icon = cfg.icon;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card p-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center shadow-ai flex-shrink-0">
            <Icon className="size-5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Document Type
            </p>
            <p className="text-xl font-extrabold text-foreground leading-tight">
              {cfg.label}
            </p>
          </div>
        </div>
        <ConfidenceBadge confidence={classification.confidence} />
      </div>

      {/* Reason */}
      <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
        {classification.reason}
      </p>
    </div>
  );
}
