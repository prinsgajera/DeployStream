import React from "react";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Globe } from "lucide-react";
import { describeInvalidSubdomain, sanitizeSubdomainInput } from "../../lib/subdomain";
import { DEPLOYED_BASE_DOMAIN } from "../../lib/config";
import type { SubdomainStatus } from "../../hooks/useSubdomainAvailability";

interface SubdomainFieldProps {
  id: string;
  value: string;
  status: SubdomainStatus;
  suggestions: readonly string[];
  disabled?: boolean;
  autoFocus?: boolean;
  onChange: (value: string) => void;
}

interface StatusPresentation {
  borderClass: string;
  textClass: string;
  icon: React.ReactNode;
}

const STATUS_PRESENTATION: Record<SubdomainStatus, StatusPresentation> = {
  idle: {
    borderClass: "border-zinc-800 focus-within:border-cyan-500 focus-within:ring-cyan-500/40",
    textClass: "text-zinc-500",
    icon: <Globe className="w-4 h-4 text-zinc-500" />,
  },
  checking: {
    borderClass: "border-zinc-800 focus-within:border-cyan-500 focus-within:ring-cyan-500/40",
    textClass: "text-zinc-400",
    icon: <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />,
  },
  available: {
    borderClass: "border-emerald-600/70 focus-within:border-emerald-500 focus-within:ring-emerald-500/40",
    textClass: "text-emerald-400",
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  },
  current: {
    borderClass: "border-zinc-800 focus-within:border-cyan-500 focus-within:ring-cyan-500/40",
    textClass: "text-zinc-400",
    icon: <CheckCircle2 className="w-4 h-4 text-zinc-500" />,
  },
  taken: {
    borderClass: "border-rose-600/70 focus-within:border-rose-500 focus-within:ring-rose-500/40",
    textClass: "text-rose-400",
    icon: <XCircle className="w-4 h-4 text-rose-400" />,
  },
  reserved: {
    borderClass: "border-amber-600/70 focus-within:border-amber-500 focus-within:ring-amber-500/40",
    textClass: "text-amber-400",
    icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
  },
  invalid: {
    borderClass: "border-amber-600/70 focus-within:border-amber-500 focus-within:ring-amber-500/40",
    textClass: "text-amber-400",
    icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
  },
  error: {
    borderClass: "border-amber-600/70 focus-within:border-amber-500 focus-within:ring-amber-500/40",
    textClass: "text-amber-400",
    icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
  },
};

function statusMessage(status: SubdomainStatus, value: string): string {
  const host = `${value}.${DEPLOYED_BASE_DOMAIN}`;
  const messages: Record<SubdomainStatus, string> = {
    idle: "Pick a name for your site's address.",
    checking: "Checking availability...",
    available: `${host} is available`,
    current: "This is your current address.",
    taken: `${host} is already taken`,
    reserved: "This name is reserved. Try another.",
    invalid: describeInvalidSubdomain(value),
    error: "Couldn't check availability. Try again.",
  };
  return messages[status];
}

export const SubdomainField: React.FC<SubdomainFieldProps> = ({
  id,
  value,
  status,
  suggestions,
  disabled = false,
  autoFocus = false,
  onChange,
}) => {
  const presentation = STATUS_PRESENTATION[status];
  const hasProblem = status === "taken" || status === "reserved" || status === "invalid";

  return (
    <div className="flex flex-col gap-2">
      <div
        className={`flex items-center h-11 pl-3.5 pr-3 gap-2 bg-zinc-950 border rounded-xl transition-all duration-200 focus-within:ring-2 ${presentation.borderClass} ${
          disabled ? "opacity-60" : ""
        }`}
      >
        <input
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={(event) => onChange(sanitizeSubdomainInput(event.target.value))}
          placeholder="my-awesome-site"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-invalid={hasProblem}
          aria-describedby={`${id}-status`}
          className="flex-1 min-w-0 h-full bg-transparent text-sm font-mono text-cyan-400 placeholder:text-zinc-600 focus:outline-none disabled:cursor-not-allowed"
        />
        <span className="shrink-0 text-xs font-mono text-zinc-500 select-none">.{DEPLOYED_BASE_DOMAIN}</span>
        <span className="shrink-0 flex items-center" aria-hidden="true">
          {presentation.icon}
        </span>
      </div>

      <p
        id={`${id}-status`}
        role="status"
        aria-live="polite"
        className={`flex items-center gap-1.5 text-xs font-mono ${presentation.textClass}`}
      >
        {statusMessage(status, value)}
      </p>

      {status === "taken" && suggestions.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-zinc-500">Try:</span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onChange(suggestion)}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-cyan-500/50 text-xs font-mono text-cyan-400 transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
