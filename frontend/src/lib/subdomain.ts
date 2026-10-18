export const SUBDOMAIN_MIN_LENGTH = 3;
export const SUBDOMAIN_MAX_LENGTH = 63;

const SUBDOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
  "www", "api", "app", "admin", "root", "mail", "smtp", "imap", "ftp", "ns1", "ns2",
  "cdn", "static", "assets", "dashboard", "console", "auth", "login", "signup", "account",
  "status", "docs", "help", "support", "blog", "dev", "staging", "test", "demo", "deploystream",
]);

export type SubdomainRejection = "invalid" | "reserved";

export function sanitizeSubdomainInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, SUBDOMAIN_MAX_LENGTH);
}

export function slugifySubdomain(fullName: string): string {
  return sanitizeSubdomainInput(fullName.replace(/[^a-z0-9-]/gi, "-"))
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function validateSubdomain(subdomain: string): SubdomainRejection | null {
  if (!SUBDOMAIN_PATTERN.test(subdomain) || subdomain.includes("--")) return "invalid";
  if (RESERVED_SUBDOMAINS.has(subdomain)) return "reserved";
  return null;
}

export function describeInvalidSubdomain(subdomain: string): string {
  if (subdomain.length < SUBDOMAIN_MIN_LENGTH) return `Use at least ${SUBDOMAIN_MIN_LENGTH} characters.`;
  if (subdomain.startsWith("-") || subdomain.endsWith("-")) return "Can't start or end with a hyphen.";
  if (subdomain.includes("--")) return "Can't contain two hyphens in a row.";
  return "Use only lowercase letters, numbers and hyphens.";
}
