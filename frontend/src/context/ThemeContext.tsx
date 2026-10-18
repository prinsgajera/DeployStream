import React, { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext, type ThemeContextType } from "./theme-context";
import {
  SYSTEM_DARK_QUERY,
  THEME_STORAGE_KEY,
  applyTheme,
  getSystemPrefersDark,
  readStoredPreference,
  resolveTheme,
  writeStoredPreference,
  type ThemePreference,
} from "../lib/theme";

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [preference, setPreferenceState] = useState<ThemePreference>(readStoredPreference);
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(getSystemPrefersDark);

  const resolvedTheme = resolveTheme(preference, systemPrefersDark);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    const query = window.matchMedia(SYSTEM_DARK_QUERY);
    const handleChange = (event: MediaQueryListEvent): void => setSystemPrefersDark(event.matches);
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent): void => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) {
        setPreferenceState(readStoredPreference());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setPreference = useCallback((next: ThemePreference): void => {
    writeStoredPreference(next);
    setPreferenceState(next);
  }, []);

  const value = useMemo<ThemeContextType>(
    () => ({ preference, resolvedTheme, setPreference }),
    [preference, resolvedTheme, setPreference]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
