import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title: string;
  description: string;
  onRetry?: () => void;
}

/** Standardized error UI — friendly title, plain-language explanation, retry action. Never exposes stack traces. */
export function ErrorState({ title, description, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" aria-hidden="true" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-bold text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          Try Again
        </Button>
      )}
    </div>
  );
}
