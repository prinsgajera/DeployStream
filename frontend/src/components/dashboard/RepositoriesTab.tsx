import React, { useState } from "react";
import { Sparkline } from "./Sparkline";
import {
  Search,
  SlidersHorizontal,
  Plus,
  Box,
  GitBranch,
  Clock,
  Zap,
  Package,
} from "lucide-react";
import type { RepositoryItem } from "../../types/dashboard";

interface RepositoriesTabProps {
  onOpenImportModal: () => void;
  repositories: RepositoryItem[];
  onToggleAutoDeploy: (id: string, currentValue: boolean) => void;
  pendingToggleIds: Set<string>;
  isLoading?: boolean;
}

const RepositoryCardSkeleton: React.FC = () => (
  <div className="flex flex-col justify-between bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 shadow-sm animate-pulse relative overflow-hidden">
    <div className="absolute top-0 left-0 bottom-0 w-1 bg-zinc-800" />
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-4 bg-zinc-800 rounded w-2/5" />
          <div className="h-3 bg-zinc-800/60 rounded w-3/5" />
        </div>
        <div className="h-5 w-16 bg-zinc-800 rounded-full" />
      </div>
      <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
        <div className="h-3 bg-zinc-800 rounded w-1/4 mb-2" />
        <div className="h-5 bg-zinc-800 rounded w-1/3" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-3 bg-zinc-800 rounded w-2/5" />
        <div className="h-3 bg-zinc-800 rounded w-1/4" />
      </div>
    </div>
    <div className="mt-5 pt-4 border-t border-zinc-800/60 -mx-6 -mb-6 px-6 py-3.5 bg-zinc-950/40 flex items-center justify-between rounded-b-2xl">
      <div className="h-3 bg-zinc-800 rounded w-1/3" />
      <div className="w-9 h-5 bg-zinc-800 rounded-full" />
    </div>
  </div>
);

export const RepositoriesTab: React.FC<RepositoriesTabProps> = ({
  onOpenImportModal,
  repositories,
  onToggleAutoDeploy,
  pendingToggleIds,
  isLoading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRepos = repositories.filter(
    (repo) =>
      repo.repoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.framework.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.branch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="flex flex-col gap-6 font-sans">
      {/* Action Bar & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter repositories, branches, runtime..."
            className="w-full bg-zinc-900/80 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-400 border border-zinc-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-zinc-400" />
            <span>Filter</span>
          </button>

          <button
            type="button"
            onClick={onOpenImportModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs shadow-lg shadow-cyan-950/40 transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Connect New Repository</span>
          </button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <RepositoryCardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && repositories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Package className="w-8 h-8 text-zinc-600" />
          </div>
          <div>
            <p className="text-zinc-300 font-semibold">No repositories yet</p>
            <p className="text-zinc-500 text-sm mt-1">Connect your first GitHub repository to get started</p>
          </div>
          <button
            type="button"
            onClick={onOpenImportModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs shadow-lg shadow-cyan-950/40 transition-all active:scale-[0.98] cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Import Repository</span>
          </button>
        </div>
      )}

      {/* Repository Cards Grid */}
      {!isLoading && filteredRepos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRepos.map((repo) => {
            const isActive = repo.status === "active" || repo.isActive;
            return (
              <div
                key={repo.id}
                className="flex flex-col justify-between bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 shadow-sm hover:shadow-xl hover:border-zinc-700 transition-all group relative overflow-hidden cursor-pointer"
              >
                {/* Left Color Accent Bar */}
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1 ${isActive ? "bg-emerald-400" : "bg-zinc-700"
                    }`}
                />

                <div className="flex flex-col gap-4">
                  {/* Header info */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-base text-zinc-100 group-hover:text-cyan-400 transition-colors truncate">
                          {repo.repoName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <GitBranch className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="text-xs font-mono text-zinc-400">{repo.branch}</span>
                        <span className="text-zinc-600">&bull;</span>
                        <span className="text-xs font-mono text-cyan-400">{repo.framework}</span>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase font-mono font-semibold tracking-wider shrink-0 ${isActive
                          ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                          : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}
                    >
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                      {isActive ? "active" : "inactive"}
                    </span>
                  </div>

                  {/* Recent Latency & Sparkline */}
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-mono text-zinc-400">
                        Recent Latency
                      </span>
                      <span className="text-sm font-mono font-bold text-zinc-100 mt-0.5">
                        {repo.latencyMs ?? "--"}ms avg
                      </span>
                    </div>
                    <Sparkline color={isActive ? "text-emerald-400" : "text-zinc-600"} />
                  </div>

                  {/* Commit info or deploy info */}
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      {repo.lastDeployed ? (
                        <>Last deployed: <strong className="text-zinc-200 font-mono ml-1">{repo.lastDeployed}</strong></>
                      ) : (
                        <span className="text-zinc-600">Not yet deployed</span>
                      )}
                    </span>
                    {repo.commitHash && (
                      <span className="font-mono text-[11px] text-zinc-500">
                        commit <span className="text-cyan-400 font-medium">{repo.commitHash}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Auto-Deploy Trigger Switch */}
                <div className="mt-5 pt-4 border-t border-zinc-800/60 -mx-6 -mb-6 px-6 py-3.5 bg-zinc-950/40 flex items-center justify-between rounded-b-2xl">
                  <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                    <Zap className={`w-3.5 h-3.5 ${repo.autoDeploy ? "text-emerald-400" : "text-zinc-500"}`} />
                    Auto-Deploy Trigger
                  </span>
                  <label
                    className={`relative inline-flex items-center ${pendingToggleIds.has(repo.id) ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={repo.autoDeploy ?? false}
                      onChange={() => onToggleAutoDeploy(repo.id, repo.autoDeploy)}
                      disabled={pendingToggleIds.has(repo.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-400" />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* No Search Results */}
      {!isLoading && repositories.length > 0 && filteredRepos.length === 0 && (
        <div className="text-center py-12 text-zinc-500 text-sm font-mono">
          No repositories match "<span className="text-zinc-300">{searchQuery}</span>"
        </div>
      )}
    </section>
  );
};
