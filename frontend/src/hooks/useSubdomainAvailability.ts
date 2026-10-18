import { useState, useEffect } from "react";
import axios from "axios";
import { apiClient } from "../lib/apiClient";
import { validateSubdomain } from "../lib/subdomain";
import type { SubdomainAvailability } from "../types/dashboard";

export type SubdomainStatus =
  | "idle"
  | "checking"
  | "available"
  | "current"
  | "taken"
  | "reserved"
  | "invalid"
  | "error";

interface UseSubdomainAvailabilityResult {
  status: SubdomainStatus;
  suggestions: readonly string[];
}

interface CheckResult {
  forValue: string;
  status: SubdomainStatus;
  suggestions: string[];
}

const DEBOUNCE_MS = 400;
const NO_SUGGESTIONS: readonly string[] = [];

export function useSubdomainAvailability(
  subdomain: string,
  currentSubdomain: string | null = null,
  excludeRepositoryId?: string
): UseSubdomainAvailabilityResult {
  const [result, setResult] = useState<CheckResult | null>(null);

  const localRejection = subdomain ? validateSubdomain(subdomain) : null;
  const isCurrent = subdomain !== "" && subdomain === currentSubdomain;
  const needsRemoteCheck = subdomain !== "" && !isCurrent && localRejection === null;

  useEffect(() => {
    if (!needsRemoteCheck) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      apiClient
        .get<SubdomainAvailability>("/repositories/subdomain-availability", {
          params: { subdomain, excludeRepositoryId },
          signal: controller.signal,
        })
        .then(({ data }) =>
          setResult({
            forValue: subdomain,
            status: data.available ? "available" : (data.reason ?? "taken"),
            suggestions: data.suggestions,
          })
        )
        .catch((err: unknown) => {
          if (axios.isCancel(err)) return;
          setResult({ forValue: subdomain, status: "error", suggestions: [] });
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [subdomain, excludeRepositoryId, needsRemoteCheck]);

  if (subdomain === "") return { status: "idle", suggestions: NO_SUGGESTIONS };
  if (isCurrent) return { status: "current", suggestions: NO_SUGGESTIONS };
  if (localRejection) return { status: localRejection, suggestions: NO_SUGGESTIONS };
  if (result?.forValue === subdomain) return { status: result.status, suggestions: result.suggestions };
  return { status: "checking", suggestions: NO_SUGGESTIONS };
}
