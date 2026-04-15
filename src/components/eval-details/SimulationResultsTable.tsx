import React from "react";
import { Tooltip } from "@/components/Tooltip";

export type EvaluationResult = { name: string; value: number; reasoning: string };
export type Persona = { label: string; characteristics: string; gender: string; language: string };
export type Scenario = { name: string; description: string };
export type TranscriptEntry = { role: string; content?: string; tool_calls?: any[] | null; tool_call_id?: string };

export type SimulationResult = {
  simulation_name: string;
  aborted?: boolean;
  persona: Persona;
  scenario: Scenario;
  evaluation_results: EvaluationResult[] | null;
  transcript?: TranscriptEntry[] | null;
  audio_urls?: string[];
  conversation_wav_url?: string;
};

type SimulationResultsTableProps = {
  simulations: SimulationResult[];
  metricKeys: string[];
  onSelectSimulation: (sim: SimulationResult) => void;
};

const getEvaluationResult = (sim: SimulationResult, key: string): number | null => {
  if (!sim.evaluation_results) return null;
  const mapped = key === "stt_llm_judge" ? "stt_llm_judge_score" : key;
  const found = sim.evaluation_results.find((r) => r.name === key || r.name === mapped);
  return found ? found.value : null;
};

const getEvaluationReasoning = (sim: SimulationResult, key: string): string | null => {
  if (!sim.evaluation_results) return null;
  const found = sim.evaluation_results.find((r) => r.name === key);
  return found?.reasoning ?? null;
};

export function SimulationResultsTable({ simulations, metricKeys, onSelectSimulation }: SimulationResultsTableProps) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-3 md:mb-4">
        <h2 className="hidden md:block text-base md:text-lg font-semibold">Simulation Results</h2>
        <p className="text-sm text-muted-foreground">
          {simulations.length} {simulations.length === 1 ? "simulation" : "simulations"}
        </p>
      </div>
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="w-10 px-4 py-3 text-left text-[12px] font-medium text-muted-foreground"></th>
                <th className="px-4 py-3 text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Persona</th>
                <th className="px-4 py-3 text-left text-[12px] font-medium text-muted-foreground uppercase tracking-wider">Scenario</th>
                {metricKeys.map((k) => (
                  <th key={k} className="px-4 py-3 text-left text-[12px] font-medium text-muted-foreground tracking-wider whitespace-nowrap">{k}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {simulations.map((sim, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    {(sim.transcript?.length ?? 0) > 0 && (
                      <button
                        onClick={() => onSelectSimulation(sim)}
                        className="flex items-center justify-center w-6 h-6 cursor-pointer hover:text-foreground text-muted-foreground transition-colors"
                        title="View transcript"
                      >
                        <svg className={`w-4 h-4 ${sim.aborted ? "text-red-500" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                        </svg>
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-4 text-[13px] text-foreground whitespace-nowrap">{sim.persona.label}</td>
                  <td className="px-4 py-4 text-[13px] text-foreground whitespace-nowrap">{sim.scenario.name}</td>
                  {metricKeys.map((key) => {
                    const val = getEvaluationResult(sim, key);
                    const reasoning = getEvaluationReasoning(sim, key);
                    if (val === null) return (
                      <td key={key} className="px-4 py-4">
                        {sim.aborted ? <span className="text-xs text-muted-foreground">N/A</span> : <span className="text-xs text-muted-foreground">&mdash;</span>}
                      </td>
                    );
                    const isPass = val === 1;
                    return (
                      <td key={key} className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${isPass ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"}`}>
                            {isPass ? "Pass" : "Fail"}
                          </span>
                          {reasoning && (
                            <Tooltip content={reasoning}>
                              <button type="button" className="p-1 rounded-md hover:bg-muted transition-colors cursor-pointer">
                                <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
