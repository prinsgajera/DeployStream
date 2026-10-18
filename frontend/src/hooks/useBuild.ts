import { useState, useEffect } from "react";
import axios from "axios";
import { apiClient } from "../lib/apiClient";
import { ACTIVE_BUILD_STATUSES, type Build } from "../types/dashboard";

const ACTIVE_POLL_INTERVAL_MS = 5000;

interface UseBuildResult {
  build: Build | null;
  isLoading: boolean;
  isNotFound: boolean;
  error: string | null;
}

export function useBuild(buildId: string): UseBuildResult {
  const [build, setBuild] = useState<Build | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const load = async (): Promise<void> => {
      let shouldPoll = false;
      try {
        const { data } = await apiClient.get<Build>(`/builds/${buildId}/status`);
        if (isCancelled) return;
        setBuild(data);
        setError(null);
        shouldPoll = ACTIVE_BUILD_STATUSES.includes(data.status);
      } catch (err) {
        if (isCancelled) return;
        const status = axios.isAxiosError(err) ? err.response?.status : undefined;
        if (status === 404) {
          setIsNotFound(true);
        } else if (status !== 401) {
          setError(err instanceof Error ? err.message : "Failed to load build");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
      if (!isCancelled && shouldPoll) {
        timer = setTimeout(() => void load(), ACTIVE_POLL_INTERVAL_MS);
      }
    };

    timer = setTimeout(() => void load(), 0);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [buildId]);

  return { build, isLoading, isNotFound, error };
}
