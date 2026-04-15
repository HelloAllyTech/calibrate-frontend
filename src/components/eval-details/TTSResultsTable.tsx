import React from "react";
import { Tooltip } from "@/components/Tooltip";

export type TTSResultRow = {
  id: string;
  text: string;
  audio_path: string;
  llm_judge_score?: string;
  llm_judge_reasoning?: string;
};

type TTSResultsTableProps = {
  results: TTSResultRow[];
  showMetrics?: boolean;
};

export function TTSResultsTable({ results, showMetrics = true }: TTSResultsTableProps) {
  return (
    <>
      {/* Desktop: Table layout */}
      <div className="hidden md:block border rounded-xl overflow-visible">
        <div className="overflow-hidden rounded-xl">
          <table className="w-full table-fixed">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="w-12 px-4 py-3 text-left text-[12px] font-medium text-foreground">ID</th>
                <th className={`${showMetrics ? "w-[30%]" : "w-[calc(50%-24px)]"} px-4 py-3 text-left text-[12px] font-medium text-foreground`}>Text</th>
                <th className={`${showMetrics ? "w-[50%]" : "w-[calc(50%-24px)]"} px-4 py-3 text-left text-[12px] font-medium text-foreground`}>Audio</th>
                {showMetrics && (
                  <th className="px-4 py-3 text-left text-[12px] font-medium text-foreground">LLM Judge</th>
                )}
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 text-[13px] text-foreground">{index + 1}</td>
                  <td className="px-4 py-3 text-[13px] text-foreground break-words">{result.text}</td>
                  <td className="px-4 py-3 text-[13px] text-foreground">
                    <audio controls className="w-full min-w-[280px]" src={result.audio_path}>
                      Your browser does not support the audio element.
                    </audio>
                  </td>
                  {showMetrics && (
                    <td className="px-4 py-3">
                      <LLMJudgeBadge score={result.llm_judge_score} reasoning={result.llm_judge_reasoning} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-3">
        {results.map((result, index) => {
          const scoreStr = String(result.llm_judge_score || "").toLowerCase();
          const passed = scoreStr === "true" || scoreStr === "1";
          return (
            <div key={index} className="border border-border rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-muted-foreground font-medium">#{index + 1}</span>
                {showMetrics && result.llm_judge_score && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                    passed
                      ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                  }`}>
                    {passed ? "Pass" : "Fail"}
                  </span>
                )}
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Text</span>
                <p className="text-[13px] text-foreground mt-0.5">{result.text}</p>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Audio</span>
                <audio controls className="w-full mt-1" src={result.audio_path}>
                  Your browser does not support the audio element.
                </audio>
              </div>
              {showMetrics && result.llm_judge_reasoning && (
                <div className="pt-1 border-t border-border">
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">LLM Judge Reasoning</span>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{result.llm_judge_reasoning}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

function LLMJudgeBadge({ score, reasoning }: { score?: string; reasoning?: string }) {
  if (!score) return <span className="text-muted-foreground text-[12px]">-</span>;

  const scoreStr = String(score).toLowerCase();
  const passed = scoreStr === "true" || scoreStr === "1";
  const tooltipContent = reasoning || `Score: ${score}`;

  return (
    <div className="flex items-center gap-1.5">
      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
        passed
          ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
          : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
      }`}>
        {passed ? "Pass" : "Fail"}
      </span>
      <Tooltip content={tooltipContent}>
        <button type="button" className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer" aria-label="View reasoning">
          <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
      </Tooltip>
    </div>
  );
}
