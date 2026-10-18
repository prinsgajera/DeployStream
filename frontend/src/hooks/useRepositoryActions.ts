import { useState, useCallback } from "react";
import axios from "axios";
import { apiClient } from "../lib/apiClient";
import type { ImportedRepository, RepositorySettingsPayload } from "../types/dashboard";

interface UseRepositoryActionsResult {
  deleteRepository: (repositoryId: string) => Promise<boolean>;
  updateSettings: (repositoryId: string, payload: RepositorySettingsPayload) => Promise<boolean>;
  pendingIds: ReadonlySet<string>;
  error: string | null;
}

function toMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? err.message;
  }
  return err instanceof Error ? err.message : fallback;
}

export function useRepositoryActions(onChanged: () => void): UseRepositoryActionsResult {
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (id: string, request: () => Promise<unknown>, fallback: string): Promise<boolean> => {
      setError(null);
      setPendingIds((prev) => new Set(prev).add(id));
      try {
        await request();
        onChanged();
        return true;
      } catch (err) {
        setError(toMessage(err, fallback));
        return false;
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [onChanged]
  );

  const deleteRepository = useCallback(
    (repositoryId: string) =>
      run(repositoryId, () => apiClient.delete(`/repositories/${repositoryId}`), "Failed to delete repository"),
    [run]
  );

  const updateSettings = useCallback(
    (repositoryId: string, payload: RepositorySettingsPayload) =>
      run(
        repositoryId,
        () => apiClient.patch<ImportedRepository>(`/repositories/${repositoryId}`, payload),
        "Failed to save settings"
      ),
    [run]
  );

  return { deleteRepository, updateSettings, pendingIds, error };
}
