"use client";

import React from "react";
import { INBUILT_TOOLS, getInbuiltToolIcon } from "@/constants/inbuilt-tools";

type InbuiltToolsPanelProps = {
  endConversationEnabled: boolean;
  setEndConversationEnabled: (value: boolean) => void;
};

export function InbuiltToolsPanel({
  endConversationEnabled,
  setEndConversationEnabled,
}: InbuiltToolsPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-medium text-foreground">In-built tools</h3>
        <p className="text-base text-muted-foreground mt-0.5">
          Allow the agent to perform built-in actions.
        </p>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        {/* Active tools counter */}
        <div className="px-4 py-3 bg-muted/30 border-b border-border">
          <span className="text-base text-foreground">
            {endConversationEnabled ? "1 active tool" : "0 active tools"}
          </span>
        </div>

        {/* In-built tools list */}
        {INBUILT_TOOLS.map((tool) => (
          <div
            key={tool.id}
            className="px-4 py-3 flex items-center justify-between border-b border-border last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <svg
                className="w-5 h-5 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={getInbuiltToolIcon(tool.icon)}
                />
              </svg>
              <span className="text-base font-medium text-foreground">
                {tool.name}
              </span>
            </div>
            {/* Toggle Switch */}
            <button
              onClick={() => {
                if (tool.id === "end_call") {
                  setEndConversationEnabled(!endConversationEnabled);
                }
              }}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                tool.id === "end_call" && endConversationEnabled
                  ? "bg-foreground"
                  : "bg-muted"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-background transition-transform ${
                  tool.id === "end_call" && endConversationEnabled
                    ? "translate-x-5"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
