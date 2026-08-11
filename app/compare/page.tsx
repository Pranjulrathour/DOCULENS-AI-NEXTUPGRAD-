"use client";

import { useState } from "react";
import { RotateCcw, ArrowRightLeft, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Dropzone } from "@/components/upload/dropzone";
import { ProcessingStages } from "@/components/upload/processing-stages";
import { ErrorState } from "@/components/common/error-state";
import { FadeIn } from "@/components/common/fade-in";
import { Button } from "@/components/ui/button";
import { MatchScore } from "@/components/comparison/match-score";
import { FieldComparisonTable } from "@/components/comparison/field-comparison-table";
import { LineItemComparisonTable } from "@/components/comparison/line-item-comparison-table";
import { AiExplanationCard } from "@/components/comparison/ai-explanation-card";
import { useComparison } from "@/hooks/use-comparison";
import { FileText } from "lucide-react";

function FileChip({ file, onClear }: { file: File; onClear: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <FileText className="size-4 text-primary" />
      </div>
      <span className="truncate text-sm font-semibold text-foreground flex-1">{file.name}</span>
      <button
        onClick={onClear}
        className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
        aria-label="Remove file"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export default function ComparePage() {
  const { state, result, error, compare, reset } = useComparison();
  const [invoice, setInvoice] = useState<File | null>(null);
  const [purchaseOrder, setPurchaseOrder] = useState<File | null>(null);

  const bothSelected = invoice && purchaseOrder;

  const handleCompare = () => {
    if (invoice && purchaseOrder) void compare(invoice, purchaseOrder);
  };

  const handleReset = () => {
    setInvoice(null);
    setPurchaseOrder(null);
    reset();
  };

  return (
    <AppShell>
      <div className="px-4 sm:px-6 py-7 max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-extrabold text-foreground tracking-tight">
              Invoice
              <ArrowRightLeft className="size-5 text-muted-foreground" />
              Purchase Order
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Upload both documents to detect field-by-field mismatches.
            </p>
          </div>
          {state === "success" && (
            <Button variant="outline" size="sm" onClick={handleReset} className="flex-shrink-0">
              <RotateCcw className="size-3.5" />
              Compare Another
            </Button>
          )}
        </div>

        {/* Upload grid — shown until result */}
        {state !== "success" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Invoice</p>
              {invoice ? (
                <FileChip file={invoice} onClear={() => setInvoice(null)} />
              ) : (
                <Dropzone
                  onFileSelected={setInvoice}
                  disabled={state === "busy"}
                  label="Drop your invoice"
                />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">Purchase Order</p>
              {purchaseOrder ? (
                <FileChip file={purchaseOrder} onClear={() => setPurchaseOrder(null)} />
              ) : (
                <Dropzone
                  onFileSelected={setPurchaseOrder}
                  disabled={state === "busy"}
                  label="Drop your purchase order"
                />
              )}
            </div>
          </div>
        )}

        {/* Compare button */}
        {state === "idle" && (
          <div className="flex justify-end">
            <Button
              disabled={!bothSelected}
              onClick={handleCompare}
              className="gradient-brand border-0 text-white font-bold hover:opacity-90 shadow-ai"
            >
              Compare Documents
              <ArrowRightLeft className="size-4" />
            </Button>
          </div>
        )}

        {state === "busy" && <ProcessingStages />}

        {state === "error" && (
          <ErrorState
            title="Comparison couldn't be completed"
            description={error?.message ?? "Something went wrong."}
            onRetry={handleCompare}
          />
        )}

        {state === "success" && result && (
          <FadeIn className="space-y-5">
            {/* Score — large centered */}
            <div className="flex justify-center py-4">
              <MatchScore score={result.score} status={result.status} />
            </div>
            <FieldComparisonTable fields={result.fieldComparisons} />
            <LineItemComparisonTable items={result.lineItemComparisons} />
            {result.aiExplanation && <AiExplanationCard explanation={result.aiExplanation} />}
          </FadeIn>
        )}
      </div>
    </AppShell>
  );
}
