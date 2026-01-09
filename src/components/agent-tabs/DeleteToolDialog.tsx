"use client";

import React, { useState } from "react";

type ToolData = {
  uuid: string;
  name: string;
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
};

type DeleteToolDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  agentUuid: string;
  tool: ToolData | null;
  onToolDeleted: (toolUuid: string) => void;
};

export function DeleteToolDialog({
  isOpen,
  onClose,
  agentUuid,
  tool,
  onToolDeleted,
}: DeleteToolDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !tool) return null;

  const handleClose = () => {
    if (!isDeleting) {
      onClose();
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("BACKEND_URL environment variable is not set");
      }

      const response = await fetch(`${backendUrl}/agent-tools`, {
        method: "DELETE",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          agent_uuid: agentUuid,
          tool_uuid: tool.uuid,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove tool from agent");
      }

      onToolDeleted(tool.uuid);
      onClose();
    } catch (err) {
      console.error("Error removing tool from agent:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background border border-border rounded-xl w-full max-w-md p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Remove tool
        </h2>
        <p className="text-base text-muted-foreground mb-6">
          Are you sure you want to remove this tool from this agent?
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isDeleting}
            className="h-10 px-4 rounded-md text-sm font-medium border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="h-10 px-4 rounded-md text-sm font-medium bg-red-800 text-white hover:bg-red-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isDeleting && (
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {isDeleting ? "Removing..." : "Remove"}
          </button>
        </div>
      </div>

      {/* Backdrop click to close */}
      <div className="absolute inset-0 -z-10" onClick={handleClose} />
    </div>
  );
}
