"use client";

import React from "react";

type SettingsTabContentProps = {
  agentSpeaksFirst: boolean;
  setAgentSpeaksFirst: (value: boolean) => void;
};

export function SettingsTabContent({
  agentSpeaksFirst,
  setAgentSpeaksFirst,
}: SettingsTabContentProps) {
  return (
    <div className="space-y-6">
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Toggle Switch */}
            <button
              onClick={() => setAgentSpeaksFirst(!agentSpeaksFirst)}
              className={`relative w-12 h-7 rounded-full transition-colors cursor-pointer border-2 ${
                agentSpeaksFirst
                  ? "bg-green-500 border-green-500"
                  : "bg-muted border-muted-foreground/30"
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  agentSpeaksFirst ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <div>
              <h3 className="text-base font-medium text-foreground">
                Agent speaks first
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Whether the agent should initiate the conversation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
