import React from "react";
import { Tooltip } from "@/components/Tooltip";

export type STTResultRow = {
  id: string;
  audio_url?: string;
  gt: string;
  pred: string;
  wer: string;
  string_similarity: string;
  llm_judge_score: string;
  llm_judge_reasoning: string;
};

type STTResultsTableProps = {
  results: STTResultRow[];
  showMetrics?: boolean;
  tableRef?: React.RefObject<HTMLDivElement | null>;
};

export function STTResultsTable({ results, showMetrics = true, tableRef }: STTResultsTableProps) {
  const hasAudio = results.some((r) => !!r.audio_url);

  return (
    <>
      {/* Desktop: Table layout */}
      <div className="hidden md:block border rounded-xl overflow-visible" ref={tableRef}>
        <div className="overflow-x-auto rounded-xl">
          <table className="w-full table-fixed">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="w-10 px-3 py-3 text-left text-[12px] font-medium text-foreground">ID</th>
                {hasAudio && (
                  <th className="w-[180px] px-3 py-3 text-left text-[12px] font-medium text-foreground">Audio</th>
                )}
                <th className={`${showMetrics ? "w-[25%]" : "w-[calc(50%-20px)]"} px-3 py-3 text-left text-[12px] font-medium text-foreground`}>Ground Truth</th>
                <th className={`${showMetrics ? "w-[25%]" : "w-[calc(50%-20px)]"} px-3 py-3 text-left text-[12px] font-medium text-foreground`}>Prediction</th>
                {showMetrics && (
                  <>
                    <th className="w-[72px] px-3 py-3 text-left text-[12px] font-medium text-foreground">WER</th>
                    <th className="w-[100px] px-3 py-3 text-left text-[12px] font-medium text-foreground">Similarity</th>
                    <th className="w-[90px] px-3 py-3 text-left text-[12px] font-medium text-foreground">LLM Judge</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => {
                const isEmptyPrediction = !result.pred || result.pred.trim() === "";
                return (
                  <tr
                    key={index}
                    data-row-index={index}
                    className={`border-b border-border last:border-b-0 ${isEmptyPrediction ? "bg-red-500/10" : ""}`}
                  >
                    <td className="px-3 py-3 text-[13px] text-foreground">{index + 1}</td>
                    {hasAudio && (
                      <td className="px-3 py-3">
                        {result.audio_url ? (
                          <audio src={result.audio_url} controls preload="none" className="h-8 w-full max-w-[160px]" />
                        ) : (
                          <span className="text-[13px] text-muted-foreground">&mdash;</span>
                        )}
                      </td>
                    )}
                    <td className="px-3 py-3 text-[13px] text-foreground break-words">{result.gt}</td>
                    <td className="px-3 py-3 text-[13px] break-words">
                      {isEmptyPrediction ? (
                        <span className="text-muted-foreground">No transcript generated</span>
                      ) : (
                        <span className="text-foreground">{result.pred}</span>
                      )}
                    </td>
                    {showMetrics && (
                      <>
                        <td className="px-4 py-3 text-[13px] text-foreground">
                          {result.wer != null ? parseFloat(parseFloat(result.wer).toFixed(4)) : "-"}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-foreground">
                          {result.string_similarity != null ? parseFloat(parseFloat(result.string_similarity).toFixed(4)) : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <LLMJudgeBadge score={result.llm_judge_score} reasoning={result.llm_judge_reasoning} />
                        </td>
                      </>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-3">
        {results.map((result, index) => {
          const isEmptyPrediction = !result.pred || result.pred.trim() === "";
          const scoreStr = String(result.llm_judge_score || "").toLowerCase();
          const passed = scoreStr === "true" || scoreStr === "1";
          return (
            <div
              key={index}
              data-row-index={index}
              className={`border border-border rounded-xl p-4 space-y-3 ${isEmptyPrediction ? "bg-red-500/10" : ""}`}
            >
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
              {result.audio_url && (
                <div>
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Audio</span>
                  <div className="mt-1">
                    <audio src={result.audio_url} controls preload="none" className="w-full h-8" />
                  </div>
                </div>
              )}
              <div>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Ground Truth</span>
                <p className="text-[13px] text-foreground mt-0.5">{result.gt}</p>
              </div>
              <div>
                <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Prediction</span>
                {isEmptyPrediction ? (
                  <p className="text-[13px] text-muted-foreground mt-0.5">No transcript generated</p>
                ) : (
                  <p className="text-[13px] text-foreground mt-0.5">{result.pred}</p>
                )}
              </div>
              {showMetrics && (
                <div className="space-y-2 pt-1 border-t border-border">
                  <div className="flex gap-4">
                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wide">WER</span>
                      <p className="text-[13px] text-foreground">{result.wer != null ? parseFloat(parseFloat(result.wer).toFixed(4)) : "-"}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wide">Similarity</span>
                      <p className="text-[13px] text-foreground">{result.string_similarity != null ? parseFloat(parseFloat(result.string_similarity).toFixed(4)) : "-"}</p>
                    </div>
                  </div>
                  {result.llm_judge_reasoning && (
                    <div>
                      <span className="text-[11px] text-muted-foreground uppercase tracking-wide">LLM Judge Reasoning</span>
                      <p className="text-[12px] text-muted-foreground mt-0.5">{result.llm_judge_reasoning}</p>
                    </div>
                  )}
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
