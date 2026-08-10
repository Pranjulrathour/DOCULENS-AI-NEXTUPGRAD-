"use client";

import { useState } from "react";
import { RotateCcw, ArrowRightLeft } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Dropzone } from "@/components/upload/dropzone";
import { ProcessingStages } from "@/components/upload/processing-stages";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { MatchScore } from "@/components/comparison/match-score";
import { FieldComparisonTable } from "@/components/comparison/field-comparison-table";
import { LineItemComparisonTable } from "@/components/comparison/line-item-comparison-table";
import { AiExplanationCard } from "@/components/comparison/ai-explanation-card";
import { useComparison } from "@/hooks/use-comparison";

function SelectedFile({ file, onClear }: { file: File; onClear: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
      <span className="truncate text-sm font-medium text-foreground">{file.name}</span>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Change
      </Button>
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
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                Invoice <ArrowRightLeft className="size-5 text-muted-foreground" /> Purchase Order
              </h1>
              <p className="text-sm text-muted-foreground">Upload both documents to detect mismatches.</p>
            </div>
            {state === "success" && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="size-4" /> Compare Another
              </Button>
            )}
          </div>

          {state !== "success" && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Invoice</p>
                {invoice ? (
                  <SelectedFile file={invoice} onClear={() => setInvoice(null)} />
                ) : (
                  <Dropzone onFileSelected={setInvoice} disabled={state === "busy"} label="Drop your invoice" />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Purchase Order</p>
                {purchaseOrder ? (
                  <SelectedFile file={purchaseOrder} onClear={() => setPurchaseOrder(null)} />
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

          {state === "idle" && (
            <div className="mt-6 flex justify-end">
              <Button disabled={!bothSelected} onClick={handleCompare}>
                Compare Documents
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
            <div className="space-y-6">
              <div className="flex justify-center">
                <MatchScore score={result.score} status={result.status} />
              </div>
              <FieldComparisonTable fields={result.fieldComparisons} />
              <LineItemComparisonTable items={result.lineItemComparisons} />
              {result.aiExplanation && <AiExplanationCard explanation={result.aiExplanation} />}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
