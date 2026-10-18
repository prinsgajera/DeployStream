import React, { useState } from "react";
import { BuildStatusBadge } from "./BuildStatusBadge";
import {
  Search,
  Plus,
  Box,
  GitBranch,
  Clock,
  Zap,
  Package,
  Rocket,
  Settings,
  Trash2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { formatRelativeTime } from "../../lib/format";
import type { Build, ImportedRepository } from "../../types/dashboard";

interface RepositoriesTabProps {
  repositories: ImportedRepository[];
  latestBuildByRepository: ReadonlyMap<string, Build>;
  pendingToggleIds: ReadonlySet<string>;
  pendingActionIds: ReadonlySet<string>;
  isLoading?: boolean;
  onOpenImportModal: () => void;
  onToggleAutoDeploy: (id: string, currentValue: boolean) => void;
  onDeploy: (id: string) => void;
  onOpenSettings: (id: string) => void;
  onDelete: (repository: ImportedRepository) => void;
}

const SKELETON_COUNT = 3;
const ACTION_BUTTON_CLASS =
  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan-500";

const RepositoryCardSkeleton: React.FC = () => (
  <div className="flex flex-col gap-4 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 animate-pulse">
    <div className="h-4 bg-zinc-800 rounded w-2/5" />
    <div className="h-3 bg-zinc-800/60 rounded w-3/5" />
    <div className="h-10 bg-zinc-800 rounded" />
  </div>
);

export const RepositoriesTab: React.FC<RepositoriesTabProps> = ({
  repositories,
  latestBuildByRepository,
  pendingToggleIds,
  pendingActionIds,
  isLoading = false,
  onOpenImportModal,
  onToggleAutoDeploy,
  onDeploy,
  onOpenSettings,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const query = searchQuery.toLowerCase();

  const filteredRepos = repositories.filter(
    (repo) =>
      repo.repoName.toLowerCase().includes(query) ||
      repo.framework.toLowerCase().includes(query) ||
      repo.branch.toLowerCase().includes(query)
  );

  return (
    <section className="flex flex-col gap-6 font-sans">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter repositories, branches, runtime..."
            aria-label="Filter repositories"
            className="w-full bg-zinc-900/80 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-zinc-100 placeholder:text-zinc-400 border border-zinc-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        <button
          type="button"
          onClick={onOpenImportModal}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 light:hover:bg-cyan-300 text-on-accent font-semibold text-xs shadow-lg shadow-cyan-950/40 transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          <Plus className="w-4 h-4" />
          <span>Connect New Repository</span>
        </button>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: SKELETON_COUNT }, (_, index) => (
            <RepositoryCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!isLoading && repositories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Package className="w-8 h-8 text-zinc-600" />
          </div>
          <div>
            <p className="text-zinc-300 font-semibold">No repositories yet</p>
            <p className="text-zinc-500 text-sm mt-1">Connect your first GitHub repository to get started</p>
          </div>
        </div>
      )}

      {!isLoading && filteredRepos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRepos.map((repo) => {
            const latestBuild = latestBuildByRepository.get(repo.id);
            const isBusy = pendingActionIds.has(repo.id);

            return (
              <article
                key={repo.id}
                className="flex flex-col justify-between bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 shadow-sm hover:border-zinc-700 transition-all duration-200 relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 left-0 bottom-0 w-1 ${repo.deployedUrl ? "bg-emerald-400" : "bg-zinc-700"}`}
                />

                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <Box className="w-5 h-5 text-cyan-400 shrink-0" />
                        <span className="font-semibold text-base text-zinc-100 truncate">{repo.repoName}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <GitBranch className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="text-xs font-mono text-zinc-400">{repo.branch}</span>
                        <span className="text-zinc-600">&bull;</span>
                        <span className="text-xs font-mono text-cyan-400">{repo.framework}</span>
                      </div>
                    </div>
                    {latestBuild && <BuildStatusBadge status={latestBuild.status} />}
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 flex flex-col gap-2">
                    {repo.deployedUrl ? (
                      <a
                        href={repo.deployedUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 truncate"
                      >
                        {repo.deployedUrl.replace("https://", "")}
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                    ) : (
                      <span className="font-mono text-xs text-zinc-500">Not deployed yet</span>
                    )}
                    <div className="flex items-center justify-between text-xs text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        Last deploy:
                        <strong className="text-zinc-200 font-mono ml-1">
                          {formatRelativeTime(repo.lastDeployedAt)}
                        </strong>
                      </span>
                      <span className="font-mono text-zinc-500">
                        {repo.successfulBuilds}/{repo.totalBuilds} succeeded
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onDeploy(repo.id)}
                      className={`${ACTION_BUTTON_CLASS} bg-cyan-500 hover:bg-cyan-400 light:hover:bg-cyan-300 text-on-accent`}
                    >
                      {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                      Deploy
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenSettings(repo.id)}
                      className={`${ACTION_BUTTON_CLASS} bg-zinc-800 hover:bg-zinc-700 text-zinc-100`}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Settings
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => onDelete(repo)}
                      className={`${ACTION_BUTTON_CLASS} bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400`}
                      aria-label={`Delete ${repo.repoName}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-zinc-800/60 -mx-6 -mb-6 px-6 py-3.5 bg-zinc-950/40 flex items-center justify-between rounded-b-2xl">
                  <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
                    <Zap className={`w-3.5 h-3.5 ${repo.autoDeploy ? "text-emerald-400" : "text-zinc-500"}`} />
                    Auto-Deploy Trigger
                  </span>
                  <label
                    className={`relative inline-flex items-center ${
                      pendingToggleIds.has(repo.id) ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={repo.autoDeploy}
                      onChange={() => onToggleAutoDeploy(repo.id, repo.autoDeploy)}
                      disabled={pendingToggleIds.has(repo.id)}
                      className="sr-only peer"
                      aria-label={`Auto-deploy ${repo.repoName}`}
                    />
                    <div className="w-9 h-5 bg-zinc-800 peer-focus-visible:ring-2 peer-focus-visible:ring-cyan-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-400" />
                  </label>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!isLoading && repositories.length > 0 && filteredRepos.length === 0 && (
        <div className="text-center py-12 text-zinc-500 text-sm font-mono">
          No repositories match &quot;<span className="text-zinc-300">{searchQuery}</span>&quot;
        </div>
      )}
    </section>
  );
};
