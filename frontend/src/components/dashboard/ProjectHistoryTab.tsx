import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  GitCommit,
  Download,
  RotateCcw,
  X,
} from "lucide-react";
import type { BuildHistoryItem, BuildStatusType } from "../../types/dashboard";

interface ProjectHistoryTabProps {
  builds: BuildHistoryItem[];
  onViewLogs: (buildId: string) => void;
}

export const ProjectHistoryTab: React.FC<ProjectHistoryTabProps> = ({
  builds,
  onViewLogs,
}) => {
  const [filterStatus, setFilterStatus] = useState<"ALL" | BuildStatusType>("ALL");
  const [selectedRepoFilter, setSelectedRepoFilter] = useState("all");

  const filteredBuilds = builds.filter((b) => {
    const matchesStatus = filterStatus === "ALL" || b.status === filterStatus;
    const matchesRepo =
      selectedRepoFilter === "all" || b.repositoryId === selectedRepoFilter;
    return matchesStatus && matchesRepo;
  });

  return (
    <section className="flex flex-col gap-6 font-sans">
      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 shadow-sm">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-mono text-zinc-400">Repository:</span>
            <select
              value={selectedRepoFilter}
              onChange={(e) => setSelectedRepoFilter(e.target.value)}
              className="bg-zinc-950 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-400 font-medium border border-zinc-800 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="all">All Repositories</option>
              <option value="repo-1">my-react-app (main)</option>
              <option value="repo-2">api-gateway-service (staging)</option>
              <option value="repo-3">customer-portal-next (main)</option>
            </select>
          </div>

          <div className="h-6 w-px bg-zinc-800 hidden sm:block" />

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {(["ALL", "SUCCESS", "BUILDING", "FAILED"] as const).map((st) => (
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
                {st === "ALL" ? "All" : st === "SUCCESS" ? "Succeeded" : st === "BUILDING" ? "In Progress" : "Failed"}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors shadow-sm cursor-pointer self-end md:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Telemetry Table */}
      <div className="overflow-x-auto bg-zinc-900/80 rounded-2xl border border-zinc-800 shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
              <th className="py-3.5 px-6">Build ID</th>
              <th className="py-3.5 px-4">Commit & Changes</th>
              <th className="py-3.5 px-4">Author & Branch</th>
              <th className="py-3.5 px-4">Timing & Duration</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-xs">
            {filteredBuilds.map((build) => {
              const isSuccess = build.status === "SUCCESS";
              const isBuilding = build.status === "BUILDING";
              const isFailed = build.status === "FAILED";

              return (
                <tr
                  key={build.id}
                  className="hover:bg-zinc-950/60 transition-colors group"
                >
                  {/* Build ID */}
                  <td className="py-4 px-6 font-mono font-semibold text-cyan-400">
                    <div className="flex items-center gap-2">
                      {isBuilding && <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                      <span
                        onClick={() => onViewLogs(build.id)}
                        className="hover:underline cursor-pointer"
                      >
                        {build.id}
                      </span>
                    </div>
                  </td>

                  {/* Commit & Changes */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-zinc-100">{build.commitMessage}</span>
                      <span className="font-mono text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                        <GitCommit className="w-3 h-3 text-zinc-500" />
                        <span className="text-cyan-400">{build.commitHash}</span>
                        <span>&bull; {build.repoName}</span>
                      </span>
                    </div>
                  </td>

                  {/* Author & Branch */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2.5">
                      {build.authorAvatar ? (
                        <img
                          src={build.authorAvatar}
                          alt={build.author}
                          className="w-6 h-6 rounded-full border border-zinc-700 object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-[10px]">
                          {build.author.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-200">{build.author}</span>
                        <span className="font-mono text-[11px] text-zinc-400">{build.branch}</span>
                      </div>
                    </div>
                  </td>

                  {/* Timing & Duration */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col font-mono text-[11px]">
                      <span className="text-zinc-300">{build.startedAt}</span>
                      <span
                        className={
                          isBuilding
                            ? "text-amber-400"
                            : isFailed
                            ? "text-rose-400"
                            : "text-zinc-400"
                        }
                      >
                        {build.duration}
                      </span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-4">
                    {isSuccess && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono text-[11px] font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        SUCCESS
                      </span>
                    )}

                    {isBuilding && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/40 font-mono text-[11px] font-semibold">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                        BUILDING
                      </span>
                    )}

                    {isFailed && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/40 font-mono text-[11px] font-semibold">
                        <XCircle className="w-3.5 h-3.5" />
                        FAILED
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewLogs(build.id)}
                        className={`px-3 py-1 rounded-lg font-mono text-xs font-medium transition-colors shadow-sm cursor-pointer ${
                          isFailed
                            ? "bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/60"
                            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                        }`}
                      >
                        View Logs
                      </button>

                      {isBuilding ? (
                        <button
                          type="button"
                          className="p-1 rounded-lg text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Cancel Build"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                          title="Redeploy Build"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
