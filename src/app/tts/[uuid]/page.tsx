"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useAccessToken } from "@/hooks";
import { AppLayout } from "@/components/AppLayout";
import { BackHeader, StatusBadge, NotFoundState } from "@/components/ui";
import { ttsProviders } from "@/components/agent-tabs/constants/providers";
import { POLLING_INTERVAL_MS } from "@/constants/polling";
import {
  ProviderSidebar,
  ProviderMetricsCard,
  TTSResultsTable,
  LeaderboardTab,
  AboutMetricsTable,
} from "@/components/eval-details";
import { useSidebarState } from "@/lib/sidebar";
import { getDataset } from "@/lib/datasets";
import { ShareButton } from "@/components/ShareButton";

type LatencyMetric = {
  mean: number;
  std: number;
  values: number[];
};

type ProviderMetrics = {
  llm_judge_score: number;
  ttfb: LatencyMetric;
  processing_time: LatencyMetric;
};

type ProviderResult = {
  provider: string;
  success: boolean | null; // null means in progress
  message: string;
  metrics: ProviderMetrics | null;
  results: Array<{
    id: string;
    text: string;
    audio_path: string;
    llm_judge_score?: string; // Only present when complete
    llm_judge_reasoning?: string; // Only present when complete
  }> | null;
};

type LeaderboardSummary = {
  run: string;
  count: number;
  llm_judge_score: number;
  ttfb: number;
  processing_time: number;
};

type EvaluationResult = {
  task_id: string;
  status: "queued" | "in_progress" | "done" | "failed";
  language?: string;
  dataset_id?: string | null;
  dataset_name?: string | null;
  provider_results?: ProviderResult[];
  leaderboard_summary?: LeaderboardSummary[];
  error?: string | null;
  is_public?: boolean;
  share_token?: string | null;
};

// Helper function to map provider value back to label
const getProviderLabel = (value: string): string => {
  const provider = ttsProviders.find((p) => p.value === value);
  return provider ? provider.label : value;
};

export default function TTSEvaluationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const backendAccessToken = useAccessToken();
  const taskId = params.uuid as string;
  const [sidebarOpen, setSidebarOpen] = useSidebarState();
  const [evaluationResult, setEvaluationResult] =
    useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<401 | 403 | 404 | null>(null);
  const [activeTab, setActiveTab] = useState<
    "leaderboard" | "outputs" | "about"
  >("outputs");
  const [activeProviderTab, setActiveProviderTab] = useState<string | null>(
    null
  );
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Set page title and collapse main sidebar for more space
  useEffect(() => {
    document.title = "TTS Evaluation | Calibrate";
    setSidebarOpen(false);
  }, []);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Fetch evaluation result
  useEffect(() => {
    const fetchResult = async () => {
      if (!backendAccessToken || !taskId) return;

      try {
        setIsLoading(true);
        setError(null);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error("BACKEND_URL environment variable is not set");
        }

        const response = await fetch(`${backendUrl}/tts/evaluate/${taskId}`, {
          method: "GET",
          headers: {
            accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            Authorization: `Bearer ${backendAccessToken}`,
          },
        });

        if (response.status === 401) {
          await signOut({ callbackUrl: "/login" });
          return;
        }

        if (response.status === 404) {
          setErrorCode(404);
          return;
        }

        if (response.status === 403) {
          setErrorCode(403);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch evaluation result");
        }

        const result: EvaluationResult = await response.json();

        if (result.dataset_id) {
          try {
            await getDataset(backendAccessToken, result.dataset_id);
          } catch {
            result.dataset_id = null;
            result.dataset_name = null;
          }
        }

        setEvaluationResult(result);

        // Set first provider as active tab if results exist (use functional setState to avoid stale closures)
        if (result.provider_results && result.provider_results.length > 0) {
          setActiveProviderTab(
            (current) => current || result.provider_results![0].provider
          );
        }

        // If already done, show leaderboard tab by default
        if (result.status === "done") {
          setActiveTab("leaderboard");
        }

        // Start polling if not done or failed
        if (
          result.status !== "done" &&
          result.status !== "failed" &&
          !pollingIntervalRef.current
        ) {
          pollingIntervalRef.current = setInterval(() => {
            pollTaskStatus(taskId, backendUrl);
          }, POLLING_INTERVAL_MS);
        }
      } catch (err) {
        console.error("Error fetching evaluation result:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load evaluation"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [taskId, backendAccessToken]);

  const pollTaskStatus = async (taskId: string, backendUrl: string) => {
    try {
      const response = await fetch(`${backendUrl}/tts/evaluate/${taskId}`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          Authorization: `Bearer ${backendAccessToken}`,
        },
      });

      if (response.status === 401) {
        await signOut({ callbackUrl: "/login" });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to poll task status");
      }

      const result: EvaluationResult = await response.json();
      setEvaluationResult(result);

      // Set first provider as active tab if results exist (use functional setState to avoid stale closures)
      if (result.provider_results && result.provider_results.length > 0) {
        setActiveProviderTab(
          (current) => current || result.provider_results![0].provider
        );
      }

      if (result.status === "done" || result.status === "failed") {
        // Switch to leaderboard tab when evaluation completes successfully
        if (result.status === "done") {
          setActiveTab("leaderboard");
        }
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
      }
    } catch (error) {
      console.error("Error polling task status:", error);
      // Set status to failed so the UI shows the error state
      setEvaluationResult((prev) =>
        prev ? { ...prev, status: "failed" } : prev
      );
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  };

  const customHeader = (
    <BackHeader
      label="Back to all TTS evaluations"
      onBack={() => router.push("/tts")}
      title="Back to TTS evaluations"
    />
  );

  return (
    <AppLayout
      activeItem="tts"
      onItemChange={(itemId) => router.push(`/${itemId}`)}
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      customHeader={customHeader}
    >
      <div className="space-y-4 md:space-y-6">
        {/* Loading State */}
        {isLoading && (
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
        )}

        {/* Error State */}
        {error && (
          <div className="border border-border rounded-xl p-12 flex flex-col items-center justify-center bg-muted/20">
            <p className="text-base text-red-500 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Not Found State */}
        {errorCode && <NotFoundState errorCode={errorCode} />}

        {/* Evaluation Results */}
        {!isLoading && !error && !errorCode && evaluationResult && (
          <div className="space-y-4">
            {/* Language Pill, Dataset link, and Status Badge */}
            <div className="flex items-center gap-3 flex-wrap">
              {evaluationResult.language && (
                <span className="px-3 py-1 text-[12px] font-medium bg-muted rounded-full text-foreground capitalize">
                  {evaluationResult.language}
                </span>
              )}
              {evaluationResult.dataset_id && evaluationResult.dataset_name && (
                <Link
                  href={`/datasets/${evaluationResult.dataset_id}`}
                  className="flex items-center gap-1.5 px-3 py-1 text-[12px] font-medium bg-muted rounded-full text-foreground hover:bg-muted/70 transition-colors"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
                    />
                  </svg>
                  {evaluationResult.dataset_name}
                </Link>
              )}
              {evaluationResult.status !== "done" && (
                <StatusBadge status={evaluationResult.status} showSpinner />
              )}
              {(evaluationResult.status === "done" || evaluationResult.status === "failed") && backendAccessToken && (
                <ShareButton
                  entityType="tts"
                  entityId={taskId}
                  accessToken={backendAccessToken}
                  initialIsPublic={evaluationResult.is_public ?? false}
                  initialShareToken={evaluationResult.share_token ?? null}
                />
              )}
            </div>

            {/* Only show tabs and content when we have at least one provider result */}
            {evaluationResult.provider_results &&
              evaluationResult.provider_results.length > 0 && (
                <>
                  {/* Tab Navigation */}
                  <div className="flex gap-2 border-b border-border">
                    {/* Only show Leaderboard tab when done */}
                    {evaluationResult.status === "done" && (
                      <button
                        onClick={() => setActiveTab("leaderboard")}
                        className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                          activeTab === "leaderboard"
                            ? "border-foreground text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Leaderboard
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setActiveTab("outputs");
                        if (
                          !activeProviderTab &&
                          evaluationResult?.provider_results &&
                          evaluationResult.provider_results.length > 0
                        ) {
                          setActiveProviderTab(
                            evaluationResult.provider_results[0].provider
                          );
                        }
                      }}
                      className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                        activeTab === "outputs"
                          ? "border-foreground text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Outputs
                    </button>
                    <button
                      onClick={() => setActiveTab("about")}
                      className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
                        activeTab === "about"
                          ? "border-foreground text-foreground"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      About
                    </button>
                  </div>

                  {/* About Tab */}
                  {activeTab === "about" && (
                    <AboutMetricsTable
                      metrics={[
                        { metric: "LLM Judge", description: "The LLM judge evaluates whether the synthesized audio accurately matches the reference text. It checks for semantic equivalence and pronunciation accuracy, returning Pass if the audio correctly represents the input text.", preference: "Pass is better", range: "Pass / Fail" },
                        { metric: "TTFB (Time To First Byte)", description: "Time to first byte measures the latency from when a request is sent until the first byte of the response is received.", preference: "Lower is better", range: "0 - ∞" },
                      ]}
                    />
                  )}

                  {/* Leaderboard Tab */}
                  {activeTab === "leaderboard" && evaluationResult.leaderboard_summary && (
                    <LeaderboardTab
                      className="-mx-4 md:-mx-8 px-4 md:px-8 w-[calc(100vw-32px)] md:w-[calc(100vw-56px)] ml-[calc((32px-100vw)/2+50%)] md:ml-[calc((56px-100vw)/2+50%)] relative"
                      columns={[
                        { key: "run", header: "Run", render: (v) => getProviderLabel(v) },
                        { key: "llm_judge_score", header: "LLM Judge Score" },
                        { key: "ttfb", header: "TTFB (s)", render: (v) => v != null ? parseFloat(v.toFixed(4)) : "-" },
                      ]}
                      data={evaluationResult.leaderboard_summary}
                      charts={[[
                        { title: "LLM Judge Score", dataKey: "llm_judge_score", yDomain: [0, 1] },
                        { title: "TTFB (s)", dataKey: "ttfb" },
                      ]]}
                      filename="tts-evaluation-leaderboard"
                      getLabel={getProviderLabel}
                    />
                  )}

                  {/* Outputs Tab */}
                  {activeTab === "outputs" && (
                    <div className="flex flex-col md:flex-row border border-border rounded-xl overflow-hidden md:h-[calc(100vh-220px)]">
                      <ProviderSidebar
                        items={evaluationResult.provider_results!.map((pr) => ({
                          key: pr.provider,
                          label: getProviderLabel(pr.provider),
                          success: pr.success,
                        }))}
                        activeKey={activeProviderTab || evaluationResult.provider_results![0]?.provider}
                        onSelect={setActiveProviderTab}
                      />

                      <div className="flex-1 overflow-y-auto p-4 md:p-6">
                        {(() => {
                          const selectedProvider =
                            activeProviderTab || evaluationResult.provider_results![0]?.provider;
                          const providerResult =
                            evaluationResult.provider_results!.find((pr) => pr.provider === selectedProvider);

                          if (!providerResult) {
                            return (
                              <div className="flex items-center justify-center h-full">
                                <p className="text-muted-foreground">Select a provider to view details</p>
                              </div>
                            );
                          }

                          if (providerResult.success === null && (!providerResult.results || providerResult.results.length === 0)) {
                            return (
                              <div className="flex items-center justify-center h-full min-h-[200px]">
                                <svg className="w-5 h-5 animate-spin text-muted-foreground" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              </div>
                            );
                          }

                          if (providerResult.success === false) {
                            return (
                              <div className="flex items-center justify-center h-full min-h-[200px]">
                                <div className="border border-red-500/50 bg-red-500/10 rounded-lg p-4 max-w-md text-center">
                                  <div className="text-red-500 text-[14px] font-medium mb-1">
                                    There was an error running this provider. Please contact us by posting your issue to help us help you.
                                  </div>
                                </div>
                              </div>
                            );
                          }

                          const showMetrics =
                            evaluationResult.status === "done" ||
                            (providerResult.results?.every((r) => r.llm_judge_score !== undefined && r.llm_judge_score !== "") ?? false);

                          return (
                            <div className="space-y-4 md:space-y-6">
                              {providerResult.success && providerResult.metrics && (
                                <ProviderMetricsCard
                                  metrics={[
                                    { label: "LLM Judge Score", value: providerResult.metrics.llm_judge_score ?? "-" },
                                    { label: "TTFB (s)", value: providerResult.metrics.ttfb?.mean != null ? parseFloat(providerResult.metrics.ttfb.mean.toFixed(4)) : "-" },
                                  ]}
                                />
                              )}
                              {providerResult.results && providerResult.results.length > 0 && (
                                <TTSResultsTable results={providerResult.results} showMetrics={showMetrics} />
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </>
              )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
