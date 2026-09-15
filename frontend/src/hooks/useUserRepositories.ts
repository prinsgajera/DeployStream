import { useState, useEffect, useCallback } from "react";
import type { ImportedRepository } from "../types/dashboard";
import { apiClient } from "../lib/apiClient";
import axios from "axios";

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
      const { data } = await apiClient.get<ImportedRepository[]>("/api/repositories");
      setRepositories(data);
    } catch (err) {
      if (!axios.isAxiosError(err) || err.response?.status !== 401) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepositories();
  }, [fetchRepositories]);

  return { repositories, isLoading, error, refetch: fetchRepositories };
}
