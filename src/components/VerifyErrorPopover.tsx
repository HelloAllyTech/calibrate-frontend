"use client";

import React from "react";
import { CloseIcon } from "@/components/icons";

type VerifyErrorPopoverProps = {
  error: string | null;
  sampleResponse: Record<string, unknown> | null;
  onDismiss: () => void;
};

export function VerifyErrorPopover({
  error,
  sampleResponse,
  onDismiss,
}: VerifyErrorPopoverProps) {
  if (!error && !sampleResponse) return null;

  return (
    <>
      <div className="fixed inset-0 z-[99]" onClick={onDismiss} />
      <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border rounded-xl shadow-xl z-[100] overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-border">
          <span className="text-sm font-medium text-red-400">
            Verification Failed
          </span>
          <button
            onClick={onDismiss}
            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer"
          >
            <CloseIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-3 space-y-2">
          {error && <p className="text-xs text-red-400">{error}</p>}
          {sampleResponse && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Your agent responded with:
              </p>
              <pre className="text-xs bg-muted rounded-lg p-2 overflow-x-auto text-foreground max-h-32 overflow-y-auto">
                {JSON.stringify(sampleResponse, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
