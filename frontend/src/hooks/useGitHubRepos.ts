import { useState, useEffect, useCallback } from "react";
import type { GitHubRepoOption } from "../types/dashboard";
import { apiClient } from "../lib/apiClient";
import axios from "axios";

interface UseGitHubReposResult {
  repos: GitHubRepoOption[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGitHubRepos(): UseGitHubReposResult {
  const [repos, setRepos] = useState<GitHubRepoOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRepos = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await apiClient.get<GitHubRepoOption[]>("/api/github/repos");
      setRepos(data);
    } catch (err) {
      if (!axios.isAxiosError(err) || err.response?.status !== 401) {
        const message = axios.isAxiosError(err)
          ? (err.response?.data as { message?: string })?.message ?? "Failed to fetch repositories"
          : "Unknown error";
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return { repos, isLoading, error, refetch: fetchRepos };
}
