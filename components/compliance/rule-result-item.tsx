"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { ConfidenceBadge } from "@/components/common/confidence-badge";
import { cn } from "@/lib/utils";
import type { ComplianceRuleResult } from "@/types/compliance";

export function RuleResultItem({ result }: { result: ComplianceRuleResult }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <StatusBadge status={result.status} />
          <span className="text-sm font-medium text-foreground">{result.rule}</span>
        </div>
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="space-y-2 border-t border-border px-4 py-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium text-foreground">Reason</span>
            <ConfidenceBadge confidence={result.confidence} />
          </div>
          <p className="text-muted-foreground">{result.reason}</p>
          {result.evidence && (
            <>
              <p className="font-medium text-foreground">Evidence</p>
              <p className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">{result.evidence}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
