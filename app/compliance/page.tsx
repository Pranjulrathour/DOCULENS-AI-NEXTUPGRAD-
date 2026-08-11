"use client";

import { useState } from "react";
import { RotateCcw, FileText, Play } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
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
    <AppShell>
      <div className="px-4 sm:px-6 py-7 max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">
              Compliance Review
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Upload a document, then check it against your own plain-English rules.
            </p>
          </div>
          {(analysis.state === "success" || compliance.state === "success") && (
            <Button variant="outline" size="sm" onClick={handleReset} className="flex-shrink-0">
              <RotateCcw className="size-3.5" />
              Start Over
            </Button>
          )}
        </div>

        {/* Step 1 — Document Upload */}
        {analysis.state === "idle" && <Dropzone onFileSelected={handleFileSelected} />}
        {analysis.state === "busy" && <ProcessingStages />}
        {analysis.state === "error" && (
          <ErrorState
            title="We couldn't read this document"
            description={analysis.error?.message ?? "Something went wrong."}
            onRetry={handleReset}
          />
        )}

        {/* Step 2 — Rules + Results */}
        {analysis.state === "success" && analysis.result && (
          <div className="space-y-5">
            {/* File info pill */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-card">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="size-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {analysis.fileName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {analysis.result.classification.documentType.replace(/_/g, " ")}
                </p>
              </div>
            </div>

            {/* Rules editor */}
            {compliance.state !== "success" && (
              <div className="rounded-2xl border border-border bg-card shadow-card p-5 space-y-3">
                <Label htmlFor="rules" className="text-sm font-semibold text-foreground">
                  Compliance Rules
                  <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                    — one per line
                  </span>
                </Label>
                <Textarea
                  id="rules"
                  value={rulesText}
                  onChange={(e) => setRulesText(e.target.value)}
                  rows={7}
                  disabled={compliance.state === "busy"}
                  placeholder="e.g. Payment terms must not exceed 30 days."
                  className="resize-none text-sm"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleRunCompliance}
                    disabled={compliance.state === "busy"}
                    className="gradient-brand border-0 text-white font-bold hover:opacity-90 shadow-ai"
                  >
                    <Play className="size-3.5" />
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
                <ComplianceScore
                  score={compliance.result.overallScore}
                  status={compliance.result.status}
                />
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
    </AppShell>
  );
}
