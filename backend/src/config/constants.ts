export const API_PREFIX = "/api";
export const AUTH_COOKIE_NAME = "auth_token";
export const AUTH_TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7;

export const SUBDOMAIN_MAX_LENGTH = 63;
export const SUBDOMAIN_PATTERN = /^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/;
export const SUBDOMAIN_SUGGESTION_COUNT = 3;
export const RESERVED_SUBDOMAINS: ReadonlySet<string> = new Set([
  "www", "api", "app", "admin", "root", "mail", "smtp", "imap", "ftp", "ns1", "ns2",
  "cdn", "static", "assets", "dashboard", "console", "auth", "login", "signup", "account",
  "status", "docs", "help", "support", "blog", "dev", "staging", "test", "demo", "deploystream",
]);
