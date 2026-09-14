import { useState, useEffect, useCallback } from "react";
import type { ImportedRepository } from "../types/dashboard";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const SERVER_ROOT = API_BASE.replace(/\/api\/?$/, "");

interface UseUserRepositoriesResult {
  repositories: ImportedRepository[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useUserRepositories(): UseUserRepositoriesResult {
  const [repositories, setRepositories] = useState<ImportedRepository[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepositories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${SERVER_ROOT}/api/repositories`, {
        credentials: "include",
        headers: { Accept: "application/json" },
      });

      if (response.status === 401) {
        window.location.href = "/login";
        return;
      }

      if (!response.ok) {
        const body = (await response.json()) as { message?: string };
        throw new Error(body.message || "Failed to fetch repositories");
      }

      const data = (await response.json()) as ImportedRepository[];
      setRepositories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  return { repositories, isLoading, error, refetch: fetchRepositories };
}
