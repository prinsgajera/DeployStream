import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { apiClient } from "../lib/apiClient";
import { ACTIVE_BUILD_STATUSES, type Build } from "../types/dashboard";

const ACTIVE_POLL_INTERVAL_MS = 5000;
const IDLE_POLL_INTERVAL_MS = 30000;

interface UseBuildsResult {
  builds: Build[];
  activeBuildCount: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBuilds(): UseBuildsResult {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    try {
      const { data } = await apiClient.get<Build[]>("/builds");
      setBuilds(data);
      setError(null);
    } catch (err) {
      if (!axios.isAxiosError(err) || err.response?.status !== 401) {
        setError(err instanceof Error ? err.message : "Failed to load builds");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const activeBuildCount = useMemo(
    () => builds.filter((build) => ACTIVE_BUILD_STATUSES.includes(build.status)).length,
    [builds]
  );

  useEffect(() => {
    const pollIntervalMs = activeBuildCount > 0 ? ACTIVE_POLL_INTERVAL_MS : IDLE_POLL_INTERVAL_MS;
    let timer: ReturnType<typeof setTimeout>;
    let isCancelled = false;

    const poll = async (): Promise<void> => {
      await refetch();
      if (!isCancelled) timer = setTimeout(() => void poll(), pollIntervalMs);
    };

    timer = setTimeout(() => void poll(), 0);
    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [refetch, activeBuildCount]);

  return { builds, activeBuildCount, isLoading, error, refetch };
}
