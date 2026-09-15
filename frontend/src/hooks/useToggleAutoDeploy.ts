import { useState, useCallback } from "react";

const SERVER_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:3001/api").replace(
  /\/api\/?$/,
  ""
);

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
        const response = await fetch(
          `${SERVER_ROOT}/api/repositories/${repositoryId}/auto-deploy`,
          {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ autoDeploy: nextValue }),
          }
        );

        if (!response.ok) {
          onRevert(repositoryId, currentValue);
        }
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
