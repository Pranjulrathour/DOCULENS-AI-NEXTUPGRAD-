"use client";

import { useCallback, useState } from "react";
import { postFormData, ClientApiError } from "@/lib/api/client";
import type { CompareResponse } from "@/types/api";

export type ComparisonState = "idle" | "busy" | "success" | "error";

export function useComparison() {
  const [state, setState] = useState<ComparisonState>("idle");
  const [result, setResult] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<ClientApiError | null>(null);

  const compare = useCallback(async (invoice: File, purchaseOrder: File) => {
    setState("busy");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("invoice", invoice);
      formData.append("purchaseOrder", purchaseOrder);
      const response = await postFormData<CompareResponse>("/api/compare", formData);
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

  return { state, result, error, compare, reset };
}
