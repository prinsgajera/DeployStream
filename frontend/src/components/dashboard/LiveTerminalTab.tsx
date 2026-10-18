import React, { useEffect, useRef, useState } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  Terminal as TerminalIcon,
  Trash2,
  Download,
} from "lucide-react";
import { useBuildLogStream, type StreamConnection } from "../../hooks/useBuildLogStream";

interface LiveTerminalTabProps {
  buildId: string;
  deployedUrl: string | null;
}

const COPIED_RESET_MS = 2000;
const ERROR_LINE = /\b(error|failed|fatal)\b/i;
const SUCCESS_LINE = /\b(success|succeeded|complete|done)\b/i;

const CONNECTION_STYLES: Record<StreamConnection, string> = {
  connecting: "bg-amber-950/60 text-amber-400 border-amber-800/40",
  open: "bg-emerald-950/60 text-emerald-400 border-emerald-800/40",
  closed: "bg-zinc-800 text-zinc-400 border-zinc-700",
};

function lineColor(line: string): string {
  if (ERROR_LINE.test(line)) return "text-rose-400 font-semibold";
  if (SUCCESS_LINE.test(line)) return "text-emerald-400 font-medium";
  return "text-zinc-200";
}

export const LiveTerminalTab: React.FC<LiveTerminalTabProps> = ({ buildId, deployedUrl }) => {
  const { lines, status, connection, error, clear } = useBuildLogStream(buildId);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [lines, autoScroll]);

  const handleCopyUrl = async (): Promise<void> => {
    if (!deployedUrl) return;
    await navigator.clipboard.writeText(deployedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_RESET_MS);
  };

  const handleDownload = (): void => {
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/plain" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `build-${buildId}.log`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="flex flex-col gap-5 font-sans">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
        <div className="flex flex-col min-w-0">
          <span className="text-xs uppercase font-mono text-zinc-400">Live URL</span>
          {deployedUrl ? (
            <div className="flex items-center gap-2 mt-0.5 min-w-0">
              <a
                href={deployedUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1 truncate"
              >
                {deployedUrl}
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
              <button
                type="button"
                onClick={() => void handleCopyUrl()}
                className="text-zinc-400 hover:text-zinc-100 p-1 rounded hover:bg-zinc-800 transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500"
                title="Copy live URL"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <span className="font-mono text-xs text-zinc-500 mt-0.5">Available after a successful build</span>
          )}
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono text-xs font-semibold self-start sm:self-center ${CONNECTION_STYLES[connection]}`}
        >
          stream: {connection}
          {status ? ` · ${status.toLowerCase()}` : ""}
        </span>
      </div>

      <div className="rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
        <div className="bg-zinc-900/90 px-4 py-3 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="font-mono text-xs text-zinc-300 flex items-center gap-1.5 font-medium">
            <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
            CodeBuild output · {buildId}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoScroll((prev) => !prev)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                autoScroll
                  ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              Auto-scroll: {autoScroll ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={clear}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              Clear
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={lines.length === 0}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              Download
            </button>
          </div>
        </div>

        <div
          ref={bodyRef}
          className="p-4 md:p-6 font-mono text-xs leading-relaxed max-h-96 overflow-y-auto select-text space-y-1"
        >
          {lines.length === 0 && !error && (
            <p className="text-zinc-500">
              {connection === "closed" ? "No log output for this build." : "Waiting for build output..."}
            </p>
          )}
          {lines.map((line, index) => (
            <div key={index} className="flex items-start gap-4 hover:bg-zinc-900/40 px-2 py-0.5 rounded">
              <span className="w-8 shrink-0 text-right text-zinc-600 select-none">{index + 1}</span>
              <span className={`break-all ${lineColor(line)}`}>{line}</span>
            </div>
          ))}
          {error && <p className="text-rose-400 font-semibold px-2">{error}</p>}
        </div>
      </div>
    </section>
  );
};
