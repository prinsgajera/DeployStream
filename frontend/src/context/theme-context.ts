import { createContext } from "react";
import type { ResolvedTheme, ThemePreference } from "../lib/theme";

export interface ThemeContextType {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setPreference: (preference: ThemePreference) => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
