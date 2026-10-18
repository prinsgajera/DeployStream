import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { BuildStatusBadge } from "../components/dashboard/BuildStatusBadge";
import { useUserRepositories } from "../hooks/useUserRepositories";
import { useBuilds } from "../hooks/useBuilds";
import { formatDuration, formatRelativeTime } from "../lib/format";
import { LayoutDashboard, FolderGit2, Rocket, Globe, ArrowRight, Activity, Clock, Terminal } from "lucide-react";
import { pageTitle } from "../lib/config";

const RECENT_BUILD_COUNT = 5;
const PERCENT = 100;

interface MetricCardProps {
  label: string;
  value: string;
  caption: string;
  linkTo?: string;
  linkLabel?: string;
  icon: React.ReactNode;
  accentClass: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, caption, linkTo, linkLabel, icon, accentClass }) => (
  <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 hover:border-zinc-700 transition-all duration-200">
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono uppercase text-zinc-400 font-medium">{label}</span>
      <div className={`p-2 rounded-xl border ${accentClass}`}>{icon}</div>
    </div>
    <div>
      <div className="text-2xl font-mono font-bold text-zinc-100">{value}</div>
      <p className="text-xs text-zinc-400 mt-1">{caption}</p>
    </div>
    {linkTo && linkLabel && (
      <Link
        to={linkTo}
        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
      >
        <span>{linkLabel}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    )}
  </div>
);

export const DashboardPage: React.FC = () => {
  const { repositories } = useUserRepositories();
  const { builds, activeBuildCount } = useBuilds();

  const repositoryNames = useMemo(
    () => new Map(repositories.map((repository) => [repository.id, repository.repoName])),
    [repositories]
  );

  const metrics = useMemo(() => {
    const finished = builds.filter((build) => build.status === "SUCCESS" || build.status === "FAILED");
    const succeeded = finished.filter((build) => build.status === "SUCCESS");
    const durations = succeeded.flatMap((build) => (build.durationSeconds === null ? [] : [build.durationSeconds]));
    const averageSeconds = durations.length
      ? Math.round(durations.reduce((sum, seconds) => sum + seconds, 0) / durations.length)
      : null;
    const successRate = finished.length ? Math.round((succeeded.length / finished.length) * PERCENT) : null;
    return {
      averageSeconds,
      successRate,
      liveSites: repositories.filter((repository) => repository.deployedUrl).length,
    };
  }, [builds, repositories]);

  const recentBuilds = builds.slice(0, RECENT_BUILD_COUNT);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <title>{pageTitle("Dashboard")}</title>
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16 min-h-screen bg-zinc-950">
        <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
          <div className="pb-4 border-b border-zinc-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-100">Platform Overview</h1>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Deployment metrics across your connected repositories.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard
              label="Connected Repos"
              value={String(repositories.length)}
              caption="Imported from GitHub"
              linkTo="/repositories"
              linkLabel="Manage Repos"
              icon={<FolderGit2 className="w-4 h-4" />}
              accentClass="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
            />
            <MetricCard
              label="Active Pipelines"
              value={String(activeBuildCount)}
              caption={`${builds.length} total builds`}
              linkTo="/deployments"
              linkLabel="View Pipelines"
              icon={<Rocket className="w-4 h-4" />}
              accentClass="bg-amber-500/10 text-amber-400 border-amber-500/20"
            />
            <MetricCard
              label="Live Sites"
              value={String(metrics.liveSites)}
              caption="Deployed at least once"
              linkTo="/domains"
              linkLabel="View Domains"
              icon={<Globe className="w-4 h-4" />}
              accentClass="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
            />
            <MetricCard
              label="Avg Build Time"
              value={formatDuration(metrics.averageSeconds)}
              caption={metrics.successRate === null ? "No finished builds yet" : `${metrics.successRate}% build success rate`}
              icon={<Activity className="w-4 h-4" />}
              accentClass="bg-purple-500/10 text-purple-400 border-purple-500/20"
            />
          </div>

          <section className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-md flex flex-col">
            <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h2 className="font-bold text-sm text-zinc-100">Recent Deployment Activity</h2>
              </div>
              <Link
                to="/deployments"
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
              >
                <span>View All Pipelines</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentBuilds.length === 0 ? (
              <p className="p-8 text-center text-xs font-mono text-zinc-500">
                No deployments yet. Deploy a repository to see activity here.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-950 border-b border-zinc-800 text-xs uppercase font-mono text-zinc-400 tracking-wider">
                      <th className="py-3 px-5">Repository & Changes</th>
                      <th className="py-3 px-4">Trigger</th>
                      <th className="py-3 px-4">Started</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-5">Status</th>
                      <th className="py-3 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 text-xs">
                    {recentBuilds.map((build) => (
                      <tr key={build.id} className="hover:bg-zinc-950/50 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-200">
                              {repositoryNames.get(build.repositoryId) ?? "Deleted repository"}
                            </span>
                            <span className="text-zinc-400 truncate max-w-md">
                              {build.commitMessage ?? "Latest commit on branch"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-300">{build.triggeredBy}</td>
                        <td className="py-3.5 px-4 font-mono text-zinc-400">{formatRelativeTime(build.startedAt)}</td>
                        <td className="py-3.5 px-4 font-mono text-zinc-400">{formatDuration(build.durationSeconds)}</td>
                        <td className="py-3.5 px-5">
                          <BuildStatusBadge status={build.status} />
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <Link
                            to={`/deployments/${build.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-100 font-mono text-xs font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-cyan-500"
                            aria-label={`View logs for ${repositoryNames.get(build.repositoryId) ?? "deleted repository"}`}
                          >
                            <Terminal className="w-3.5 h-3.5" />
                            View Logs
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
