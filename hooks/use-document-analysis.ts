"use client";

import { useCallback, useState } from "react";
import { postFormData, ClientApiError } from "@/lib/api/client";
import type { AnalyzeResponse } from "@/types/api";

export type AnalysisState = "idle" | "busy" | "success" | "error";

export function useDocumentAnalysis() {
  const [state, setState] = useState<AnalysisState>("idle");
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<ClientApiError | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const analyze = useCallback(async (file: File) => {
    setState("busy");
    setError(null);
    setFileName(file.name);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await postFormData<AnalyzeResponse>("/api/analyze", formData);
      setResult(response);
      setState("success");
    } catch (err) {
      setError(
        err instanceof ClientApiError
          ? err
          : new ClientApiError("UNKNOWN_ERROR", "Something went wrong. Please try again.", false),
      );
      setState("error");
    }
  }, []);

  const reset = useCallback(() => {
    setState("idle");
    setResult(null);
    setError(null);
    setFileName(null);
  }, []);

  return { state, result, error, fileName, analyze, reset };
}
