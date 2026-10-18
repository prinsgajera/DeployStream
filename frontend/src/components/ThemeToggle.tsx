import React, { useId } from "react";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { THEME_PREFERENCES, type ThemePreference } from "../lib/theme";

interface ThemeToggleProps {
  showLabels?: boolean;
}

interface ThemeOption {
  label: string;
  icon: LucideIcon;
}

const THEME_OPTIONS: Record<ThemePreference, ThemeOption> = {
  light: { label: "Light", icon: Sun },
  dark: { label: "Dark", icon: Moon },
  system: { label: "System", icon: Monitor },
};

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ showLabels = false }) => {
  const { preference, setPreference } = useTheme();
  const groupName = useId();

  return (
    <div
      role="radiogroup"
      aria-label="Color theme"
      className="inline-flex items-center gap-0.5 p-0.5 rounded-lg bg-zinc-900 border border-zinc-800"
    >
      {THEME_PREFERENCES.map((option) => {
        const { label, icon: Icon } = THEME_OPTIONS[option];
        return (
          <label key={option} className="cursor-pointer" title={`${label} theme`}>
            <input
              type="radio"
              name={groupName}
              value={option}
              checked={preference === option}
              onChange={() => setPreference(option)}
              className="peer sr-only"
              aria-label={`${label} theme`}
            />
            <span className="flex items-center justify-center gap-1.5 h-7 px-2 rounded-md text-xs font-medium border border-transparent text-zinc-400 transition-all duration-200 hover:text-zinc-100 peer-checked:bg-cyan-500/10 peer-checked:text-cyan-400 peer-checked:border-cyan-500/20 peer-checked:font-semibold peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500 active:scale-[0.98]">
              <Icon className="w-3.5 h-3.5" />
              {showLabels && <span>{label}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
};
