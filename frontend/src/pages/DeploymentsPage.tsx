import React, { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { LiveTerminalTab } from "../components/dashboard/LiveTerminalTab";
import {
  Rocket,
  CheckCircle2,
  XCircle,
  Loader2,
  GitCommit,
  RotateCcw,
  X,
  ChevronDown,
  ChevronUp,
  Terminal as TerminalIcon,
  Filter,
} from "lucide-react";
import type { BuildHistoryItem, BuildStatusType } from "../types/dashboard";

const INITIAL_BUILDS: BuildHistoryItem[] = [
  {
    id: "#0026",
    repositoryId: "repo-1",
    repoName: "my-react-app",
    commitHash: "7a9f2c1",
    commitMessage: "feat: added homepage dynamic hero & analytics",
    author: "alex-dev",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    branch: "main",
    startedAt: "3 mins ago",
    duration: "Running (40s...)",
    status: "BUILDING",
  },
  {
    id: "#0025",
    repositoryId: "repo-3",
    repoName: "auth-microservice",
    commitHash: "4e81b90",
    commitMessage: "fix: hydration mismatch on checkout modal",
    author: "sarah-eng",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    branch: "feature/ui",
    startedAt: "2 hours ago",
    duration: "took 58s",
    status: "SUCCESS",
  },
  {
    id: "#0024",
    repositoryId: "repo-2",
    repoName: "api-gateway-service",
    commitHash: "9c2d114",
    commitMessage: "chore: bump dependencies & security patches",
    author: "dependabot[bot]",
    branch: "main",
    startedAt: "5 hours ago",
    duration: "took 1m 12s",
    status: "SUCCESS",
  },
  {
    id: "#0023",
    repositoryId: "repo-1",
    repoName: "my-react-app",
    commitHash: "1b88e09",
    commitMessage: "refactor: optimize bundle splitting & chunks",
    author: "alex-dev",
    authorAvatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    branch: "main",
    startedAt: "1 day ago",
    duration: "failed at 22s",
    status: "FAILED",
  },
];

export const DeploymentsPage: React.FC = () => {
  const [builds] = useState<BuildHistoryItem[]>(INITIAL_BUILDS);
  const [filterStatus, setFilterStatus] = useState<"ALL" | BuildStatusType>("ALL");
  const [expandedBuildId, setExpandedBuildId] = useState<string | null>("#0026");

  const filteredBuilds = builds.filter(
    (b) => filterStatus === "ALL" || b.status === filterStatus
  );

  const toggleLogs = (buildId: string) => {
    setExpandedBuildId((prev) => (prev === buildId ? null : buildId));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16 min-h-screen bg-zinc-950">
        <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Rocket className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                  Deployments & Pipelines
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/40 font-mono text-xs font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                  1 Active Build
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Monitor live running pipeline deployments, inspect build logs, and trigger manual redeployments.
              </p>
            </div>

            <span className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
              Socket Stream:
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                connected
              </span>
            </span>
          </div>

          {/* Status Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono text-zinc-400">Filter Status:</span>
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800 ml-1">
                {(["ALL", "BUILDING", "SUCCESS", "FAILED"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setFilterStatus(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      filterStatus === st
                        ? "bg-zinc-800 text-cyan-400 font-semibold shadow"
                        : "text-zinc-400 hover:text-zinc-100"
                    }`}
                  >
                    {st === "ALL"
                      ? "All Pipelines"
                      : st === "BUILDING"
                      ? "Running"
                      : st === "SUCCESS"
                      ? "Succeeded"
                      : "Failed"}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs font-mono text-zinc-500">
              Showing <span className="text-zinc-200 font-semibold">{filteredBuilds.length}</span> pipeline runs
            </div>
          </div>

          {/* Pipeline Cards Listing */}
          <div className="flex flex-col gap-4">
            {filteredBuilds.map((build) => {
              const isSuccess = build.status === "SUCCESS";
              const isBuilding = build.status === "BUILDING";
              const isFailed = build.status === "FAILED";
              const isExpanded = expandedBuildId === build.id;

              return (
                <div
                  key={build.id}
                  className={`bg-zinc-900/70 border rounded-2xl overflow-hidden transition-all shadow-sm ${
                    isExpanded
                      ? "border-cyan-500/40 ring-1 ring-cyan-500/20"
                      : "border-zinc-800/80 hover:border-zinc-700"
                  }`}
                >
                  {/* Card Main Info */}
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start md:items-center gap-4">
                      {/* Status Icon */}
                      <div className="mt-1 md:mt-0 shrink-0">
                        {isBuilding && (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                          </div>
                        )}
                        {isSuccess && (
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                        )}
                        {isFailed && (
                          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                            <XCircle className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono font-bold text-sm text-cyan-400">
                            {build.id}
                          </span>
                          <span className="font-semibold text-sm text-zinc-100">
                            {build.repoName}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[10px] uppercase font-semibold ${
                              isSuccess
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                                : isBuilding
                                ? "bg-amber-950/60 text-amber-400 border border-amber-800/40"
                                : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                            }`}
                          >
                            {isBuilding && (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                            )}
                            {build.status}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-300 font-medium">
                          {build.commitMessage}
                        </p>

                        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 flex-wrap mt-0.5">
                          <span className="flex items-center gap-1">
                            <GitCommit className="w-3 h-3 text-zinc-500" />
                            <span className="text-cyan-400">{build.commitHash}</span>
                          </span>
                          <span>&bull;</span>
                          <span>branch: <strong className="text-zinc-300">{build.branch}</strong></span>
                          <span>&bull;</span>
                          <span>started {build.startedAt}</span>
                          <span>&bull;</span>
                          <span className={isBuilding ? "text-amber-400" : isFailed ? "text-rose-400" : "text-zinc-400"}>
                            {build.duration}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleLogs(build.id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                          isExpanded
                            ? "bg-cyan-500 text-zinc-950 shadow-cyan-950/50"
                            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700"
                        }`}
                      >
                        <TerminalIcon className="w-4 h-4" />
                        <span>{isExpanded ? "Hide Logs" : "View Logs"}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 ml-1" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 ml-1" />
                        )}
                      </button>

                      {isBuilding ? (
                        <button
                          type="button"
                          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Cancel Build"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                          title="Re-run Pipeline"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Live Terminal View */}
                  {isExpanded && (
                    <div className="border-t border-zinc-800/80 p-5 bg-zinc-950">
                      <LiveTerminalTab selectedBuildId={build.id} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeploymentsPage;
