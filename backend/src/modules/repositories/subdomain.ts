import {
  RESERVED_SUBDOMAINS,
  SUBDOMAIN_MAX_LENGTH,
  SUBDOMAIN_PATTERN,
  SUBDOMAIN_SUGGESTION_COUNT,
} from "../../config/constants.js";

export type SubdomainRejection = "invalid" | "reserved";

const SUGGESTION_SUFFIXES = ["2", "app", "site", "web", "dev"] as const;
const RANDOM_SUFFIX_LENGTH = 3;
const RANDOM_SUFFIX_RADIX = 36;

export const MAX_SUGGESTIONS = SUBDOMAIN_SUGGESTION_COUNT;

export function validateSubdomain(subdomain: string): SubdomainRejection | null {
  if (!SUBDOMAIN_PATTERN.test(subdomain) || subdomain.includes("--")) return "invalid";
  if (RESERVED_SUBDOMAINS.has(subdomain)) return "reserved";
  return null;
}

export function buildSuggestionCandidates(subdomain: string): string[] {
  const randomSuffix = Math.random()
    .toString(RANDOM_SUFFIX_RADIX)
    .slice(2, 2 + RANDOM_SUFFIX_LENGTH);

  return [...SUGGESTION_SUFFIXES, randomSuffix]
    .map((suffix) => `${subdomain.slice(0, SUBDOMAIN_MAX_LENGTH - suffix.length - 1)}-${suffix}`)
    .filter((candidate) => validateSubdomain(candidate) === null);
}
