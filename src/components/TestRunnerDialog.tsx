"use client";

import React, { useState, useEffect, useRef } from "react";

type TestData = {
  uuid: string;
  name: string;
  description: string;
  type: "response" | "tool_call";
  config: Record<string, any>;
  created_at: string;
  updated_at: string;
};

type ChatMessage = {
  role: "user" | "agent" | "tool";
  content: string;
  tool_name?: string;
  tool_args?: Record<string, any>;
};

type TestResult = {
  test: TestData;
  status: "pending" | "running" | "passed" | "failed";
  chatHistory?: ChatMessage[];
  output?: TestCaseOutput;
  testCase?: TestCaseData;
  evaluation?: {
    passed: boolean;
    message?: string;
    details?: Record<string, any>;
  };
  error?: string;
};

type ToolCallOutput = {
  tool: string;
  arguments: Record<string, any>;
};

type TestCaseOutput = {
  response?: string;
  tool_calls?: ToolCallOutput[];
};

type TestCaseHistory = {
  role: "assistant" | "user" | "tool";
  content?: string;
  tool_calls?: Array<{
    id: string;
    function: {
      name: string;
      arguments: string;
    };
    type: string;
  }>;
  tool_call_id?: string;
};

type TestCaseData = {
  history?: TestCaseHistory[];
  evaluation?: {
    type: string;
    tool_calls?: Array<{
      tool: string;
      arguments: Record<string, any> | null;
    }>;
    criteria?: string;
  };
};

type TestCaseResult = {
  test_uuid?: string;
  test_name?: string;
  status?: "passed" | "failed" | "error";
  passed?: boolean;
  output?: TestCaseOutput;
  test_case?: TestCaseData;
  chat_history?: ChatMessage[];
  evaluation?: {
    passed: boolean;
    message?: string;
    details?: Record<string, any>;
  };
  error?: string;
};

type TestRunStatusResponse = {
  task_id: string;
  status: string;
  total_tests?: number;
  passed?: number;
  failed?: number;
  results?: TestCaseResult[];
  results_s3_prefix?: string;
  error?: string;
};

type TestRunnerDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  agentUuid: string;
  agentName: string;
  tests: TestData[];
};

export function TestRunnerDialog({
  isOpen,
  onClose,
  agentUuid,
  agentName,
  tests,
}: TestRunnerDialogProps) {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [selectedTestUuid, setSelectedTestUuid] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Initialize test results and start running tests when dialog opens
  useEffect(() => {
    if (isOpen && tests.length > 0) {
      const initialResults: TestResult[] = tests.map((test) => ({
        test,
        status: "pending",
      }));
      setTestResults(initialResults);
      setSelectedTestUuid(null);
      setCurrentTaskId(null);

      // Start running tests immediately after dialog opens
      // Use setTimeout to ensure state is set before running
      setTimeout(() => {
        runAllTests(initialResults);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tests]);

  const pollTaskStatus = async (taskId: string, backendUrl: string) => {
    try {
      const response = await fetch(`${backendUrl}/agent-tests/run/${taskId}`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to poll task status");
      }

      const result: TestRunStatusResponse = await response.json();

      // Update test results based on polling response
      if (result.results && result.results.length > 0) {
        setTestResults((prev) => {
          // Try to match by test_uuid first, if no match found, update by index
          const updatedResults: TestResult[] = prev.map((r, index) => {
            // First try to find by UUID
            let apiResult = result.results?.find(
              (res) => res.test_uuid === r.test.uuid
            );

            // If no UUID match, try to find by test name
            if (!apiResult) {
              apiResult = result.results?.find(
                (res) => res.test_name === r.test.name
              );
            }

            // If still no match and index is within range, use index-based matching
            if (!apiResult && result.results && index < result.results.length) {
              apiResult = result.results[index];
            }

            if (apiResult) {
              // Check both `passed` boolean and `status` string for compatibility
              const isPassed =
                apiResult.passed === true || apiResult.status === "passed";
              const newStatus: "passed" | "failed" = isPassed
                ? "passed"
                : "failed";
              return {
                ...r,
                status: newStatus,
                chatHistory: apiResult.chat_history,
                output: apiResult.output,
                testCase: apiResult.test_case,
                evaluation: apiResult.evaluation ?? { passed: isPassed },
                error: apiResult.error,
              };
            }
            return r;
          });
          return updatedResults;
        });
      }

      // Check if polling should stop
      if (
        result.status === "completed" ||
        result.status === "failed" ||
        result.status === "done"
      ) {
        setIsRunning(false);
        setCurrentTaskId(null);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }

        // If there's an overall error, update remaining pending tests
        if (result.error) {
          setTestResults((prev) =>
            prev.map((r) =>
              r.status === "pending" || r.status === "running"
                ? { ...r, status: "failed", error: result.error }
                : r
            )
          );
        }
      }
    } catch (error) {
      console.error("Error polling task status:", error);
      setIsRunning(false);
      setCurrentTaskId(null);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }
  };

  const runAllTests = async (initialResults: TestResult[]) => {
    setIsRunning(true);

    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL environment variable is not set");
      setIsRunning(false);
      return;
    }

    // Set all tests to running
    setTestResults((prev) => prev.map((r) => ({ ...r, status: "running" })));

    try {
      // Collect all test UUIDs
      const testUuids = initialResults.map((r) => r.test.uuid);

      // Make batch API call
      const response = await fetch(
        `${backendUrl}/agent-tests/agent/${agentUuid}/run`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            test_uuids: testUuids,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to start test run");
      }

      const result: TestRunStatusResponse = await response.json();
      const taskId = result.task_id;
      setCurrentTaskId(taskId);

      // Start polling immediately
      pollingIntervalRef.current = setInterval(() => {
        pollTaskStatus(taskId, backendUrl);
      }, 2000);

      // Also poll immediately to get the first result
      pollTaskStatus(taskId, backendUrl);
    } catch (error) {
      console.error("Error starting test run:", error);
      setTestResults((prev) =>
        prev.map((r) => ({
          ...r,
          status: "failed",
          error:
            error instanceof Error ? error.message : "Failed to start test run",
        }))
      );
      setIsRunning(false);
    }
  };

  const retryTest = async (testUuid: string) => {
    const testResult = testResults.find((r) => r.test.uuid === testUuid);
    if (!testResult) return;

    // Update status to running
    setTestResults((prev) =>
      prev.map((r) =>
        r.test.uuid === testUuid
          ? { ...r, status: "running", error: undefined }
          : r
      )
    );

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      setTestResults((prev) =>
        prev.map((r) =>
          r.test.uuid === testUuid
            ? {
                ...r,
                status: "failed",
                error: "BACKEND_URL environment variable is not set",
              }
            : r
        )
      );
      return;
    }

    try {
      // Make API call for single test retry
      const response = await fetch(
        `${backendUrl}/agent-tests/agent/${agentUuid}/run`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            test_uuids: [testUuid],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to retry test");
      }

      const result: TestRunStatusResponse = await response.json();

      // Poll for this single test result
      const pollSingleTest = async () => {
        try {
          const pollResponse = await fetch(
            `${backendUrl}/agent-tests/run/${result.task_id}`,
            {
              method: "GET",
              headers: {
                accept: "application/json",
                "ngrok-skip-browser-warning": "true",
              },
            }
          );

          if (!pollResponse.ok) {
            throw new Error("Failed to poll task status");
          }

          const pollResult: TestRunStatusResponse = await pollResponse.json();

          if (
            pollResult.status === "completed" ||
            pollResult.status === "done" ||
            pollResult.status === "failed"
          ) {
            const apiResult = pollResult.results?.find(
              (res) => res.test_uuid === testUuid
            );
            if (apiResult) {
              setTestResults((prev) =>
                prev.map((r) =>
                  r.test.uuid === testUuid
                    ? {
                        ...r,
                        status:
                          apiResult.status === "passed" ? "passed" : "failed",
                        chatHistory: apiResult.chat_history,
                        evaluation: apiResult.evaluation,
                        error: apiResult.error,
                      }
                    : r
                )
              );
            } else if (pollResult.error) {
              setTestResults((prev) =>
                prev.map((r) =>
                  r.test.uuid === testUuid
                    ? { ...r, status: "failed", error: pollResult.error }
                    : r
                )
              );
            }
          } else {
            // Continue polling
            setTimeout(pollSingleTest, 2000);
          }
        } catch (error) {
          setTestResults((prev) =>
            prev.map((r) =>
              r.test.uuid === testUuid
                ? {
                    ...r,
                    status: "failed",
                    error:
                      error instanceof Error ? error.message : "Test failed",
                  }
                : r
            )
          );
        }
      };

      // Start polling for single test
      if (result.status === "in_progress" || result.status === "pending") {
        setTimeout(pollSingleTest, 2000);
      } else if (result.status === "completed" || result.status === "done") {
        const apiResult = result.results?.find(
          (res) => res.test_uuid === testUuid
        );
        if (apiResult) {
          setTestResults((prev) =>
            prev.map((r) =>
              r.test.uuid === testUuid
                ? {
                    ...r,
                    status: apiResult.status === "passed" ? "passed" : "failed",
                    chatHistory: apiResult.chat_history,
                    evaluation: apiResult.evaluation,
                    error: apiResult.error,
                  }
                : r
            )
          );
        }
      }
    } catch (error) {
      setTestResults((prev) =>
        prev.map((r) =>
          r.test.uuid === testUuid
            ? {
                ...r,
                status: "failed",
                error: error instanceof Error ? error.message : "Test failed",
              }
            : r
        )
      );
    }
  };

  const retryAllFailed = async () => {
    const failedTests = testResults.filter((r) => r.status === "failed");
    if (failedTests.length === 0) return;

    setIsRunning(true);

    // Clear any existing polling interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.error("BACKEND_URL environment variable is not set");
      setIsRunning(false);
      return;
    }

    // Set failed tests to running
    setTestResults((prev) =>
      prev.map((r) =>
        r.status === "failed"
          ? { ...r, status: "running", error: undefined }
          : r
      )
    );

    try {
      const testUuids = failedTests.map((r) => r.test.uuid);

      const response = await fetch(
        `${backendUrl}/agent-tests/agent/${agentUuid}/run`,
        {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            test_uuids: testUuids,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to retry failed tests");
      }

      const result: TestRunStatusResponse = await response.json();
      setCurrentTaskId(result.task_id);

      if (result.status === "in_progress" || result.status === "pending") {
        pollingIntervalRef.current = setInterval(() => {
          pollTaskStatus(result.task_id, backendUrl);
        }, 2000);
      } else if (result.status === "completed" || result.status === "done") {
        if (result.results && result.results.length > 0) {
          setTestResults((prev) =>
            prev.map((r) => {
              const apiResult = result.results?.find(
                (res) => res.test_uuid === r.test.uuid
              );
              if (apiResult) {
                return {
                  ...r,
                  status: apiResult.status === "passed" ? "passed" : "failed",
                  chatHistory: apiResult.chat_history,
                  evaluation: apiResult.evaluation,
                  error: apiResult.error,
                };
              }
              return r;
            })
          );
        }
        setIsRunning(false);
      }
    } catch (error) {
      console.error("Error retrying failed tests:", error);
      setTestResults((prev) =>
        prev.map((r) =>
          r.status === "running"
            ? {
                ...r,
                status: "failed",
                error:
                  error instanceof Error
                    ? error.message
                    : "Failed to retry tests",
              }
            : r
        )
      );
      setIsRunning(false);
    }
  };

  const retryAll = async () => {
    // Reset all tests to pending
    setTestResults((prev) =>
      prev.map((r) => ({ ...r, status: "pending", error: undefined }))
    );

    const resetResults = testResults.map((r) => ({
      ...r,
      status: "pending" as const,
    }));
    await runAllTests(resetResults);
  };

  const selectedResult = testResults.find(
    (r) => r.test.uuid === selectedTestUuid
  );

  const passedTests = testResults.filter((r) => r.status === "passed");
  const failedTests = testResults.filter((r) => r.status === "failed");
  const pendingTests = testResults.filter(
    (r) => r.status === "pending" || r.status === "running"
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Test Status for {agentName}
          </h2>
          <div className="flex items-center gap-3">
            {/* Passed/Failed counts */}
            {!isRunning &&
              testResults.length > 0 &&
              (passedTests.length > 0 || failedTests.length > 0) && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className="text-muted-foreground">
                      {passedTests.length} passed
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-muted-foreground">
                      {failedTests.length} failed
                    </span>
                  </div>
                </div>
              )}
            <button
              onClick={onClose}
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
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Test List */}
          <div className="w-80 border-r border-border flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              {/* Failed Tests - Always shown first */}
              {failedTests.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    Failed ({failedTests.length})
                  </h3>
                  <div className="space-y-1">
                    {failedTests.map((result) => (
                      <TestListItem
                        key={result.test.uuid}
                        result={result}
                        isSelected={selectedTestUuid === result.test.uuid}
                        onSelect={() => setSelectedTestUuid(result.test.uuid)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Passed Tests */}
              {passedTests.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    Passed ({passedTests.length})
                  </h3>
                  <div className="space-y-1">
                    {passedTests.map((result) => (
                      <TestListItem
                        key={result.test.uuid}
                        result={result}
                        isSelected={selectedTestUuid === result.test.uuid}
                        onSelect={() => setSelectedTestUuid(result.test.uuid)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Pending/Running Tests */}
              {pendingTests.length > 0 && (
                <div className="p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                    {isRunning ? "Running" : "Pending"} ({pendingTests.length})
                  </h3>
                  <div className="space-y-1">
                    {pendingTests.map((result) => (
                      <TestListItem
                        key={result.test.uuid}
                        result={result}
                        isSelected={selectedTestUuid === result.test.uuid}
                        onSelect={() => setSelectedTestUuid(result.test.uuid)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Test Details */}
          <div className="flex-1 overflow-y-auto">
            {selectedResult ? (
              <TestDetailView result={selectedResult} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
                      />
                    </svg>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Select a test to view details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Test List Item Component
function TestListItem({
  result,
  isSelected,
  onSelect,
}: {
  result: TestResult;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isSelected ? "bg-muted" : "hover:bg-muted/50"
      }`}
    >
      {/* Status Icon */}
      {result.status === "passed" && (
        <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-3 h-3 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}
      {result.status === "failed" && (
        <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-3 h-3 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
      )}
      {result.status === "running" && (
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4 h-4 animate-spin text-muted-foreground"
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
      {result.status === "pending" && (
        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4 h-4 animate-spin text-muted-foreground"
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

      <span className="text-sm text-foreground truncate">
        {result.test.name}
      </span>
    </div>
  );
}

// Test Detail View Component
function TestDetailView({ result }: { result: TestResult }) {
  if (result.status === "pending") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Test is pending</p>
      </div>
    );
  }

  if (result.status === "running") {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex items-center gap-3">
          <svg
            className="w-5 h-5 animate-spin text-muted-foreground"
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
          <p className="text-muted-foreground">Running test...</p>
        </div>
      </div>
    );
  }

  if (result.error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
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
          <p className="text-sm text-red-400">{result.error}</p>
        </div>
      </div>
    );
  }

  // Get history from testCase
  const history = result.testCase?.history || [];
  const output = result.output;

  return (
    <div className="p-6 space-y-6">
      {/* Chat History from test_case.history */}
      {history.length > 0 && (
        <div className="space-y-4">
          <div className="space-y-4">
            {history.map((message, index) => (
              <div
                key={index}
                className={`space-y-1 ${
                  message.role === "user" ? "flex flex-col items-end" : ""
                }`}
              >
                {/* User Message */}
                {message.role === "user" && (
                  <div className="max-w-[80%]">
                    <div className="px-4 py-3 rounded-2xl bg-[#242426] border border-[#444]">
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                )}

                {/* Agent Message (text response) */}
                {message.role === "assistant" && !message.tool_calls && (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        Agent
                      </span>
                    </div>
                    <div className="max-w-[80%]">
                      <div className="px-4 py-3 rounded-2xl bg-muted/30 border border-border">
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Agent Tool Call from history */}
                {message.role === "assistant" &&
                  message.tool_calls &&
                  message.tool_calls.length > 0 && (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          Agent Tool Call
                        </span>
                      </div>
                      <div className="max-w-[80%]">
                        {message.tool_calls.map((toolCall, tcIndex) => {
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
                              key={tcIndex}
                              className="bg-muted/20 border border-border rounded-2xl p-4"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <svg
                                  className="w-4 h-4 text-muted-foreground"
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
                                <span className="text-sm font-medium text-foreground">
                                  {toolCall.function.name}
                                </span>
                              </div>
                              {Object.keys(parsedArgs).length > 0 && (
                                <div className="space-y-2 mt-3">
                                  {Object.entries(parsedArgs).map(
                                    ([paramName, paramValue]) => (
                                      <div key={paramName}>
                                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                                          {paramName}
                                        </label>
                                        <div className="px-3 py-2 rounded-lg text-sm bg-background border border-border text-foreground">
                                          {typeof paramValue === "object"
                                            ? JSON.stringify(paramValue)
                                            : String(paramValue)}
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
                    </>
                  )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Output Section - Agent's Response/Tool Call */}
      {output && (
        <div className="space-y-4">
          {/* Text Response */}
          {output.response && (
            <div
              className={`${
                result.evaluation?.passed
                  ? "border-l-4 border-l-green-500 pl-3"
                  : "border-l-4 border-l-red-500 pl-3"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">
                  Agent
                </span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    result.evaluation?.passed
                      ? "bg-green-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {result.evaluation?.passed ? (
                    <svg
                      className="w-2.5 h-2.5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-2.5 h-2.5 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="max-w-[80%]">
                <div className="px-4 py-3 rounded-2xl bg-muted/30 border border-border">
                  <p className="text-sm text-foreground whitespace-pre-wrap">
                    {output.response}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tool Calls Output */}
          {output.tool_calls && output.tool_calls.length > 0 && (
            <div
              className={`${
                result.evaluation?.passed
                  ? "border-l-4 border-l-green-500 pl-3"
                  : "border-l-4 border-l-red-500 pl-3"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-foreground">
                  Agent Tool Call
                </span>
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    result.evaluation?.passed
                      ? "bg-green-500/20"
                      : "bg-red-500/20"
                  }`}
                >
                  {result.evaluation?.passed ? (
                    <svg
                      className="w-2.5 h-2.5 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-2.5 h-2.5 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {output.tool_calls.map((toolCall, index) => (
                  <div
                    key={index}
                    className="max-w-[80%] bg-muted/20 border border-border rounded-2xl p-4"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <svg
                        className="w-4 h-4 text-muted-foreground"
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
                      <span className="text-sm font-medium text-foreground">
                        {toolCall.tool}
                      </span>
                    </div>
                    {toolCall.arguments &&
                      Object.keys(toolCall.arguments).length > 0 && (
                        <div className="space-y-2 mt-3">
                          {Object.entries(toolCall.arguments).map(
                            ([paramName, paramValue]) => (
                              <div key={paramName}>
                                <label className="block text-xs font-medium text-muted-foreground mb-1">
                                  {paramName}
                                </label>
                                <div className="px-3 py-2 rounded-lg text-sm bg-background border border-border text-foreground">
                                  {typeof paramValue === "object"
                                    ? JSON.stringify(paramValue)
                                    : String(paramValue)}
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Show empty state if no history and no output */}
      {history.length === 0 && !output && (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">
            No conversation history available for this test
          </p>
        </div>
      )}
    </div>
  );
}
