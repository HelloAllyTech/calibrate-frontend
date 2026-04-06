"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAccessToken } from "@/hooks";
import { AppLayout } from "@/components/AppLayout";
import { useSidebarState } from "@/lib/sidebar";
import {
  listDatasets,
  createDataset,
  deleteDataset,
  renameDataset,
  Dataset,
  DatasetType,
} from "@/lib/datasets";
import { DeleteConfirmationDialog } from "@/components/DeleteConfirmationDialog";

export default function DatasetsPage() {
  const router = useRouter();
  const accessToken = useAccessToken();
  const [sidebarOpen, setSidebarOpen] = useSidebarState();

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create dataset modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<DatasetType>("stt");
  const [isCreating, setIsCreating] = useState(false);

  // Rename state
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);

  // Delete state
  const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    document.title = "Datasets | Calibrate";
  }, []);

  const fetchDatasets = useCallback(async () => {
    if (!accessToken) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await listDatasets(accessToken);
      setDatasets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load datasets");
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const handleCreate = async () => {
    if (!accessToken || !newName.trim()) return;
    setIsCreating(true);
    try {
      const dataset = await createDataset(accessToken, newName.trim(), newType);
      setDatasets((prev) => [dataset, ...prev]);
      setShowCreateModal(false);
      setNewName("");
      setNewType("stt");
    } catch (err) {
      console.error("Failed to create dataset:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameSubmit = async (datasetId: string) => {
    if (!accessToken || !renameValue.trim()) return;
    setIsRenaming(true);
    try {
      const updated = await renameDataset(accessToken, datasetId, renameValue.trim());
      setDatasets((prev) =>
        prev.map((d) => (d.uuid === datasetId ? { ...d, name: updated.name } : d))
      );
      setRenamingId(null);
    } catch (err) {
      console.error("Failed to rename dataset:", err);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async (datasetId: string) => {
    if (!accessToken) return;
    setIsDeleting(true);
    try {
      await deleteDataset(accessToken, datasetId);
      setDatasets((prev) => prev.filter((d) => d.uuid !== datasetId));
      setDeleteDialogId(null);
    } catch (err) {
      console.error("Failed to delete dataset:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString.replace(" ", "T")).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  const datasetToDelete = datasets.find((d) => d.uuid === deleteDialogId);

  return (
    <AppLayout
      activeItem="datasets"
      onItemChange={(itemId) => router.push(`/${itemId}`)}
      sidebarOpen={sidebarOpen}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
    >
      <div className="space-y-4 md:space-y-6 py-4 md:py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold">Datasets</h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-1">
              Manage reusable input collections for STT and TTS evaluations
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9 md:h-10 px-4 rounded-md text-sm md:text-base font-medium bg-foreground text-background hover:opacity-90 transition-opacity cursor-pointer flex-shrink-0"
          >
            New dataset
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-3 py-8">
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : error ? (
          <div className="border border-border rounded-xl p-8 flex flex-col items-center justify-center bg-muted/20">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button
              onClick={fetchDatasets}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : datasets.length === 0 ? (
          <div className="border border-border rounded-xl p-8 md:p-12 flex flex-col items-center justify-center bg-muted/20">
            <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-semibold mb-1">No datasets yet</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Create a dataset to reuse inputs across evaluations
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-9 px-4 rounded-md text-sm font-medium border border-border bg-background hover:bg-muted/50 transition-colors cursor-pointer"
            >
              New dataset
            </button>
          </div>
        ) : (
          <div className="border border-border rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-[1fr_100px_80px_1fr_80px] gap-4 px-4 py-2 border-b border-border bg-muted/30">
              <div className="text-sm font-medium text-muted-foreground">Name</div>
              <div className="text-sm font-medium text-muted-foreground">Type</div>
              <div className="text-sm font-medium text-muted-foreground">Items</div>
              <div className="text-sm font-medium text-muted-foreground">Created</div>
              <div className="text-sm font-medium text-muted-foreground">Actions</div>
            </div>

            {datasets.map((dataset) => (
              <div
                key={dataset.uuid}
                className="flex flex-col md:grid md:grid-cols-[1fr_100px_80px_1fr_80px] gap-2 md:gap-4 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
              >
                {/* Name */}
                <div className="flex items-center">
                  {renamingId === dataset.uuid ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleRenameSubmit(dataset.uuid);
                      }}
                      className="flex items-center gap-2 w-full"
                    >
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-foreground/30"
                        disabled={isRenaming}
                      />
                      <button
                        type="submit"
                        disabled={isRenaming || !renameValue.trim()}
                        className="text-xs px-2 py-1 rounded bg-foreground text-background hover:opacity-80 disabled:opacity-40 cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setRenamingId(null)}
                        className="text-xs px-2 py-1 rounded border border-border hover:bg-muted/50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      onClick={() => router.push(`/datasets/${dataset.uuid}`)}
                      className="text-sm font-medium text-foreground hover:underline text-left cursor-pointer"
                    >
                      {dataset.name}
                    </button>
                  )}
                </div>

                {/* Type badge */}
                <div className="flex items-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-foreground uppercase">
                    {dataset.dataset_type}
                  </span>
                </div>

                {/* Item count */}
                <div className="flex items-center">
                  <span className="text-sm text-foreground">{dataset.item_count}</span>
                </div>

                {/* Created at */}
                <div className="flex items-center">
                  <span className="text-sm text-muted-foreground">{formatDate(dataset.created_at)}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    title="Rename"
                    onClick={() => {
                      setRenamingId(dataset.uuid);
                      setRenameValue(dataset.name);
                    }}
                    className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    title="Delete"
                    onClick={() => setDeleteDialogId(dataset.uuid)}
                    className="p-1.5 rounded hover:bg-muted/50 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Dataset Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-border rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">New Dataset</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="e.g. English STT Test Set"
                  className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-foreground/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Type</label>
                <div className="flex gap-3">
                  {(["stt", "tts"] as DatasetType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewType(type)}
                      className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors cursor-pointer ${
                        newType === type
                          ? "bg-foreground text-background border-foreground"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {type.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewName("");
                  setNewType("stt");
                }}
                className="h-9 px-4 rounded-md text-sm border border-border hover:bg-muted/50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={isCreating || !newName.trim()}
                className="h-9 px-4 rounded-md text-sm font-medium bg-foreground text-background hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer flex items-center gap-2"
              >
                {isCreating && (
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteDialogId && datasetToDelete && (
        <DeleteConfirmationDialog
          isOpen={true}
          onClose={() => setDeleteDialogId(null)}
          onConfirm={() => handleDelete(deleteDialogId)}
          title="Delete dataset"
          message={`Are you sure you want to delete "${datasetToDelete.name}"? This will also delete all ${datasetToDelete.item_count} item(s) and cannot be undone.`}
          isDeleting={isDeleting}
        />
      )}
    </AppLayout>
  );
}
