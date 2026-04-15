"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiGet } from "@/lib/api";
import { useAccessToken } from "./useAccessToken";

type MaxRowsResponse = {
  max_rows_per_eval: number;
};

/**
 * Fetches the user-specific max rows per eval from the backend.
 * Returns null while loading or if the request fails (shows a toast error on failure).
 */
export function useMaxRowsPerEval(): number | null {
  const accessToken = useAccessToken();
  const [maxRows, setMaxRows] = useState<number | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    apiGet<MaxRowsResponse>("/user-limits/me/max-rows-per-eval", accessToken)
      .then((data) => {
        if (!cancelled && data.max_rows_per_eval) {
          setMaxRows(data.max_rows_per_eval);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error("Failed to load usage limits. Please refresh and try again.");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return maxRows;
}
