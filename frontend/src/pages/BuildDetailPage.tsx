import React from "react";
import { Link, useParams } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Breadcrumbs } from "../components/layout/Breadcrumbs";
import { LiveTerminalTab } from "../components/dashboard/LiveTerminalTab";
import { BuildStatusBadge } from "../components/dashboard/BuildStatusBadge";
import { useBuild } from "../hooks/useBuild";
import { useUserRepositories } from "../hooks/useUserRepositories";
import { formatDuration, formatRelativeTime, shortCommit } from "../lib/format";
import { ACTIVE_BUILD_STATUSES } from "../types/dashboard";
import { ArrowLeft, Clock, GitBranch, GitCommit, Rocket } from "lucide-react";
import { pageTitle } from "../lib/config";

const BUILD_REFERENCE_LENGTH = 6;

export const BuildDetailPage: React.FC = () => {
  const { buildId = "" } = useParams<{ buildId: string }>();
  const { build, isLoading, isNotFound, error } = useBuild(buildId);
  const { repositories } = useUserRepositories();

  const repositoryName = build
    ? (repositories.find((repository) => repository.id === build.repositoryId)?.repoName ?? "Deleted repository")
    : null;
  const buildReference = `Build #${buildId.slice(-BUILD_REFERENCE_LENGTH)}`;
  const isActive = build ? ACTIVE_BUILD_STATUSES.includes(build.status) : false;
  const documentTitle = build
    ? pageTitle(repositoryName ?? "Pipeline", buildReference)
    : pageTitle(isNotFound ? "Pipeline not found" : "Pipeline");

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <title>{documentTitle}</title>
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16 min-h-screen bg-zinc-950">
        <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
          <Breadcrumbs
            items={[
              { label: "Deployments", to: "/deployments" },
              { label: repositoryName ?? "Pipeline" },
              { label: buildReference },
            ]}
          />

          {isLoading && (
            <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading pipeline...</div>
          )}

          {!isLoading && (isNotFound || !build) && (
            <div className="flex flex-col items-center gap-4 p-12 text-center bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              <p className="text-sm font-semibold text-zinc-200">
                {isNotFound ? "This pipeline run doesn't exist." : "Couldn't load this pipeline run."}
              </p>
              {error && <p className="text-xs font-mono text-rose-400">{error}</p>}
              <Link
                to="/deployments"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-mono font-semibold text-zinc-100 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-500"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to all deployments
              </Link>
            </div>
          )}

          {build && (
            <>
              <header className="flex flex-col gap-4 pb-4 border-b border-zinc-800/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap min-w-0">
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                      <Rocket className="w-5 h-5" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-zinc-100 truncate">{repositoryName}</h1>
                    <BuildStatusBadge status={build.status} />
                    <span className="font-mono text-xs text-zinc-500">via {build.triggeredBy}</span>
                  </div>

                  <Link
                    to="/deployments"
                    className="flex items-center gap-2 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono font-semibold text-zinc-300 hover:text-zinc-100 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-500"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to all deployments
                  </Link>
                </div>

                <p className="text-sm text-zinc-300 font-medium">{build.commitMessage ?? "Latest commit on branch"}</p>

                <div className="flex items-center gap-x-4 gap-y-2 text-xs font-mono text-zinc-400 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <GitCommit className="w-3.5 h-3.5 text-zinc-500" />
                    <span className="text-cyan-400">{shortCommit(build.commitHash)}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GitBranch className="w-3.5 h-3.5 text-zinc-500" />
                    <strong className="text-zinc-300">{build.branch ?? "--"}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    started {formatRelativeTime(build.startedAt)}
                  </span>
                  <span>{isActive ? "running..." : `took ${formatDuration(build.durationSeconds)}`}</span>
                </div>

                {build.errorMessage && (
                  <p className="text-xs font-mono text-rose-400 bg-rose-950/30 border border-rose-900/40 rounded-xl p-3 break-words">
                    {build.errorMessage}
                  </p>
                )}
              </header>

              <section aria-label="Build logs">
                <LiveTerminalTab key={build.id} buildId={build.id} />
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BuildDetailPage;
