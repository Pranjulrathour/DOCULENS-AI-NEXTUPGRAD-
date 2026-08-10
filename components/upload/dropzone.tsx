"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = ".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.txt";
const ACCEPTED_LABEL = "PDF, DOCX, XLSX, JPG, PNG, WEBP, TXT";

interface DropzoneProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
  label?: string;
}

export function Dropzone({ onFileSelected, disabled, label = "Drop your document here" }: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = event.dataTransfer.files?.[0];
      if (file) onFileSelected(file);
    },
    [disabled, onFileSelected],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => !disabled && inputRef.current?.click()}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-16 text-center transition-colors",
        isDragging ? "border-primary bg-accent" : "border-border bg-card hover:border-primary/50",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <div className="flex size-14 items-center justify-center rounded-full bg-accent">
        {isDragging ? (
          <FileText className="size-7 text-primary" aria-hidden="true" />
        ) : (
          <UploadCloud className="size-7 text-primary" aria-hidden="true" />
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">or browse files — {ACCEPTED_LABEL}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_EXTENSIONS}
        className="sr-only"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
