"use client";

import { useState } from "react";
import { FileSearch, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Dropzone } from "@/components/upload/dropzone";
import { ProcessingStages } from "@/components/upload/processing-stages";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { FadeIn } from "@/components/common/fade-in";
import { DocumentPreview } from "@/components/document-viewer/document-preview";
import { ClassificationCard } from "@/components/analysis/classification-card";
import { SummaryCard } from "@/components/analysis/summary-card";
import { ExtractionSection } from "@/components/analysis/extraction-section";
import { IssuesSection } from "@/components/analysis/issues-section";
import { Button } from "@/components/ui/button";
import { useDocumentAnalysis } from "@/hooks/use-document-analysis";

export default function AnalyzePage() {
  const { state, result, error, analyze, reset } = useDocumentAnalysis();
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelected = (selected: File) => {
    setFile(selected);
    void analyze(selected);
  };

  const handleReset = () => {
    setFile(null);
    reset();
  };

  return (
    <AppShell>
      <div className="px-4 sm:px-6 py-7 max-w-6xl mx-auto">
        {/* Page header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Analyze a Document
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Upload an invoice, purchase order, contract, or regulatory filing.
            </p>
          </div>
          {state === "success" && (
            <Button variant="outline" size="sm" onClick={handleReset} className="flex-shrink-0">
              <RotateCcw className="size-3.5" />
              Analyze Another
            </Button>
          )}
        </div>

        {/* States */}
        {state === "idle" && <Dropzone onFileSelected={handleFileSelected} />}

        {state === "busy" && <ProcessingStages />}

        {state === "error" && (
          <ErrorState
            title="Analysis couldn't be completed"
            description={error?.message ?? "Something went wrong."}
            onRetry={file ? () => void analyze(file) : undefined}
          />
        )}

        {state === "success" && result && file && (
          <FadeIn className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Left — document preview */}
            <div className="lg:h-[calc(100vh-180px)] lg:sticky lg:top-7">
              <DocumentPreview file={file} extractedText={result.documentText} />
            </div>

            {/* Right — extraction results */}
            <div className="space-y-4">
              <ClassificationCard classification={result.classification} />
              <SummaryCard bullets={result.summary.bullets} />
              {result.extraction ? (
                <ExtractionSection extraction={result.extraction} />
              ) : (
                <EmptyState
                  icon={FileSearch}
                  title="No structured extraction for this type"
                  description="Structured field extraction is available for invoices, purchase orders, contracts, and regulatory filings."
                />
              )}
              <IssuesSection issues={result.issues} />
            </div>
          </FadeIn>
        )}
      </div>
    </AppShell>
  );
}
