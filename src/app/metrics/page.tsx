"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/AppLayout";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";

type MetricData = {
  uuid: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export default function MetricsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addMetricSidebarOpen, setAddMetricSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingMetricUuid, setEditingMetricUuid] = useState<string | null>(
    null
  );
  const [isLoadingMetric, setIsLoadingMetric] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);

  // Form fields
  const [metricName, setMetricName] = useState("");
  const [metricDescription, setMetricDescription] = useState("");

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [metricToDelete, setMetricToDelete] = useState<MetricData | null>(null);
  const [isMetricDeleting, setIsMetricDeleting] = useState(false);

  // Fetch metrics from backend
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setMetricsLoading(true);
        setMetricsError(null);
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!backendUrl) {
          throw new Error("BACKEND_URL environment variable is not set");
        }

        const response = await fetch(`${backendUrl}/metrics`, {
          method: "GET",
          headers: {
            accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }

        const data: MetricData[] = await response.json();
        setMetrics(data);
      } catch (err) {
        console.error("Error fetching metrics:", err);
        setMetricsError(
          err instanceof Error ? err.message : "Failed to load metrics"
        );
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  // Open delete confirmation dialog
  const openDeleteDialog = (metric: MetricData) => {
    setMetricToDelete(metric);
    setDeleteDialogOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    if (!isMetricDeleting) {
      setDeleteDialogOpen(false);
      setMetricToDelete(null);
    }
  };

  // Delete metric from backend
  const deleteMetric = async () => {
    if (!metricToDelete) return;

    try {
      setIsMetricDeleting(true);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("BACKEND_URL environment variable is not set");
      }

      const response = await fetch(
        `${backendUrl}/metrics/${metricToDelete.uuid}`,
        {
          method: "DELETE",
          headers: {
            accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete metric");
      }

      // Remove the metric from local state
      setMetrics(
        metrics.filter((metric) => metric.uuid !== metricToDelete.uuid)
      );
      closeDeleteDialog();
    } catch (err) {
      console.error("Error deleting metric:", err);
    } finally {
      setIsMetricDeleting(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setMetricName("");
    setMetricDescription("");
    setEditingMetricUuid(null);
    setCreateError(null);
    setValidationAttempted(false);
  };

  // Check if the name already exists (excluding current metric being edited)
  const isNameDuplicate = (name: string): boolean => {
    const trimmedName = name.trim().toLowerCase();
    return metrics.some(
      (m) =>
        m.name.toLowerCase() === trimmedName && m.uuid !== editingMetricUuid
    );
  };

  // Create metric via POST API
  const createMetric = async () => {
    setValidationAttempted(true);
    if (!metricName.trim() || isNameDuplicate(metricName)) return;

    try {
      setIsCreating(true);
      setCreateError(null);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("BACKEND_URL environment variable is not set");
      }

      const response = await fetch(`${backendUrl}/metrics`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          name: metricName.trim(),
          description: metricDescription.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create metric");
      }

      // Refetch the metrics list to get the updated data
      const metricsResponse = await fetch(`${backendUrl}/metrics`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (metricsResponse.ok) {
        const updatedMetrics: MetricData[] = await metricsResponse.json();
        setMetrics(updatedMetrics);
      }

      // Reset form fields and close sidebar
      resetForm();
      setAddMetricSidebarOpen(false);
    } catch (err) {
      console.error("Error creating metric:", err);
      setCreateError(
        err instanceof Error ? err.message : "Failed to create metric"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Fetch metric details by UUID and open edit sidebar
  const openEditMetric = async (uuid: string) => {
    try {
      setIsLoadingMetric(true);
      setEditingMetricUuid(uuid);
      setAddMetricSidebarOpen(true);
      setCreateError(null);

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("BACKEND_URL environment variable is not set");
      }

      const response = await fetch(`${backendUrl}/metrics/${uuid}`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch metric details");
      }

      const metricData: MetricData = await response.json();

      // Populate form fields with metric data
      setMetricName(metricData.name || "");
      setMetricDescription(metricData.description || "");
    } catch (err) {
      console.error("Error fetching metric:", err);
      setCreateError(
        err instanceof Error ? err.message : "Failed to load metric"
      );
    } finally {
      setIsLoadingMetric(false);
    }
  };

  // Update existing metric via PUT API
  const updateMetric = async () => {
    setValidationAttempted(true);
    if (!metricName.trim() || isNameDuplicate(metricName) || !editingMetricUuid)
      return;

    try {
      setIsCreating(true);
      setCreateError(null);
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error("BACKEND_URL environment variable is not set");
      }

      const response = await fetch(
        `${backendUrl}/metrics/${editingMetricUuid}`,
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            name: metricName.trim(),
            description: metricDescription.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update metric");
      }

      // Refetch the metrics list to get the updated data
      const metricsResponse = await fetch(`${backendUrl}/metrics`, {
        method: "GET",
        headers: {
          accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (metricsResponse.ok) {
        const updatedMetrics: MetricData[] = await metricsResponse.json();
        setMetrics(updatedMetrics);
      }

      // Reset and close
      resetForm();
      setAddMetricSidebarOpen(false);
    } catch (err) {
      console.error("Error updating metric:", err);
      setCreateError(
        err instanceof Error ? err.message : "Failed to update metric"
      );
    } finally {
      setIsCreating(false);
    }
  };

  // Filter metrics based on search query
  const filteredMetrics = metrics.filter(
    (metric) =>
      (metric.name &&
        metric.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (metric.description &&
        metric.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <AppLayout
      activeItem="metrics"
      onItemChange={(itemId) => router.push(`/${itemId}`)}
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Metrics</h1>
            <p className="text-muted-foreground text-base leading-relaxed mt-1">
              Understand and analyze the performance of your agents
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setAddMetricSidebarOpen(true);
            }}
            className="h-10 px-4 rounded-md text-base font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer"
          >
            Add metric
          </button>
        </div>

        {/* Search Input */}
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search metrics"
            className="w-full h-10 pl-10 pr-4 rounded-md text-base border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Metrics List / Loading / Error / Empty State */}
        {metricsLoading ? (
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
        ) : metricsError ? (
          <div className="border border-border rounded-xl p-12 flex flex-col items-center justify-center bg-muted/20">
            <p className="text-base text-red-500 mb-2">{metricsError}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-base text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : filteredMetrics.length === 0 ? (
          <div className="border border-border rounded-xl p-12 flex flex-col items-center justify-center bg-muted/20">
            <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              No metrics found
            </h3>
            <p className="text-base text-muted-foreground mb-4">
              {searchQuery
                ? "No metrics match your search"
                : "You haven't created any metrics yet"}
            </p>
            <button
              onClick={() => {
                resetForm();
                setAddMetricSidebarOpen(true);
              }}
              className="h-10 px-4 rounded-md text-base font-medium border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
            >
              Add metric
            </button>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-[1fr_2fr_auto] gap-4 px-4 py-2 border-b border-border bg-muted/30">
              <div className="text-sm font-medium text-muted-foreground">
                Name
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                Description
              </div>
              <div className="w-8"></div>
            </div>
            {/* Table Rows */}
            {filteredMetrics.map((metric) => (
              <div
                key={metric.uuid}
                onClick={() => openEditMetric(metric.uuid)}
                className="grid grid-cols-[1fr_2fr_auto] gap-4 px-4 py-2 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors cursor-pointer items-center"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {metric.name}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {metric.description || "—"}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDeleteDialog(metric);
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete metric"
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
                      d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Metric Sidebar */}
      {addMetricSidebarOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => {
              resetForm();
              setAddMetricSidebarOpen(false);
            }}
          />
          {/* Sidebar */}
          <div className="relative w-full max-w-xl bg-background border-l border-border flex flex-col h-full shadow-2xl">
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
                    d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                  />
                </svg>
                <h2 className="text-lg font-semibold">
                  {editingMetricUuid ? "Edit metric" : "Add metric"}
                </h2>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setAddMetricSidebarOpen(false);
                }}
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
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {isLoadingMetric ? (
                <div className="flex items-center justify-center py-12">
                  <svg
                    className="w-6 h-6 animate-spin"
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
              ) : (
                <>
                  {/* Metric name */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Metric name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={metricName}
                      placeholder="Enter the name of the metric"
                      onChange={(e) => setMetricName(e.target.value)}
                      className={`w-full h-10 px-4 rounded-md text-base border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent ${
                        validationAttempted &&
                        (!metricName.trim() || isNameDuplicate(metricName))
                          ? "border-red-500"
                          : "border-border"
                      }`}
                    />
                    {validationAttempted && isNameDuplicate(metricName) && (
                      <p className="text-sm text-red-500 mt-1">
                        A metric with this name already exists
                      </p>
                    )}
                  </div>

                  {/* Evaluation instructions */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <label className="block text-sm font-medium mb-1">
                      Evaluation instructions
                    </label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Describe how the agent should evaluate whether the
                      conversation was a success
                    </p>
                    <textarea
                      value={metricDescription}
                      onChange={(e) => setMetricDescription(e.target.value)}
                      placeholder="e.g., The agent should have collected the user's name and phone number"
                      className="flex-1 w-full px-4 py-3 rounded-md text-base border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none min-h-[200px]"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border space-y-3">
              {createError && (
                <p className="text-sm text-red-500">{createError}</p>
              )}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    resetForm();
                    setAddMetricSidebarOpen(false);
                  }}
                  disabled={isCreating || isLoadingMetric}
                  className="h-10 px-4 rounded-md text-base font-medium border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={editingMetricUuid ? updateMetric : createMetric}
                  disabled={isCreating || isLoadingMetric}
                  className="h-10 px-4 rounded-md text-base font-medium bg-white text-gray-900 hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
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
                      {editingMetricUuid ? "Saving..." : "Creating..."}
                    </>
                  ) : editingMetricUuid ? (
                    "Save"
                  ) : (
                    "Add metric"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={deleteMetric}
        title="Delete metric"
        message={`Are you sure you want to delete "${metricToDelete?.name}"?`}
        confirmText="Delete"
        isDeleting={isMetricDeleting}
      />
    </AppLayout>
  );
}
