"use client";

import { useEffect, useMemo } from "react";
import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentPreviewProps {
  file: File;
  extractedText?: string;
}

/**
 * Lightweight preview per PRD §74: native rendering for PDF/image via an
 * object URL (no client-side PDF.js needed just to view), extracted-text
 * fallback for DOCX/XLSX/TXT rather than building a full Office viewer.
 */
export function DocumentPreview({ file, extractedText }: DocumentPreviewProps) {
  const objectUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => {
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const kind = useMemo(() => {
    if (file.type === "application/pdf") return "pdf";
    if (file.type.startsWith("image/")) return "image";
    return "text";
  }, [file.type]);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
        <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
      </div>
      <div className="flex-1 overflow-hidden bg-muted/30">
        {kind === "pdf" && (
          <iframe title={file.name} src={objectUrl} className="h-full w-full border-0" />
        )}
        {kind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={objectUrl}
            alt={`Preview of ${file.name}`}
            className="h-full w-full object-contain"
          />
        )}
        {kind === "text" && (
          <ScrollArea className="h-full">
            <pre className="whitespace-pre-wrap p-4 text-xs text-foreground">
              {extractedText || "No preview available for this file type."}
            </pre>
          </ScrollArea>
        )}
      </div>
    </div>
  );
}
