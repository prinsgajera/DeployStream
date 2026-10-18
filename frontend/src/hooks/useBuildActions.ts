import { useState, useCallback } from "react";
import axios from "axios";
import { apiClient } from "../lib/apiClient";
import type { Build } from "../types/dashboard";

interface UseBuildActionsResult {
  triggerBuild: (repositoryId: string) => Promise<Build | null>;
  cancelBuild: (buildId: string) => Promise<Build | null>;
  pendingIds: ReadonlySet<string>;
  error: string | null;
}

function toMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as { message?: string } | undefined)?.message ?? err.message;
  }
  return err instanceof Error ? err.message : fallback;
}

export function useBuildActions(onChanged: () => Promise<void>): UseBuildActionsResult {
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (id: string, request: () => Promise<Build>, fallback: string): Promise<Build | null> => {
      setError(null);
      setPendingIds((prev) => new Set(prev).add(id));
      try {
        const build = await request();
        await onChanged();
        return build;
      } catch (err) {
        setError(toMessage(err, fallback));
        return null;
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

  const triggerBuild = useCallback(
    (repositoryId: string) =>
      run(
        repositoryId,
        async () => (await apiClient.post<Build>(`/builds/repo/${repositoryId}/trigger`, {})).data,
        "Failed to start deployment"
      ),
    [run]
  );

  const cancelBuild = useCallback(
    (buildId: string) =>
      run(
        buildId,
        async () => (await apiClient.post<Build>(`/builds/${buildId}/cancel`)).data,
        "Failed to cancel build"
      ),
    [run]
  );

  return { triggerBuild, cancelBuild, pendingIds, error };
}
