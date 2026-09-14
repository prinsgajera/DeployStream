import React, { useState } from "react";
import {
  ExternalLink,
  Copy,
  Check,
  Cloud,
  Zap,
  Terminal as TerminalIcon,
  Trash2,
  Download,
} from "lucide-react";

interface LiveTerminalTabProps {
  selectedBuildId?: string;
}

const DEFAULT_LOGS = [
  "[DeployStream 14:32:01] Initializing isolated micro-container on cluster us-east-1 (Node: worker-09)...",
  "[DeployStream 14:32:03] Fetching code from repository: github.com/acme/my-react-app (commit 7a9f2c1)...",
  "[DeployStream 14:32:05] Code checkout complete. (0.42s)",
  "[DeployStream 14:32:06] Detected Node.js v20.11.0 environment & npm package manager.",
  "[DeployStream 14:32:07] Running: npm install --frozen-lockfile",
  "> added 842 packages in 11.4s (cache hits: 91%)",
  "[DeployStream 14:32:20] Running pipeline phase: npm run build (vite build)",
  "> vite v5.1.4 building for production...",
  "> transform (218 modules) ... done in 1.4s",
  "> dist/index.html                     0.84 kB │ gzip:  0.46 kB",
  "> dist/assets/index-Dk921s.css      24.12 kB │ gzip:  5.80 kB",
  "> dist/assets/index-Bm782x.js      186.44 kB │ gzip: 59.20 kB",
  "[DeployStream 14:32:35] [DeployStream] Build successful! Zero compile errors.",
  "[DeployStream 14:32:36] Uploading 14 static artifacts to global edge distribution CDN...",
  "[DeployStream 14:32:38] Invalidation submitted for cache zones across 28 global POP locations...",
  "[DeployStream 14:32:40] Deployment complete! Application live at: https://deploystream-app.s3-website.amazonaws.com",
  "[DeployStream 14:32:41] Ready for incoming traffic. (Total elapsed: 40.2s)",
];

export const LiveTerminalTab: React.FC<LiveTerminalTabProps> = ({
  selectedBuildId = "#0026",
}) => {
  const [logs, setLogs] = useState<string[]>(DEFAULT_LOGS);
  const [autoScroll, setAutoScroll] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText("https://deploystream-app.s3-website.amazonaws.com");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearLogs = () => {
    setLogs([
      "[DeployStream Console] Terminal output cleared. Listening for live runner events...",
    ]);
  };

  return (
    <section className="flex flex-col gap-5 font-sans">
      {/* Target Environment URL & Edge Status Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 shadow-md">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-400" />
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono text-zinc-400">
                Target Environment URL ({selectedBuildId})
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <a
                  href="https://deploystream-app.s3-website.amazonaws.com"
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs text-cyan-400 hover:text-cyan-300 underline flex items-center gap-1"
                >
                  https://deploystream-app.s3-website.amazonaws.com
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="text-zinc-400 hover:text-zinc-100 p-1 rounded hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Copy live URL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono text-[11px] font-semibold">
            <Cloud className="w-3.5 h-3.5" />
            Edge CDN Synced
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 font-mono text-[11px] font-semibold">
            <Zap className="w-3.5 h-3.5" />
            HTTP/3 Activated
          </span>
        </div>
      </div>

      {/* Terminal Window Container */}
      <div className="rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl">
        {/* Terminal Header Bar */}
        <div className="bg-zinc-900/90 px-4 py-3 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            </div>
            <span className="font-mono text-xs text-zinc-300 flex items-center gap-1.5 font-medium">
              <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
              DeployStream Build Engine v2.4.1 -- worker-node-09 (us-east-1a)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoScroll(!autoScroll)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                autoScroll ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40" : "bg-zinc-800 text-zinc-400"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${autoScroll ? "bg-emerald-400 animate-pulse" : "bg-zinc-500"}`} />
              <span>Auto-scroll: {autoScroll ? "ON" : "OFF"}</span>
            </button>

            <button
              type="button"
              onClick={handleClearLogs}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-zinc-400" />
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={() => alert("Downloading log trace...")}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 font-mono text-xs leading-relaxed max-h-[500px] overflow-y-auto select-text space-y-2">
          {logs.map((line, idx) => {
            const lineNum = String(idx + 1).padStart(2, "0");
            const isError = line.includes("error") || line.includes("FAILED");
            const isSuccess = line.includes("successful") || line.includes("complete");

            return (
              <div key={idx} className="flex items-start gap-4 hover:bg-zinc-900/40 px-2 py-0.5 rounded">
                <span className="w-6 text-right text-zinc-600 select-none text-[11px]">{lineNum}</span>
                <span
                  className={
                    isError
                      ? "text-rose-400 font-semibold"
                      : isSuccess
                      ? "text-emerald-400 font-medium"
                      : line.startsWith(">")
                      ? "text-zinc-400"
                      : "text-zinc-200"
                  }
                >
                  {line}
                </span>
              </div>
            );
          })}
          <div className="flex items-center gap-2 pt-2 text-emerald-400 font-mono text-xs">
            <span className="w-2 h-4 bg-emerald-400 animate-pulse inline-block align-middle" />
          </div>
        </div>
      </div>
    </section>
  );
};
