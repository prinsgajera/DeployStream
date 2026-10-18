import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { BuildStatusBadge } from "../components/dashboard/BuildStatusBadge";
import { useBuilds } from "../hooks/useBuilds";
import { useBuildActions } from "../hooks/useBuildActions";
import { useUserRepositories } from "../hooks/useUserRepositories";
import { formatDuration, formatRelativeTime, shortCommit } from "../lib/format";
import {
  Rocket,
  GitCommit,
  RotateCcw,
  X,
  ArrowRight,
  Terminal as TerminalIcon,
  Filter,
  Loader2,
} from "lucide-react";
import { ACTIVE_BUILD_STATUSES, type BuildStatusType } from "../types/dashboard";
import { pageTitle } from "../lib/config";
import { TAB_ACTIVE_CLASS, TAB_INACTIVE_CLASS } from "../lib/tabStyles";

type StatusFilter = "ALL" | "ACTIVE" | "SUCCESS" | "FAILED";

const FILTER_LABELS: Record<StatusFilter, string> = {
  ALL: "All Pipelines",
  ACTIVE: "Running",
  SUCCESS: "Succeeded",
  FAILED: "Failed",
};

const FILTER_STATUSES: Record<Exclude<StatusFilter, "ALL">, readonly BuildStatusType[]> = {
  ACTIVE: ACTIVE_BUILD_STATUSES,
  SUCCESS: ["SUCCESS"],
  FAILED: ["FAILED", "CANCELLED"],
};

export const DeploymentsPage: React.FC = () => {
  const { builds, activeBuildCount, isLoading, error, refetch } = useBuilds();
  const { repositories } = useUserRepositories();
  const { triggerBuild, cancelBuild, pendingIds, error: actionError } = useBuildActions(refetch);
  const [filterStatus, setFilterStatus] = useState<StatusFilter>("ALL");

  const repositoryNames = useMemo(
    () => new Map(repositories.map((repository) => [repository.id, repository.repoName])),
    [repositories]
  );

  const filteredBuilds = builds.filter(
    (build) => filterStatus === "ALL" || FILTER_STATUSES[filterStatus].includes(build.status)
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <title>{pageTitle("Deployments")}</title>
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16 min-h-screen bg-zinc-950">
        <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Rocket className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">Deployments & Pipelines</h1>
                {activeBuildCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/40 font-mono text-xs font-semibold flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                    {activeBuildCount} Active {activeBuildCount === 1 ? "Build" : "Builds"}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Monitor running deployments, inspect build logs, and re-run pipelines.
              </p>
            </div>
          </div>

          {(error || actionError) && (
            <p className="text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-900/40 rounded-lg p-3">
              {actionError ?? error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono text-zinc-400">Filter Status:</span>
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {(Object.keys(FILTER_LABELS) as StatusFilter[]).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setFilterStatus(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 ${
                      filterStatus === filter ? TAB_ACTIVE_CLASS : TAB_INACTIVE_CLASS
                    }`}
                  >
                    {FILTER_LABELS[filter]}
                  </button>
                ))}
              </div>
            </div>
            <div className="text-xs font-mono text-zinc-500">
              Showing <span className="text-zinc-200 font-semibold">{filteredBuilds.length}</span> pipeline runs
            </div>
          </div>

          {isLoading && (
            <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading pipelines...</div>
          )}

          {!isLoading && filteredBuilds.length === 0 && (
            <div className="p-12 text-center text-xs font-mono text-zinc-500 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              No pipeline runs yet. Start one with Deploy on the Repositories page.
            </div>
          )}

          <div className="flex flex-col gap-4">
            {filteredBuilds.map((build) => {
              const isActive = ACTIVE_BUILD_STATUSES.includes(build.status);
              const isPending = pendingIds.has(build.id) || pendingIds.has(build.repositoryId);

              return (
                <article
                  key={build.id}
                  className="bg-zinc-900/70 border border-zinc-800/80 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-sm text-zinc-100">
                          {repositoryNames.get(build.repositoryId) ?? "Deleted repository"}
                        </span>
                        <BuildStatusBadge status={build.status} />
                        <span className="font-mono text-xs text-zinc-500">via {build.triggeredBy}</span>
                      </div>

                      <p className="text-xs text-zinc-300 font-medium truncate">
                        {build.commitMessage ?? "Latest commit on branch"}
                      </p>
                      {build.errorMessage && (
                        <p className="text-xs font-mono text-rose-400 break-words">{build.errorMessage}</p>
                      )}

                      <div className="flex items-center gap-3 text-xs font-mono text-zinc-400 flex-wrap mt-0.5">
                        <span className="flex items-center gap-1">
                          <GitCommit className="w-3 h-3 text-zinc-500" />
                          <span className="text-cyan-400">{shortCommit(build.commitHash)}</span>
                        </span>
                        <span>&bull;</span>
                        <span>
                          branch: <strong className="text-zinc-300">{build.branch ?? "--"}</strong>
                        </span>
                        <span>&bull;</span>
                        <span>started {formatRelativeTime(build.startedAt)}</span>
                        <span>&bull;</span>
                        <span>{isActive ? "running..." : formatDuration(build.durationSeconds)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                      <Link
                        to={`/deployments/${build.id}`}
                        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-mono text-xs font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-500"
                      >
                        <TerminalIcon className="w-4 h-4" />
                        <span>View Logs</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          void (isActive ? cancelBuild(build.id) : triggerBuild(build.repositoryId))
                        }
                        className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan-500"
                        title={isActive ? "Cancel build" : "Re-run pipeline"}
                      >
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isActive ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                </article>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeploymentsPage;
