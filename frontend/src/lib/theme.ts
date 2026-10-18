export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "deploystream.theme";
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";
export const THEME_PREFERENCES: readonly ThemePreference[] = ["light", "dark", "system"];
export const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)";

const THEME_COLOR_META: Record<ResolvedTheme, string> = {
  light: "#f4f4f5",
  dark: "#09090b",
};

export function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === "string" && (THEME_PREFERENCES as readonly string[]).includes(value);
}

export function readStoredPreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isThemePreference(stored) ? stored : DEFAULT_THEME_PREFERENCE;
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
}

export function writeStoredPreference(preference: ThemePreference): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    return;
  }
}

export function getSystemPrefersDark(): boolean {
  return typeof window.matchMedia === "function" && window.matchMedia(SYSTEM_DARK_QUERY).matches;
}

export function resolveTheme(preference: ThemePreference, systemPrefersDark: boolean): ResolvedTheme {
  if (preference === "system") return systemPrefersDark ? "dark" : "light";
  return preference;
}

export function applyTheme(theme: ResolvedTheme): void {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLOR_META[theme]);
}
