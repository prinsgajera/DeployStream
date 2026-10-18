import React from "react";
import { CheckCircle2, XCircle, Loader2, Clock, Ban } from "lucide-react";
import type { BuildStatusType } from "../../types/dashboard";

interface BuildStatusBadgeProps {
  status: BuildStatusType;
}

interface StatusStyle {
  label: string;
  className: string;
  icon: React.ReactNode;
}

const STATUS_STYLES: Record<BuildStatusType, StatusStyle> = {
  SUCCESS: {
    label: "SUCCESS",
    className: "bg-emerald-950/60 text-emerald-400 border-emerald-800/40",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  BUILDING: {
    label: "BUILDING",
    className: "bg-amber-950/60 text-amber-400 border-amber-800/40",
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
  },
  QUEUED: {
    label: "QUEUED",
    className: "bg-sky-950/60 text-sky-400 border-sky-800/40",
    icon: <Clock className="w-3 h-3" />,
  },
  FAILED: {
    label: "FAILED",
    className: "bg-rose-950/60 text-rose-400 border-rose-800/40",
    icon: <XCircle className="w-3 h-3" />,
  },
  CANCELLED: {
    label: "CANCELLED",
    className: "bg-zinc-800 text-zinc-400 border-zinc-700",
    icon: <Ban className="w-3 h-3" />,
  },
  IDLE: {
    label: "IDLE",
    className: "bg-zinc-800 text-zinc-400 border-zinc-700",
    icon: <Clock className="w-3 h-3" />,
  },
};

export const BuildStatusBadge: React.FC<BuildStatusBadgeProps> = ({ status }) => {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border font-mono text-xs font-semibold ${style.className}`}
    >
      {style.icon}
      {style.label}
    </span>
  );
};
