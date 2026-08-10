"use client";

import { useCallback, useState } from "react";
import { postJson, ClientApiError } from "@/lib/api/client";
import type { ComplianceResponse } from "@/types/api";

export type ComplianceState = "idle" | "busy" | "success" | "error";

export function useCompliance() {
  const [state, setState] = useState<ComplianceState>("idle");
  const [result, setResult] = useState<ComplianceResponse | null>(null);
  const [error, setError] = useState<ClientApiError | null>(null);

  const evaluate = useCallback(async (documentText: string, rules: string[]) => {
    setState("busy");
    setError(null);
    try {
      const response = await postJson<ComplianceResponse>("/api/compliance", {
        document: { text: documentText },
        rules,
      });
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
  }, []);

  return { state, result, error, evaluate, reset };
}
