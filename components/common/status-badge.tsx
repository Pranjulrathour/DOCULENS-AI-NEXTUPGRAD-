import { Check, X, AlertTriangle, MinusCircle, CircleSlash } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ComparisonStatus } from "@/types/comparison";
import type { ComplianceStatus } from "@/types/compliance";

type Status = ComparisonStatus | ComplianceStatus | "pass" | "fail";

const STATUS_CONFIG: Record<
  Status,
  { label: string; icon: typeof Check; className: string }
> = {
  match: { label: "Match", icon: Check, className: "text-success bg-success/10" },
  pass: { label: "Pass", icon: Check, className: "text-success bg-success/10" },
  mismatch: { label: "Mismatch", icon: X, className: "text-destructive bg-destructive/10" },
  fail: { label: "Fail", icon: X, className: "text-destructive bg-destructive/10" },
  warning: { label: "Warning", icon: AlertTriangle, className: "text-warning bg-warning/10" },
  missing: { label: "Missing", icon: MinusCircle, className: "text-muted-foreground bg-muted" },
  not_applicable: { label: "N/A", icon: CircleSlash, className: "text-muted-foreground bg-muted" },
};

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

/**
 * Never relies on color alone to convey meaning (PRD §70) — every status
 * pairs a distinct icon with its label.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        config.className,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {config.label}
    </span>
  );
}
