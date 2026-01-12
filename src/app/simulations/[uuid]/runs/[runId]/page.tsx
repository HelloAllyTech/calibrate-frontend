"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { Tooltip } from "@/components/Tooltip";

type MetricData = {
  mean: number;
  std: number;
  values: number[];
};

type Persona = {
  label: string;
  characteristics: string;
  gender: string;
  language: string;
};

type Scenario = {
  name: string;
  description: string;
};

type EvaluationResult = {
  name: string;
  match: boolean;
  reasoning: string;
};

type TranscriptEntry = {
  role: string;
  content?: string;
  tool_calls?: any[];
  tool_call_id?: string;
};

type SimulationResult = {
  simulation_name: string;
  persona: Persona;
  scenario: Scenario;
  evaluation_results: EvaluationResult[];
  transcript: TranscriptEntry[];
};

type RunData = {
  task_id: string;
  name: string;
  status: string;
  type: "chat" | "audio";
  updated_at: string;
  total_simulations: number;
  metrics: {
    tool_calls?: MetricData;
    answer_completeness?: MetricData;
    assistant_behavior?: MetricData;
    question_completeness?: MetricData;
  } | null;
  simulation_results: SimulationResult[];
  results_s3_prefix: string;
  error: string | null;
};

export default function SimulationRunPage() {
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid as string;
  const runId = params.runId as string;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [runData, setRunData] = useState<RunData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transcriptDialogOpen, setTranscriptDialogOpen] = useState(false);
  const [selectedSimulation, setSelectedSimulation] =
    useState<SimulationResult | null>(null);

  useEffect(() => {
    let pollInterval: NodeJS.Timeout | null = null;

    const fetchRunData = async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setIsLoading(true);
          setError(null);
        }
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error("BACKEND_URL environment variable is not set");
        }

        const response = await fetch(`${backendUrl}/simulations/run/${runId}`, {
          method: "GET",
          headers: {
            accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch run data");
        }

        const data: RunData = await response.json();
        setRunData(data);

        // Stop polling if status is "done"
        if (data.status.toLowerCase() === "done" && pollInterval) {
          clearInterval(pollInterval);
          pollInterval = null;
        }
      } catch (err) {
        console.error("Error fetching run data:", err);
        if (isInitialLoad) {
          setError(err instanceof Error ? err.message : "Failed to load run");
        }
      } finally {
        if (isInitialLoad) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchRunData(true);

    // Start polling every 3 seconds
    pollInterval = setInterval(() => {
      fetchRunData(false);
    }, 3000);

    // Cleanup on unmount
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [runId]);

  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "in_progress":
        return "Running";
      case "done":
        return "Done";
      default:
        return status;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "done":
      case "completed":
        return "bg-green-500/20 text-green-400";
      case "running":
      case "in_progress":
        return "bg-yellow-500/20 text-yellow-400";
      case "failed":
      case "error":
        return "bg-red-500/20 text-red-400";
      case "pending":
      case "queued":
        return "bg-gray-500/20 text-gray-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type.toLowerCase()) {
      case "chat":
        return "bg-purple-500/20 text-purple-400";
      case "audio":
      case "voice":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const getPassFailStatus = (mean: number) => {
    return mean === 1 ? "Pass" : "Fail";
  };

  const getPassFailClass = (mean: number) => {
    return mean === 1
      ? "bg-green-500/20 text-green-400"
      : "bg-red-500/20 text-red-400";
  };

  const getEvaluationResult = (
    simulation: SimulationResult,
    metricName: string
  ) => {
    const result = simulation.evaluation_results.find(
      (r) => r.name === metricName
    );
    return result?.match ?? false;
  };

  const getEvaluationReasoning = (
    simulation: SimulationResult,
    metricName: string
  ) => {
    const result = simulation.evaluation_results.find(
      (r) => r.name === metricName
    );
    return result?.reasoning ?? "";
  };

  const openTranscriptDialog = (simulation: SimulationResult) => {
    setSelectedSimulation(simulation);
    setTranscriptDialogOpen(true);
  };

  const closeTranscriptDialog = () => {
    setTranscriptDialogOpen(false);
    setSelectedSimulation(null);
  };

  // Custom header with back button and title
  const customHeader = (
    <div className="flex items-center gap-4">
      <button
        onClick={() => router.push(`/simulations/${uuid}?tab=runs`)}
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
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">
          {runData?.name || "Loading..."}
        </h1>
        {runData?.status.toLowerCase() === "in_progress" && (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
      </div>
    </div>
  );

  // Loading header
  const loadingHeader = (
    <div className="flex items-center gap-4">
      <button
        onClick={() => router.push(`/simulations/${uuid}?tab=runs`)}
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
      <div>
        <h1 className="text-2xl font-semibold">Loading...</h1>
      </div>
    </div>
  );

  return (
    <AppLayout
      activeItem="simulations"
      onItemChange={(itemId) => router.push(`/${itemId}`)}
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      customHeader={isLoading ? loadingHeader : customHeader}
    >
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-8">
            <svg
              className="w-5 h-5 animate-spin"
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
          </div>
        ) : error ? (
          <div className="border border-border rounded-xl p-12 flex flex-col items-center justify-center bg-muted/20">
            <p className="text-base text-red-500 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : runData ? (
          <div className="space-y-6">
            {/* Status and Type Pills */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getStatusBadgeClass(
                  runData.status
                )}`}
              >
                {formatStatus(runData.status)}
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${getTypeBadgeClass(
                  runData.type
                )}`}
              >
                {runData.type}
              </span>
            </div>

            {/* Overall Metrics */}
            {runData.metrics && (
              <div>
                <h2 className="text-lg font-semibold mb-4">Overall Metrics</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(runData.metrics).map(([key, metric]) => {
                    const mean = (metric as MetricData).mean;
                    return (
                      <div key={key}>
                        <div className="text-sm text-muted-foreground mb-2">
                          {key}
                        </div>
                        <div className="text-base font-medium text-foreground">
                          {parseFloat(mean.toFixed(2))}/1
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Simulation Results Table */}
            {runData.simulation_results &&
              runData.simulation_results.length > 0 && (
                <>
                  <h2 className="text-lg font-semibold mb-4">
                    Simulation Results
                  </h2>
                  <div className="border border-border rounded-xl overflow-hidden bg-muted/20">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-background border-t border-border">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Persona
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              Scenario
                            </th>
                            {runData.metrics &&
                              Object.keys(runData.metrics).map((metricKey) => (
                                <th
                                  key={metricKey}
                                  className="px-6 py-3 text-left text-xs font-medium text-muted-foreground tracking-wider"
                                >
                                  {metricKey}
                                </th>
                              ))}
                            <th className="px-6 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {runData.simulation_results.map(
                            (simulation, index) => (
                              <tr
                                key={index}
                                className="hover:bg-muted/30 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                  {simulation.persona.label}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                                  {simulation.scenario.name}
                                </td>
                                {runData.metrics &&
                                  Object.keys(runData.metrics).map(
                                    (metricKey) => {
                                      const passed = getEvaluationResult(
                                        simulation,
                                        metricKey
                                      );
                                      const reasoning = getEvaluationReasoning(
                                        simulation,
                                        metricKey
                                      );
                                      return (
                                        <td
                                          key={metricKey}
                                          className="px-6 py-4 whitespace-nowrap"
                                        >
                                          <div className="flex justify-center">
                                            {reasoning ? (
                                              <Tooltip content={reasoning}>
                                                <span
                                                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                                    passed
                                                      ? "bg-green-500/20 text-green-400"
                                                      : "bg-red-500/20 text-red-400"
                                                  }`}
                                                >
                                                  {passed ? "Pass" : "Fail"}
                                                </span>
                                              </Tooltip>
                                            ) : (
                                              <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                                  passed
                                                    ? "bg-green-500/20 text-green-400"
                                                    : "bg-red-500/20 text-red-400"
                                                }`}
                                              >
                                                {passed ? "Pass" : "Fail"}
                                              </span>
                                            )}
                                          </div>
                                        </td>
                                      );
                                    }
                                  )}
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() =>
                                      openTranscriptDialog(simulation)
                                    }
                                    className="h-8 px-3 rounded-md text-xs font-medium border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
                                  >
                                    View transcript
                                  </button>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
          </div>
        ) : null}
      </div>

      {/* Transcript Dialog */}
      {transcriptDialogOpen && selectedSimulation && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeTranscriptDialog}
          />
          {/* Sidebar */}
          <div className="relative w-[40%] min-w-[500px] bg-background border-l border-border flex flex-col h-full shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
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
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
                <h2 className="text-lg font-semibold">Transcript</h2>
              </div>
              <button
                onClick={closeTranscriptDialog}
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

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {selectedSimulation.transcript
                  .filter((entry) => entry.role !== "tool")
                  .map((entry, index) => (
                    <div
                      key={index}
                      className={`space-y-2 ${
                        entry.role === "user" ? "flex flex-col items-end" : ""
                      }`}
                    >
                      {/* Message Header - show for assistant messages */}
                      {entry.role === "assistant" && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">
                            {entry.tool_calls ? "Agent Tool Call" : "Agent"}
                          </span>
                        </div>
                      )}

                      {/* User Message */}
                      {entry.role === "user" && entry.content && (
                        <div className="w-1/2">
                          <div className="px-4 py-3 rounded-xl text-sm text-white bg-[#242426] border border-[#444] whitespace-pre-wrap">
                            {entry.content}
                          </div>
                        </div>
                      )}

                      {/* Assistant Message (text response) */}
                      {entry.role === "assistant" &&
                        entry.content &&
                        !entry.tool_calls && (
                          <div className="w-1/2">
                            <div className="px-4 py-3 rounded-xl text-sm text-white bg-black border border-[#333] whitespace-pre-wrap">
                              {entry.content}
                            </div>
                          </div>
                        )}

                      {/* Tool Call Display */}
                      {entry.role === "assistant" && entry.tool_calls && (
                        <div className="w-1/2">
                          {entry.tool_calls.map((toolCall, toolIndex) => {
                            let parsedArgs: Record<string, any> = {};
                            try {
                              parsedArgs = JSON.parse(
                                toolCall.function.arguments
                              );
                            } catch {
                              parsedArgs = {};
                            }
                            return (
                              <div
                                key={toolIndex}
                                className="bg-[#1a1a1a] border border-[#333] rounded-2xl p-4 mb-2"
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <svg
                                    className="w-4 h-4 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.5}
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
                                    />
                                  </svg>
                                  <span className="text-sm font-medium text-white">
                                    {toolCall.function.name}
                                  </span>
                                </div>
                                {Object.keys(parsedArgs).length > 0 && (
                                  <div className="space-y-3 mt-3">
                                    {Object.entries(parsedArgs).map(
                                      ([key, value], paramIndex) => (
                                        <div key={paramIndex}>
                                          <label className="block text-sm font-medium text-gray-300 mb-1.5">
                                            {key}
                                          </label>
                                          <div className="px-3 py-2 bg-[#0a0a0a] border border-[#222] rounded-lg text-sm text-gray-400">
                                            {String(value)}
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
