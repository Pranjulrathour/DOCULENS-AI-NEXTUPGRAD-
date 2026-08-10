"use client";

import { useState } from "react";
import { FileSearch, RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
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
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Analyze a Document</h1>
              <p className="text-sm text-muted-foreground">
                Upload an invoice, purchase order, contract, or regulatory filing.
              </p>
            </div>
            {state === "success" && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="size-4" /> Analyze Another
              </Button>
            )}
          </div>

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
            <FadeIn className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="lg:h-[calc(100vh-220px)]">
                <DocumentPreview file={file} extractedText={result.documentText} />
              </div>
              <div className="space-y-6">
                <ClassificationCard classification={result.classification} />
                <SummaryCard bullets={result.summary.bullets} />
                {result.extraction ? (
                  <ExtractionSection extraction={result.extraction} />
                ) : (
                  <EmptyState
                    icon={FileSearch}
                    title="No structured extraction for this document type"
                    description="Structured field extraction is available for invoices, purchase orders, contracts, and regulatory filings."
                  />
                )}
                <IssuesSection issues={result.issues} />
              </div>
            </FadeIn>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
