"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { sttProviders } from "@/components/agent-tabs/constants/providers";
import { PublicPageLayout, PublicNotFound, PublicLoading } from "@/components/PublicPageLayout";
import {
  ProviderSidebar,
  ProviderMetricsCard,
  STTResultsTable,
  LeaderboardTab,
  AboutMetricsTable,
} from "@/components/eval-details";

type ProviderMetrics = {
  wer: number;
  string_similarity: number;
  llm_judge_score: number;
};

type ProviderResult = {
  provider: string;
  success: boolean;
  message: string;
  metrics: ProviderMetrics;
  results: Array<{
    id: string;
    gt: string;
    pred: string;
    wer: string;
    string_similarity: string;
    llm_judge_score: string;
    llm_judge_reasoning: string;
  }>;
};

type LeaderboardSummary = {
  run: string;
  count: number;
  wer: number;
  string_similarity: number;
  llm_judge_score: number;
};

type EvaluationResult = {
  task_id: string;
  status: "queued" | "in_progress" | "done" | "failed";
  language?: string;
  provider_results?: ProviderResult[];
  leaderboard_summary?: LeaderboardSummary[];
  error?: string | null;
};

const getProviderLabel = (value: string): string => {
  const provider = sttProviders.find((p) => p.value === value);
  return provider ? provider.label : value;
};

const STT_ABOUT_METRICS = [
  { metric: "WER", description: "Word error rate measures the percentage of words that differ between reference and predicted transcription.", preference: "Lower is better", range: "0 - \u221E" },
  { metric: "String Similarity", description: "Measures similarity between reference and predicted strings using string matching algorithms.", preference: "Higher is better", range: "0 - 1" },
  { metric: "LLM Judge", description: "Evaluates semantic equivalence rather than exact string matching, returning Pass if the transcription is semantically correct.", preference: "Pass is better", range: "Pass / Fail" },
  { metric: "TTFB", description: "Time to first byte measures the latency from when a request is sent until the first byte of the response is received.", preference: "Lower is better", range: "0 - \u221E" },
  { metric: "Processing Time", description: "Total time taken to process the audio and generate the transcription.", preference: "Lower is better", range: "0 - \u221E" },
];

export default function PublicSTTPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<EvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<"leaderboard" | "outputs" | "about">("leaderboard");
  const [activeProviderTab, setActiveProviderTab] = useState<string | null>(null);

  useEffect(() => { document.title = "Speech-to-text evaluation | Calibrate"; }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) throw new Error("Backend URL not configured");

        const res = await fetch(`${backendUrl}/public/stt/${token}`, {
          headers: { accept: "application/json", "ngrok-skip-browser-warning": "true" },
        });

        if (res.status === 404) { setNotFound(true); return; }
        if (!res.ok) throw new Error("Failed to load results");

        const result: EvaluationResult = await res.json();
        if (result.status !== "done") { setNotFound(true); return; }

        setData(result);
        if (result.provider_results?.length) {
          setActiveProviderTab(result.provider_results[0].provider);
        }
      } catch {
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (isLoading) return <PublicPageLayout><PublicLoading /></PublicPageLayout>;
  if (notFound || !data) return <PublicPageLayout><PublicNotFound /></PublicPageLayout>;

  const selectedProvider = activeProviderTab ?? data.provider_results?.[0]?.provider;
  const providerResult = data.provider_results?.find((p) => p.provider === selectedProvider);

  return (
    <PublicPageLayout
      title="Speech-to-text evaluation"
      pills={
        data.language ? (
          <span className="px-2 py-0.5 text-[11px] font-medium bg-muted rounded-full text-muted-foreground capitalize">
            {data.language}
          </span>
        ) : undefined
      }
    >
      <div className="space-y-4 md:space-y-6">
        {data.provider_results && data.provider_results.length > 0 && (
          <>
            {/* Tab Nav */}
            <div className="flex gap-2 border-b border-border">
              {(["leaderboard", "outputs", "about"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors cursor-pointer capitalize ${
                    activeTab === tab ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Leaderboard Tab */}
            {activeTab === "leaderboard" && data.leaderboard_summary && (
              <LeaderboardTab
                columns={[
                  { key: "run", header: "Run", render: (v) => getProviderLabel(v) },
                  { key: "wer", header: "WER" },
                  { key: "string_similarity", header: "String Similarity", render: (v) => v != null ? parseFloat(v.toFixed(4)) : "-" },
                  { key: "llm_judge_score", header: "LLM Judge Score" },
                ]}
                data={data.leaderboard_summary}
                charts={[
                  [{ title: "WER", dataKey: "wer" }, { title: "String Similarity", dataKey: "string_similarity", yDomain: [0, 1] }],
                  [{ title: "LLM Judge Score", dataKey: "llm_judge_score", yDomain: [0, 1] }],
                ]}
                filename="stt-evaluation-leaderboard"
                getLabel={getProviderLabel}
              />
            )}

            {/* Outputs Tab */}
            {activeTab === "outputs" && (
              <div className="flex flex-col md:flex-row border border-border rounded-xl overflow-hidden" style={{ minHeight: 480 }}>
                <ProviderSidebar
                  items={data.provider_results.map((pr) => ({
                    key: pr.provider,
                    label: getProviderLabel(pr.provider),
                    success: pr.success,
                  }))}
                  activeKey={selectedProvider ?? null}
                  onSelect={setActiveProviderTab}
                />

                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  {!providerResult ? (
                    <p className="text-muted-foreground">Select a provider</p>
                  ) : !providerResult.success ? (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                      <div className="border border-red-500/50 bg-red-500/10 rounded-lg p-4 max-w-md text-center">
                        <div className="text-red-500 text-[14px] font-medium">There was an error running this provider.</div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 md:space-y-6">
                      {providerResult.metrics && (
                        <ProviderMetricsCard
                          metrics={[
                            { label: "WER", value: providerResult.metrics.wer != null ? parseFloat(providerResult.metrics.wer.toFixed(4)) : "-" },
                            { label: "String Similarity", value: providerResult.metrics.string_similarity != null ? parseFloat(providerResult.metrics.string_similarity.toFixed(4)) : "-" },
                            { label: "LLM Judge Score", value: providerResult.metrics.llm_judge_score ?? "-" },
                          ]}
                        />
                      )}
                      {providerResult.results && providerResult.results.length > 0 && (
                        <STTResultsTable results={providerResult.results} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* About Tab */}
            {activeTab === "about" && <AboutMetricsTable metrics={STT_ABOUT_METRICS} />}
          </>
        )}
      </div>
    </PublicPageLayout>
  );
}
