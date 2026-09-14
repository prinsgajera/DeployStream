import { useState, useEffect, useCallback } from "react";
import type { GitHubRepoOption } from "../types/dashboard";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const SERVER_ROOT = API_BASE.replace(/\/api\/?$/, "");

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
      const response = await fetch(`${SERVER_ROOT}/api/github/repos`, {
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

      const data = (await response.json()) as GitHubRepoOption[];
      setRepos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRepos();
  }, [fetchRepos]);

  return { repos, isLoading, error, refetch: fetchRepos };
}
