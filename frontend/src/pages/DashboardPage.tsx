import React from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { useUserRepositories } from "../hooks/useUserRepositories";
import {
  LayoutDashboard,
  FolderGit2,
  Rocket,
  Globe,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Zap,
  Activity,
  Clock,
} from "lucide-react";
import type { BuildHistoryItem } from "../types/dashboard";

const RECENT_BUILDS: BuildHistoryItem[] = [
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

export const DashboardPage: React.FC = () => {
  const { repositories } = useUserRepositories();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16 min-h-screen bg-zinc-950">
        <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                  Platform Overview
                </h1>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Real-time telemetry, cluster operational status, and deployment metrics.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/80 px-3.5 py-2 rounded-xl border border-zinc-800">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>US-East Cluster: <strong className="text-emerald-400 font-bold">100% Operational</strong></span>
            </div>
          </div>

          {/* Metric Overview Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1 */}
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-zinc-400 font-medium">
                  Connected Repos
                </span>
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <FolderGit2 className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-zinc-100">
                  {repositories.length}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">GitHub integration active</p>
              </div>
              <Link
                to="/repositories"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Manage Repos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2 */}
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-zinc-400 font-medium">
                  Active Pipelines
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Rocket className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-amber-400 flex items-center gap-2">
                  1 <span className="text-xs font-sans text-amber-400/80 font-normal">building</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">4 total builds history</p>
              </div>
              <Link
                to="/deployments"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>View Pipelines</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 3 */}
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-zinc-400 font-medium">
                  Subdomain Routes
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Globe className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-emerald-400">
                  {repositories.length > 0 ? repositories.length : 3}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">SSL Auto-Renewed</p>
              </div>
              <Link
                to="/domains"
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Configure Subdomains</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 4 */}
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden group hover:border-zinc-700 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-zinc-400 font-medium">
                  Avg Build Latency
                </span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-mono font-bold text-zinc-100">
                  42s
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">98.4% build success rate</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                Edge CDN Enabled
              </span>
            </div>
          </div>

          {/* Quick Navigation Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/repositories"
              className="p-6 bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/40 rounded-2xl flex flex-col gap-3 group transition-all shadow-sm hover:shadow-lg"
            >
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit border border-cyan-500/20 group-hover:scale-105 transition-transform">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-100 group-hover:text-cyan-400 transition-colors">
                  Import & Manage Repositories
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Connect public or private GitHub repos, manage runtime triggers, and view build metrics.
                </p>
              </div>
            </Link>

            <Link
              to="/deployments"
              className="p-6 bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/40 rounded-2xl flex flex-col gap-3 group transition-all shadow-sm hover:shadow-lg"
            >
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit border border-amber-500/20 group-hover:scale-105 transition-transform">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-100 group-hover:text-cyan-400 transition-colors">
                  Live Build Terminal & Pipelines
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Stream real-time log traces from isolated runner nodes and manage live deployments.
                </p>
              </div>
            </Link>

            <Link
              to="/domains"
              className="p-6 bg-zinc-900/60 border border-zinc-800/80 hover:border-cyan-500/40 rounded-2xl flex flex-col gap-3 group transition-all shadow-sm hover:shadow-lg"
            >
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit border border-emerald-500/20 group-hover:scale-105 transition-transform">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-100 group-hover:text-cyan-400 transition-colors">
                  Subdomain & Domain Management
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  Customize subdomains, inspect SSL certificates, and manage CNAME DNS records.
                </p>
              </div>
            </Link>
          </div>

          {/* Recent Activity Table */}
          <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-md flex flex-col">
            <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h2 className="font-bold text-sm text-zinc-100">
                  Recent Deployment Activity
                </h2>
              </div>
              <Link
                to="/deployments"
                className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>View All Pipelines</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-950 border-b border-zinc-800 text-[10px] uppercase font-mono text-zinc-400 tracking-wider">
                    <th className="py-3 px-5">Build ID</th>
                    <th className="py-3 px-4">Repository & Changes</th>
                    <th className="py-3 px-4">Author</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 text-xs">
                  {RECENT_BUILDS.map((build) => {
                    const isSuccess = build.status === "SUCCESS";
                    const isBuilding = build.status === "BUILDING";

                    return (
                      <tr key={build.id} className="hover:bg-zinc-950/50 transition-colors">
                        <td className="py-3.5 px-5 font-mono font-bold text-cyan-400">
                          {build.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-semibold text-zinc-200">{build.repoName}</span>
                            <span className="text-zinc-400 text-[11px] truncate max-w-md">
                              {build.commitMessage}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-zinc-300">
                          {build.author}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-400">
                          {build.duration}
                        </td>
                        <td className="py-3.5 px-5">
                          {isSuccess && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono text-[10px] font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              SUCCESS
                            </span>
                          )}
                          {isBuilding && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-950/60 text-amber-400 border border-amber-800/40 font-mono text-[10px] font-semibold">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              BUILDING
                            </span>
                          )}
                          {!isSuccess && !isBuilding && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-950/60 text-rose-400 border border-rose-800/40 font-mono text-[10px] font-semibold">
                              <XCircle className="w-3 h-3" />
                              FAILED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
