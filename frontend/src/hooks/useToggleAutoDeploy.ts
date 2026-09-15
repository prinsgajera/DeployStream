import { useState, useCallback } from "react";
import { apiClient } from "../lib/apiClient";
import type { ImportedRepository } from "../types/dashboard";

interface UseToggleAutoDeployResult {
  toggle: (repositoryId: string, currentValue: boolean) => Promise<void>;
  pendingIds: Set<string>;
}

export function useToggleAutoDeploy(
  onOptimisticUpdate: (id: string, value: boolean) => void,
  onRevert: (id: string, originalValue: boolean) => void
): UseToggleAutoDeployResult {
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const toggle = useCallback(
    async (repositoryId: string, currentValue: boolean) => {
      if (pendingIds.has(repositoryId)) return;

      const nextValue = !currentValue;
      onOptimisticUpdate(repositoryId, nextValue);
      setPendingIds((prev) => new Set(prev).add(repositoryId));

      try {
        await apiClient.patch<ImportedRepository>(
          `/api/repositories/${repositoryId}/auto-deploy`,
          { autoDeploy: nextValue }
        );
      } catch {
        onRevert(repositoryId, currentValue);
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(repositoryId);
          return next;
        });
      }
    },
    [pendingIds, onOptimisticUpdate, onRevert]
  );

  return { toggle, pendingIds };
}
