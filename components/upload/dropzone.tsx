"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = ".pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.txt";
const ACCEPTED_LABEL = "PDF · DOCX · XLSX · JPG · PNG · WEBP · TXT";

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
      tabIndex={disabled ? -1 : 0}
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
        "group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-8 py-14 text-center transition-all duration-200",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border bg-card hover:border-primary/40 hover:bg-primary/3",
        disabled && "cursor-not-allowed opacity-50 pointer-events-none",
      )}
    >
      {/* Animated upload icon */}
      <div
        className={cn(
          "relative flex size-16 items-center justify-center rounded-2xl transition-all duration-200",
          isDragging ? "gradient-brand shadow-ai scale-110" : "bg-muted group-hover:bg-primary/10"
        )}
      >
        {isDragging ? (
          <FileText className="size-8 text-white" aria-hidden="true" />
        ) : (
          <UploadCloud className={cn("size-8 transition-colors", "text-muted-foreground group-hover:text-primary")} aria-hidden="true" />
        )}
      </div>

      {/* Text */}
      <div className="space-y-1.5">
        <p className="text-base font-bold text-foreground">
          {isDragging ? "Release to upload" : label}
        </p>
        <p className="text-sm text-muted-foreground">
          or{" "}
          <span className="text-primary font-semibold underline decoration-dashed underline-offset-2">
            browse files
          </span>
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {ACCEPTED_LABEL}
        </p>
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
