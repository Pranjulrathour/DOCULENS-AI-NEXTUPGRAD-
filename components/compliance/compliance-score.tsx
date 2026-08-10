import { cn } from "@/lib/utils";
import type { ComplianceOverallStatus } from "@/types/compliance";

const STATUS_STYLES: Record<ComplianceOverallStatus, { label: string; className: string }> = {
  compliant: { label: "Compliant", className: "text-success" },
  needs_review: { label: "Needs Review", className: "text-warning" },
  non_compliant: { label: "Non-Compliant", className: "text-destructive" },
};

export function ComplianceScore({ score, status }: { score: number; status: ComplianceOverallStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <div className="flex flex-col items-center gap-1 py-4">
      <span className="text-4xl font-semibold text-foreground">{score}%</span>
      <p className={cn("text-sm font-semibold", style.className)}>{style.label}</p>
    </div>
  );
}
