"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  TestCaseOutput,
  TestCaseData,
  StatusIcon,
  CloseIcon,
  SpinnerIcon,
  TestDetailView,
  EmptyStateView,
} from "./test-results/shared";
import { StatusBadge } from "@/components/ui";
import { LeaderboardBarChart, getColorMap } from "./charts/LeaderboardBarChart";
import { DownloadableTable } from "./DownloadableTable";
import { POLLING_INTERVAL_MS } from "@/constants/polling";

type BenchmarkTestResult = {
  name?: string;
  passed: boolean | null; // null means still running
  output?: TestCaseOutput;
  test_case?: TestCaseData;
};

type ModelResult = {
  model: string;
  success: boolean | null; // null means still processing
  message: string;
  total_tests: number | null;
  passed: number | null;
  failed: number | null;
  test_results: BenchmarkTestResult[] | null;
};

type LeaderboardSummary = {
  model: string;
  test_config: string;
  overall: string;
};

type BenchmarkStatusResponse = {
  task_id: string;
  status: string;
  model_results?: ModelResult[];
  leaderboard_summary?: LeaderboardSummary[];
  results_s3_prefix?: string;
  error?: string;
};

type BenchmarkResultsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onGoBack?: () => void; // Called when user wants to go back to model selection on error
  agentUuid: string;
  agentName: string;
  testUuids: string[];
  testNames: string[];
  models: string[];
  taskId?: string; // If provided, view existing benchmark results instead of starting new
  onBenchmarkCreated?: (taskId: string) => void; // Called when a new benchmark is created
};

export function BenchmarkResultsDialog({
  isOpen,
  onClose,
  onGoBack,
  agentUuid,
  agentName,
  testUuids,
  testNames,
  models,
  taskId,
  onBenchmarkCreated,
}: BenchmarkResultsDialogProps) {
  const [activeTab, setActiveTab] = useState<"leaderboard" | "outputs">(
    "outputs"
  );
  // Track which providers are expanded
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(
    new Set()
  );
  // Track selected test: { model, testIndex }
  const [selectedTest, setSelectedTest] = useState<{
    model: string;
    testIndex: number;
  } | null>(null);

  // Loading and data state
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [taskStatus, setTaskStatus] = useState<string>("queued");
  const [modelResults, setModelResults] = useState<ModelResult[]>([]);
  const [leaderboardSummary, setLeaderboardSummary] = useState<
    LeaderboardSummary[] | undefined
  >(undefined);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isDone =
    taskStatus === "completed" ||
    taskStatus === "done" ||
    taskStatus === "failed";

  // Start benchmark when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Clear any existing polling interval first
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }

      setIsInitialLoading(true);
      setTaskStatus("queued");
      setModelResults([]);
      setLeaderboardSummary(undefined);
      setError(null);
      setExpandedProviders(new Set(models.length > 0 ? [models[0]] : []));
      setSelectedTest(null);
      setActiveTab("outputs");

      if (taskId) {
        // View existing benchmark - poll the task immediately
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (backendUrl) {
          pollingIntervalRef.current = setInterval(() => {
            pollBenchmarkStatus(taskId, backendUrl);
          }, POLLING_INTERVAL_MS);
          pollBenchmarkStatus(taskId, backendUrl);
        } else {
          setIsInitialLoading(false);
          setError("BACKEND_URL environment variable is not set");
        }
      } else if (testUuids.length > 0 && models.length > 0) {
        // Start a new benchmark
        runBenchmark();
      } else {
        setIsInitialLoading(false);
      }
    } else {
      // Dialog closed - clear polling
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    // Cleanup on unmount or when dependencies change
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, taskId]);

  const pollBenchmarkStatus = async (taskId: string, backendUrl: string) => {
    try {
      const response = await fetch(
        `${backendUrl}/agent-tests/benchmark/${taskId}`,
        {
          method: "GET",
          headers: {
            accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to poll benchmark status");
      }

      const result: BenchmarkStatusResponse = await response.json();

      // Update task status for display
      setTaskStatus(result.status);

      // Update model results (intermediate or final)
      if (result.model_results) {
        setModelResults(result.model_results);

        // Auto-expand the first provider that has results
        if (result.model_results.length > 0) {
          setExpandedProviders((prev) => {
            if (prev.size === 0) {
              const firstWithResults = result.model_results!.find(
                (m) => m.test_results && m.test_results.length > 0
              );
              if (firstWithResults) {
                return new Set([firstWithResults.model]);
              }
            }
            return prev;
          });
        }
      }

      // After first response, we're no longer in initial loading
      setIsInitialLoading(false);

      // Check if polling should stop
      if (
        result.status === "completed" ||
        result.status === "failed" ||
        result.status === "done"
      ) {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        if (result.error) {
          setError(result.error);
        } else {
          setLeaderboardSummary(result.leaderboard_summary);
          // Switch to leaderboard tab when done
          setActiveTab("leaderboard");
        }
      }
    } catch (err) {
      console.error("Error polling benchmark status:", err);
      setIsInitialLoading(false);
      setTaskStatus("failed");
      setError(err instanceof Error ? err.message : "Failed to poll status");
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  };

  const runBenchmark = async () => {
    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      setIsInitialLoading(false);
      setError("BACKEND_URL environment variable is not set");
      return;
    }

    try {
      const response = await fetch(
        `${backendUrl}/agent-tests/agent/${agentUuid}/benchmark`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            test_uuids: testUuids,
            models: models,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start benchmark");
      }

      const result: BenchmarkStatusResponse = await response.json();
      const newTaskId = result.task_id;

      // Notify parent about the new benchmark
      if (onBenchmarkCreated) {
        onBenchmarkCreated(newTaskId);
      }

      // Start polling
      pollingIntervalRef.current = setInterval(() => {
        pollBenchmarkStatus(newTaskId, backendUrl);
      }, POLLING_INTERVAL_MS);

      // Also poll immediately
      pollBenchmarkStatus(newTaskId, backendUrl);
    } catch (err) {
      console.error("Error starting benchmark:", err);
      setIsInitialLoading(false);
      setError(
        err instanceof Error ? err.message : "Failed to start benchmark"
      );
    }
  };

  const toggleProvider = (model: string) => {
    setExpandedProviders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(model)) {
        newSet.delete(model);
      } else {
        newSet.add(model);
      }
      return newSet;
    });
  };

  const handleTestSelect = (model: string, testIndex: number) => {
    setSelectedTest({ model, testIndex });
  };

  // Get the selected test result
  const getSelectedTestResult = (): BenchmarkTestResult | null => {
    if (!selectedTest) return null;
    const modelResult = modelResults.find(
      (m) => m.model === selectedTest.model
    );
    if (!modelResult?.test_results) return null;
    return modelResult.test_results[selectedTest.testIndex] || null;
  };

  // Get providers to display (includes placeholders for models without results yet)
  const getProvidersToDisplay = (): ModelResult[] => {
    // When in progress and no results yet, show all models as placeholders
    if (!isDone && modelResults.length === 0 && models.length > 0) {
      return models.map((model) => ({
        model,
        success: null,
        message: "",
        total_tests: testNames.length,
        passed: null,
        failed: null,
        test_results: null,
      }));
    }

    // When in progress with some results, merge with missing models
    if (!isDone && models.length > 0) {
      const existingModels = new Set(modelResults.map((m) => m.model));
      const missingModels = models.filter((m) => !existingModels.has(m));
      if (missingModels.length > 0) {
        const placeholders: ModelResult[] = missingModels.map((model) => ({
          model,
          success: null,
          message: "",
          total_tests: testNames.length,
          passed: null,
          failed: null,
          test_results: null,
        }));
        return [...modelResults, ...placeholders];
      }
    }

    return modelResults;
  };

  const providersToDisplay = getProvidersToDisplay();

  if (!isOpen) return null;

  const selectedTestResult = getSelectedTestResult();

  // Get color map for charts
  const modelNames = leaderboardSummary?.map((s) => s.model) || [];
  const colorMap = getColorMap(modelNames);

  // Check if we have any results to show
  const hasAnyResults = modelResults.some(
    (m) => m.test_results && m.test_results.length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Benchmark for {agentName}
            </h2>
            {!isDone && !isInitialLoading && (
              <StatusBadge status={taskStatus} showSpinner />
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Rerun button - show when benchmark is complete (not loading and no error) */}
            {isDone && !error && onGoBack && (
              <button
                onClick={onGoBack}
                className="flex items-center gap-2 h-8 px-3 rounded-md text-sm font-medium border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
                Rerun
              </button>
            )}
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted transition-colors cursor-pointer"
            >
              <CloseIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Initial Loading State */}
        {isInitialLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <SpinnerIcon className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {taskStatus === "queued"
                  ? "Benchmark queued"
                  : "Starting benchmark"}
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isInitialLoading && error && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 max-w-md">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
                <span className="font-medium text-red-500">Error</span>
              </div>
              <p className="text-sm text-red-400 mb-4">{error}</p>
              {onGoBack && (
                <button
                  onClick={onGoBack}
                  className="w-full h-10 px-4 rounded-md text-sm font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                    />
                  </svg>
                  Try again
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tab Navigation - Only show when done */}
        {!isInitialLoading && !error && isDone && (
          <div className="px-6 border-b border-border">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("leaderboard")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "leaderboard"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setActiveTab("outputs")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === "outputs"
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Outputs
              </button>
            </div>
          </div>
        )}

        {/* Content - Show after initial loading */}
        {!isInitialLoading && !error && (
          <div className="flex-1 overflow-hidden">
            {/* Leaderboard Tab - Only when done */}
            {isDone && activeTab === "leaderboard" && (
              <div className="p-6 space-y-6 overflow-y-auto h-full">
                {/* Leaderboard Table */}
                {leaderboardSummary && leaderboardSummary.length > 0 && (
                  <DownloadableTable
                    columns={[
                      {
                        key: "model",
                        header: "Model",
                        render: (value) => value.replace("__", "/"),
                      },
                      { key: "overall", header: "Test pass rate (%)" },
                    ]}
                    data={leaderboardSummary.map((s) => ({
                      model: s.model,
                      overall: s.overall,
                    }))}
                    filename={`benchmark-leaderboard-${agentName}`}
                  />
                )}

                {/* Charts Section */}
                {leaderboardSummary && leaderboardSummary.length > 0 && (
                  <LeaderboardBarChart
                    title="Test pass rate (%)"
                    data={leaderboardSummary.map((s) => ({
                      label: s.model.replace("__", "/"),
                      value: parseFloat(s.overall),
                      colorKey: s.model,
                    }))}
                    yDomain={[0, 100]}
                    formatTooltip={(value) => `${value.toFixed(1)}%`}
                    colorMap={colorMap}
                  />
                )}

                {/* Empty State */}
                {(!leaderboardSummary || leaderboardSummary.length === 0) && (
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">
                      No leaderboard data available
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Outputs Tab - Show during progress and when outputs tab is active when done */}
            {(!isDone || activeTab === "outputs") && (
              <div className="flex h-full">
                {/* Left Panel - Provider Toggles with Tests */}
                <div className="w-96 border-r border-border flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto">
                    {providersToDisplay.length > 0 ? (
                      providersToDisplay.map((modelResult) => (
                        <ProviderSection
                          key={modelResult.model}
                          modelResult={modelResult}
                          isExpanded={expandedProviders.has(modelResult.model)}
                          onToggle={() => toggleProvider(modelResult.model)}
                          selectedTest={selectedTest}
                          onTestSelect={(testIndex) =>
                            handleTestSelect(modelResult.model, testIndex)
                          }
                          testNames={testNames}
                        />
                      ))
                    ) : (
                      <div className="p-4 text-sm text-muted-foreground">
                        Waiting for results...
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Panel - Test Details */}
                <div className="flex-1 overflow-y-auto">
                  {selectedTestResult ? (
                    selectedTestResult.passed === null ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="flex items-center gap-3">
                          <SpinnerIcon className="w-5 h-5 animate-spin text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Running test...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <TestDetailView
                        history={selectedTestResult.test_case?.history || []}
                        output={selectedTestResult.output}
                        passed={selectedTestResult.passed}
                      />
                    )
                  ) : (
                    <EmptyStateView message="Select a test to view details" />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Provider Section Component with toggle and test list
function ProviderSection({
  modelResult,
  isExpanded,
  onToggle,
  selectedTest,
  onTestSelect,
  testNames,
}: {
  modelResult: ModelResult;
  isExpanded: boolean;
  onToggle: () => void;
  selectedTest: { model: string; testIndex: number } | null;
  onTestSelect: (testIndex: number) => void;
  testNames: string[];
}) {
  const isProcessing = modelResult.success === null;
  const hasResults =
    modelResult.test_results && modelResult.test_results.length > 0;

  // Get test status counts
  const passedCount = modelResult.passed ?? 0;
  const failedCount = modelResult.failed ?? 0;
  const totalTests = modelResult.total_tests ?? testNames.length;

  return (
    <div className="border-b border-border">
      {/* Provider Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Expand/Collapse Icon */}
          <svg
            className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${
              isExpanded ? "rotate-90" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
          {/* Provider Name */}
          <span className="text-sm font-medium text-foreground truncate">
            {modelResult.model.replace("__", "/")}
          </span>
          {/* Processing Spinner */}
          {isProcessing && (
            <SpinnerIcon className="w-3.5 h-3.5 animate-spin text-yellow-500 flex-shrink-0" />
          )}
        </div>
        {/* Stats */}
        {!isProcessing && modelResult.success !== null && (
          <div className="flex items-center gap-2 text-xs flex-shrink-0">
            {passedCount > 0 && (
              <span className="text-green-500">{passedCount} passed</span>
            )}
            {failedCount > 0 && (
              <span className="text-red-500">{failedCount} failed</span>
            )}
          </div>
        )}
      </button>

      {/* Test List */}
      {isExpanded && (
        <div className="px-4 pb-3">
          {hasResults ? (
            <div className="space-y-1 ml-4">
              {modelResult.test_results!.map((testResult, index) => {
                const isSelected =
                  selectedTest?.model === modelResult.model &&
                  selectedTest?.testIndex === index;
                const testName =
                  testResult.name ||
                  testResult.test_case?.name ||
                  testNames[index] ||
                  `Test ${index + 1}`;

                return (
                  <div
                    key={index}
                    onClick={() => onTestSelect(index)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                  >
                    <StatusIcon
                      status={
                        testResult.passed === null
                          ? "running"
                          : testResult.passed
                          ? "passed"
                          : "failed"
                      }
                    />
                    <span className="text-sm text-foreground truncate">
                      {testName}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : isProcessing && testNames.length > 0 ? (
            // Show test names with yellow running dots while processing
            <div className="space-y-1 ml-4">
              {testNames.map((testName, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                >
                  <StatusIcon status="running" />
                  <span className="text-sm text-foreground truncate">
                    {testName || `Test ${index + 1}`}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="ml-4 px-3 py-2 text-sm text-muted-foreground">
              {isProcessing ? "Processing..." : "No test results"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
