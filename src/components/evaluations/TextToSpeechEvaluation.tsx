"use client";

import { useState } from "react";

type TextRow = {
  id: string;
  text: string;
};

const providers = [
  "cartesia",
  "openai",
  "whisper",
  "google",
  "elevenlabs",
  "sarvam",
];

export function TextToSpeechEvaluation() {
  const [rows, setRows] = useState<TextRow[]>([{ id: "1", text: "" }]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [invalidRowIds, setInvalidRowIds] = useState<Set<string>>(new Set());
  const [selectedProviders, setSelectedProviders] = useState<Set<string>>(new Set(providers));

  const addRow = () => {
    // Validate existing rows
    const invalidIds = new Set<string>();
    rows.forEach((row) => {
      if (!row.text.trim()) {
        invalidIds.add(row.id);
      }
    });

    if (invalidIds.size > 0) {
      // Highlight invalid rows
      setInvalidRowIds(invalidIds);
      return; // Don't add new row if validation fails
    }

    // Clear validation errors and add new row
    setInvalidRowIds(new Set());
    const newId = Date.now().toString();
    setRows([...rows, { id: newId, text: "" }]);
  };

  const deleteRow = (id: string) => {
    if (rows.length === 1) return; // Don't allow deleting the last row
    setRows(rows.filter((row) => row.id !== id));
    setDeleteDialogOpen(null);
  };

  const handleTextChange = (id: string, text: string) => {
    setRows(rows.map((row) => (row.id === id ? { ...row, text } : row)));
    // Clear validation error for this row if text is entered
    if (text.trim()) {
      setInvalidRowIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const toggleProvider = (provider: string) => {
    setSelectedProviders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(provider)) {
        newSet.delete(provider);
      } else {
        newSet.add(provider);
      }
      return newSet;
    });
  };

  const handleEvaluate = () => {
    // TODO: Implement evaluation logic
    console.log("Evaluating:", rows);
    console.log("Selected providers:", Array.from(selectedProviders));
  };

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">Text-to-Speech Evaluation</h2>
        <p className="text-muted-foreground text-[15px] leading-relaxed max-w-2xl">
          Provide text inputs to evaluate TTS quality. Measure naturalness, prosody, and pronunciation accuracy.
        </p>
      </div>

      {/* Text Rows */}
      <div className="space-y-4">
        {rows.map((row, index) => {
          const isInvalid = invalidRowIds.has(row.id);
          return (
            <div
              key={row.id}
              className={`border rounded-xl p-4 flex items-center gap-4 transition-colors ${
                isInvalid
                  ? "border-red-500 bg-red-500/10"
                  : "border-border bg-muted/10"
              }`}
            >
              {/* Row Number */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[13px] font-medium text-muted-foreground">
                {index + 1}
              </div>

              {/* Text Input */}
              <div className="flex-1">
                <input
                  type="text"
                  value={row.text}
                  onChange={(e) => handleTextChange(row.id, e.target.value)}
                  placeholder="Enter text to synthesize"
                  className="w-full h-10 px-3 rounded-md text-[13px] border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>

              {/* Delete Button */}
              {rows.length > 1 && (
                <button
                  onClick={() => setDeleteDialogOpen(row.id)}
                  className="flex-shrink-0 w-10 h-10 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Delete row"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Row Button */}
      <button
        onClick={addRow}
        className="w-full h-10 px-4 rounded-md text-[13px] font-medium border border-dashed border-border bg-muted/20 hover:bg-muted/40 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add another sample
      </button>

      {/* Provider Selection */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-medium text-foreground">Select providers to evaluate</h3>
          <span className="text-[12px] text-muted-foreground">
            ({selectedProviders.size} selected)
          </span>
        </div>
        <div className="flex flex-wrap gap-3">
          {providers.map((provider) => {
            const isSelected = selectedProviders.has(provider);
            return (
              <button
                key={provider}
                onClick={() => toggleProvider(provider)}
                className={`h-9 px-4 rounded-md text-[13px] font-medium border transition-colors cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-muted-foreground border-border hover:bg-accent/50 hover:text-foreground hover:border-border"
                }`}
              >
                {isSelected && (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
                {provider}
              </button>
            );
          })}
        </div>
      </div>

      {/* Evaluate Button */}
      <div className="pt-6 border-t border-border">
        <button
          onClick={handleEvaluate}
          className="h-11 px-8 rounded-md text-[14px] font-semibold bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
          </svg>
          Evaluate
        </button>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <DeleteConfirmationDialog
          onConfirm={() => deleteRow(deleteDialogOpen)}
          onCancel={() => setDeleteDialogOpen(null)}
        />
      )}
    </div>
  );
}

function DeleteConfirmationDialog({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onCancel}>
      <div
        className="bg-background border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[15px] font-semibold mb-2">Delete row</h3>
        <p className="text-[13px] text-muted-foreground mb-6">
          Are you sure you want to delete this row? This action cannot be undone.
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="h-9 px-4 rounded-md text-[13px] font-medium text-muted-foreground hover:bg-accent transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="h-9 px-4 rounded-md text-[13px] font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
