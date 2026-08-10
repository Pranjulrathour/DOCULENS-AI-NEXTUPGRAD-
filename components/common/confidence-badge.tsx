import { cn } from "@/lib/utils";

interface ConfidenceBadgeProps {
  confidence: number;
  className?: string;
}

/** Heuristic UI buckets only — never implies calibrated accuracy (PRD §77). */
function confidenceTier(confidence: number): { label: string; className: string } {
  if (confidence >= 0.9) {
    return { label: "High", className: "bg-success/10 text-success" };
  }
  if (confidence >= 0.75) {
    return { label: "Medium", className: "bg-warning/10 text-warning" };
  }
  return { label: "Low", className: "bg-destructive/10 text-destructive" };
}

export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const tier = confidenceTier(confidence);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        tier.className,
        className,
      )}
      title="AI confidence — a heuristic indicator, not a calibrated accuracy score"
    >
      {Math.round(confidence * 100)}% AI confidence · {tier.label}
    </span>
  );
}
