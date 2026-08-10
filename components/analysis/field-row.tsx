import { AlertTriangle } from "lucide-react";

interface FieldRowProps {
  label: string;
  value: string | number | null | undefined;
  formatter?: (value: string | number) => string;
}

/** Never renders a hallucinated value — null/undefined always shows "Not found" with a review flag (PRD §2.5, §78). */
export function FieldRow({ label, value, formatter }: FieldRowProps) {
  const isMissing = value === null || value === undefined || value === "";
  const displayValue = isMissing ? null : formatter ? formatter(value) : String(value);

  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      {isMissing ? (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-warning">
          <AlertTriangle className="size-3.5" aria-hidden="true" />
          Not found
        </span>
      ) : (
        <span className="text-right text-sm font-medium text-foreground">{displayValue}</span>
      )}
    </div>
  );
}
