"use client";

import React, { useState } from "react";
import { llmProviders, type LLMModel } from "./constants/providers";

type LLMSelectorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedLLM: LLMModel | null;
  onSelect: (model: LLMModel) => void;
};

export function LLMSelectorModal({
  isOpen,
  onClose,
  selectedLLM,
  onSelect,
}: LLMSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setSearchQuery("");
    onClose();
  };

  const handleSelect = (model: LLMModel) => {
    onSelect(model);
    setSearchQuery("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/50">
      <div className="bg-background border border-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <h2 className="text-base font-semibold">Select LLM</h2>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="px-4 py-3 border-b border-border">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search LLM"
            className="w-full h-10 px-4 rounded-md text-base border border-border bg-muted/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Models List */}
        <div className="flex-1 overflow-y-auto">
          {llmProviders.map((provider) => {
            const filteredModels = provider.models.filter(
              (model) =>
                model.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase()) ||
                provider.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
            );
            if (filteredModels.length === 0) return null;
            return (
              <div key={provider.name} className="py-2">
                <h3 className="px-4 py-2 text-sm font-medium text-muted-foreground">
                  {provider.name}
                </h3>
                {filteredModels.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleSelect(model)}
                    className={`w-full px-4 py-3 flex items-center hover:bg-muted/50 transition-colors cursor-pointer ${
                      selectedLLM?.id === model.id ? "bg-muted/50" : ""
                    }`}
                  >
                    <span className="text-base font-medium text-foreground">
                      {model.name}
                    </span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
