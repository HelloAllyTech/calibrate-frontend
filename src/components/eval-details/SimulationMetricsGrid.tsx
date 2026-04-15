import React, { useState } from "react";

export type MetricData = { mean: number; std: number; values: number[] };

type SimulationMetricsGridProps = {
  metrics: Record<string, MetricData | undefined> | null;
  type: "text" | "voice";
};

const LATENCY_KEYS = ["stt/ttft", "llm/ttft", "tts/ttft", "stt/processing_time", "llm/processing_time", "tts/processing_time"];

export function SimulationMetricsGrid({ metrics, type }: SimulationMetricsGridProps) {
  const [activeTab, setActiveTab] = useState<"performance" | "latency">("performance");

  if (!metrics) return null;

  const regularMetrics: Array<[string, MetricData]> = [];
  const latencyMetrics: Array<[string, MetricData]> = [];
  Object.entries(metrics).forEach(([key, metric]) => {
    if (!metric) return;
    if (LATENCY_KEYS.includes(key)) latencyMetrics.push([key, metric]);
    else regularMetrics.push([key, metric]);
  });

  if (regularMetrics.length === 0 && latencyMetrics.length === 0) return null;

  const isTextType = type === "text";

  return (
    <div>
      <h2 className="text-base md:text-lg font-semibold mb-3">Overall Metrics</h2>
      {!isTextType && (
        <div className="flex gap-2 border-b border-border mb-4">
          <button
            onClick={() => setActiveTab("performance")}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "performance" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Performance
          </button>
          <button
            onClick={() => setActiveTab("latency")}
            className={`px-4 py-2 text-[13px] font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === "latency" ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Latency
          </button>
        </div>
      )}
      {(isTextType || activeTab === "performance") && regularMetrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {regularMetrics.map(([key, metric]) => (
            <div key={key} className="border border-border rounded-xl p-4 bg-muted/10">
              <div className="text-[12px] text-muted-foreground mb-1">{key}</div>
              <div className="text-[18px] font-semibold text-foreground">{Math.round(metric.mean * 100)}%</div>
            </div>
          ))}
        </div>
      )}
      {!isTextType && activeTab === "latency" && latencyMetrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {latencyMetrics.map(([key, metric]) => (
            <div key={key} className="border border-border rounded-xl p-4 bg-muted/10">
              <div className="text-[12px] text-muted-foreground mb-1">{key}</div>
              <div className="text-[18px] font-semibold text-foreground">
                {metric.mean < 1 ? `${(metric.mean * 1000).toFixed(0)}ms` : `${metric.mean.toFixed(2)}s`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { LATENCY_KEYS };
