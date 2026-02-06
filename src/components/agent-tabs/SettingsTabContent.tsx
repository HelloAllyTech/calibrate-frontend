"use client";

import React from "react";

type SettingsTabContentProps = {
  agentSpeaksFirst: boolean;
  setAgentSpeaksFirst: (value: boolean) => void;
  maxAssistantTurns: number;
  setMaxAssistantTurns: (value: number) => void;
};

export function SettingsTabContent({
  agentSpeaksFirst,
  setAgentSpeaksFirst,
  maxAssistantTurns,
  setMaxAssistantTurns,
}: SettingsTabContentProps) {
  return (
    <div className="space-y-4 md:space-y-6">
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-3 md:px-4 py-3 md:py-4 flex items-start md:items-center justify-between gap-3">
          <div className="flex flex-col-reverse md:flex-row items-start md:items-center gap-2 md:gap-4">
            {/* Toggle Switch */}
            <button
              onClick={() => setAgentSpeaksFirst(!agentSpeaksFirst)}
              className={`relative w-11 md:w-12 h-6 md:h-7 rounded-full transition-colors cursor-pointer border-2 flex-shrink-0 ${
                agentSpeaksFirst
                  ? "bg-green-500 border-green-500"
                  : "bg-muted border-muted-foreground/30"
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 md:w-5 h-4 md:h-5 rounded-full bg-white shadow-md transition-transform ${
                  agentSpeaksFirst ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <div>
              <h3 className="text-sm md:text-base font-medium text-foreground">
                Agent speaks first
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Whether the agent should initiate the conversation.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-xl overflow-hidden">
        <div className="px-3 md:px-4 py-3 md:py-4 flex items-start md:items-center justify-between gap-3">
          <div className="flex flex-col-reverse md:flex-row items-start md:items-center gap-2 md:gap-4">
            <input
              type="number"
              min="1"
              value={maxAssistantTurns}
              onChange={(e) => {
                const value = e.target.value;
                const num = parseInt(value, 10);
                if (!isNaN(num) && num >= 1) {
                  setMaxAssistantTurns(num);
                }
              }}
              className="w-16 md:w-20 h-9 md:h-10 px-2 md:px-3 text-center rounded-lg border border-border bg-background text-sm md:text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <div>
              <h3 className="text-sm md:text-base font-medium text-foreground">
                Max assistant turns
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
                Maximum number of assistant turns before ending the call.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
