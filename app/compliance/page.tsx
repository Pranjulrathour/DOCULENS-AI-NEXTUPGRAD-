"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { Dropzone } from "@/components/upload/dropzone";
import { ProcessingStages } from "@/components/upload/processing-stages";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FadeIn } from "@/components/common/fade-in";
import { ComplianceScore } from "@/components/compliance/compliance-score";
import { RuleResultItem } from "@/components/compliance/rule-result-item";
import { useDocumentAnalysis } from "@/hooks/use-document-analysis";
import { useCompliance } from "@/hooks/use-compliance";

const DEFAULT_RULES = `Payment terms must not exceed 30 days.
Invoice must contain a GST number.
Purchase order number must be present.`;

export default function CompliancePage() {
  const analysis = useDocumentAnalysis();
  const compliance = useCompliance();
  const [rulesText, setRulesText] = useState(DEFAULT_RULES);

  const handleFileSelected = (file: File) => {
    void analysis.analyze(file);
  };

  const handleRunCompliance = () => {
    if (!analysis.result) return;
    const rules = rulesText.split("\n").map((r) => r.trim()).filter(Boolean);
    void compliance.evaluate(analysis.result.documentText, rules);
  };

  const handleReset = () => {
    analysis.reset();
    compliance.reset();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Compliance Review</h1>
              <p className="text-sm text-muted-foreground">
                Upload a document, then check it against your own rules.
              </p>
            </div>
            {(analysis.state === "success" || compliance.state === "success") && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="size-4" /> Start Over
              </Button>
            )}
          </div>

          {analysis.state === "idle" && <Dropzone onFileSelected={handleFileSelected} />}
          {analysis.state === "busy" && <ProcessingStages />}
          {analysis.state === "error" && (
            <ErrorState
              title="We couldn't read this document"
              description={analysis.error?.message ?? "Something went wrong."}
              onRetry={handleReset}
            />
          )}

          {analysis.state === "success" && analysis.result && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm">
                <span className="font-medium text-foreground">{analysis.fileName}</span>
                <span className="ml-2 text-muted-foreground">
                  · {analysis.result.classification.documentType.replace("_", " ")}
                </span>
              </div>

              {compliance.state !== "success" && (
                <div className="space-y-3">
                  <Label htmlFor="rules">Compliance Rules (one per line)</Label>
                  <Textarea
                    id="rules"
                    value={rulesText}
                    onChange={(e) => setRulesText(e.target.value)}
                    rows={6}
                    disabled={compliance.state === "busy"}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleRunCompliance} disabled={compliance.state === "busy"}>
                      Run Compliance Review
                    </Button>
                  </div>
                </div>
              )}

              {compliance.state === "busy" && <ProcessingStages />}

              {compliance.state === "error" && (
                <ErrorState
                  title="Compliance evaluation failed"
                  description={compliance.error?.message ?? "Something went wrong."}
                  onRetry={handleRunCompliance}
                />
              )}

              {compliance.state === "success" && compliance.result && (
                <FadeIn className="space-y-4">
                  <ComplianceScore score={compliance.result.overallScore} status={compliance.result.status} />
                  <div className="space-y-2">
                    {compliance.result.results.map((result, index) => (
                      <RuleResultItem key={index} result={result} />
                    ))}
                  </div>
                </FadeIn>
              )}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
