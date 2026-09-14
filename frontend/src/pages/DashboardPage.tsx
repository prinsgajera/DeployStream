import React, { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { RepositoriesTab } from "../components/dashboard/RepositoriesTab";
import { ProjectHistoryTab } from "../components/dashboard/ProjectHistoryTab";
import { LiveTerminalTab } from "../components/dashboard/LiveTerminalTab";
import { ImportRepositoryModal } from "../components/dashboard/ImportRepositoryModal";
import {
  GitBranch,
  Box,
  History,
  Terminal,
} from "lucide-react";
import type {
  RepositoryItem,
  BuildHistoryItem,
} from "../types/dashboard";

const INITIAL_REPOSITORIES: RepositoryItem[] = [
  {
    id: "repo-1",
    repoName: "my-react-app",
    fullName: "acme/my-react-app",
    githubRepoId: "101",
    branch: "main",
    framework: "React / Vite",
    status: "active",
    lastDeployed: "3m ago",
    commitHash: "7a9f2c1",
    commitMessage: "feat: added homepage dynamic hero & analytics",
    autoDeploy: true,
    latencyMs: 41,
    environment: "Production",
  },
  {
    id: "repo-2",
    repoName: "api-gateway-service",
    fullName: "acme/api-gateway-service",
    githubRepoId: "102",
    branch: "staging",
    framework: "Go / Gin",
    status: "active",
    lastDeployed: "18m ago",
    commitHash: "9c2d114",
    commitMessage: "chore: bump dependencies & security patches",
    autoDeploy: true,
    latencyMs: 12,
    environment: "Staging",
  },
  {
    id: "repo-3",
    repoName: "auth-microservice",
    fullName: "acme/auth-microservice",
    githubRepoId: "103",
    branch: "feature/oauth-v2",
    framework: "Node.js / Express",
    status: "inactive",
    lastDeployed: "2d ago",
    commitHash: "4e81b90",
    commitMessage: "fix: hydration mismatch on checkout modal",
    autoDeploy: false,
    latencyMs: 85,
    environment: "Sandbox",
  },
  {
    id: "repo-4",
    repoName: "customer-portal-next",
    fullName: "acme/customer-portal-next",
    githubRepoId: "104",
    branch: "main",
    framework: "Next.js 14 App",
    status: "active",
    lastDeployed: "42m ago",
    commitHash: "3f0a57e",
    commitMessage: "docs: update readme deployment instructions",
    autoDeploy: true,
    latencyMs: 28,
    environment: "Production",
  },
  {
    id: "repo-5",
    repoName: "payment-webhook-worker",
    fullName: "acme/payment-webhook-worker",
    githubRepoId: "105",
    branch: "production",
    framework: "Python / FastAPI",
    status: "active",
    lastDeployed: "1h ago",
    commitHash: "6b5e119",
    commitMessage: "refactor: optimize webhook payload retry queue",
    autoDeploy: true,
    latencyMs: 19,
    environment: "Production",
  },
];

const INITIAL_BUILDS: BuildHistoryItem[] = [
  {
    id: "#0026",
    repositoryId: "repo-1",
    repoName: "my-react-app",
    commitHash: "7a9f2c1",
    commitMessage: "feat: added homepage dynamic hero & analytics",
    author: "alex-dev",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
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
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
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
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    branch: "main",
    startedAt: "1 day ago",
    duration: "failed at 22s",
    status: "FAILED",
  },
  {
    id: "#0022",
    repositoryId: "repo-4",
    repoName: "customer-portal-next",
    commitHash: "3f0a57e",
    commitMessage: "docs: update readme deployment instructions",
    author: "sarah-eng",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
    branch: "docs/readme",
    startedAt: "2 days ago",
    duration: "took 44s",
    status: "SUCCESS",
  },
];

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"repositories" | "history" | "terminal">("repositories");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [repositories, setRepositories] = useState<RepositoryItem[]>(INITIAL_REPOSITORIES);
  const [builds] = useState<BuildHistoryItem[]>(INITIAL_BUILDS);
  const [selectedBuildId, setSelectedBuildId] = useState("#0026");

  const handleToggleAutoDeploy = (id: string) => {
    setRepositories((prev) =>
      prev.map((r) => (r.id === id ? { ...r, autoDeploy: !r.autoDeploy } : r))
    );
  };

  const handleImportComplete = (repoData: {
    repoName: string;
    fullName: string;
    branch: string;
    framework: string;
  }) => {
    const newRepo: RepositoryItem = {
      id: `repo-${Date.now()}`,
      repoName: repoData.repoName,
      fullName: repoData.fullName,
      githubRepoId: String(Date.now()),
      branch: repoData.branch,
      framework: repoData.framework,
      status: "active",
      lastDeployed: "Just now",
      commitHash: "a1b2c3d",
      commitMessage: "initial deployment trigger",
      autoDeploy: true,
      latencyMs: 32,
      environment: "Production",
    };
    setRepositories([newRepo, ...repositories]);
  };

  const handleViewLogs = (buildId: string) => {
    setSelectedBuildId(buildId);
    setActiveTab("terminal");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800">
      <Sidebar />
      <Header />

      {/* Main Content Area (pl-64 pt-16 - zero restrictive outer margins) */}
      <main className="pl-64 pt-16 min-h-screen w-full bg-zinc-950 px-8 py-6">
        <div className="flex flex-col w-full text-zinc-100 space-y-6">
          
          {/* PROJECT / CLUSTER TELEMETRY OVERVIEW HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                  Organization
                </span>
                <span className="text-zinc-600 font-mono">/</span>
                <span className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  Acme Corp
                  <span className="font-mono text-zinc-500 font-normal">/</span>
                  <span className="text-cyan-400 font-bold tracking-tight">
                    deploy-stream-cluster
                  </span>
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-900 text-zinc-300 font-mono text-[11px] border border-zinc-800 ml-2">
                  <GitBranch className="w-3 h-3 text-cyan-400" />
                  <span>main</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                  </span>
                  <span className="text-zinc-200">us-east-1 (Operational)</span>
                </div>
                <span className="text-zinc-700">&bull;</span>
                <span>Kubernetes v1.29.2</span>
                <span className="text-zinc-700">&bull;</span>
                <span>Edge Worker Pool #9</span>
              </div>
            </div>

            {/* Cluster Telemetry Summary Stats Pill */}
            <div className="flex items-center gap-4 bg-zinc-900/80 p-2.5 rounded-2xl border border-zinc-800 shadow-md self-start lg:self-auto">
              <div className="px-4 py-1 flex flex-col">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Deploys Today</span>
                <span className="text-lg font-bold font-mono text-zinc-100">47</span>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="px-4 py-1 flex flex-col">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Avg Duration</span>
                <span className="text-lg font-bold font-mono text-cyan-400">1m 14s</span>
              </div>
              <div className="w-px h-8 bg-zinc-800" />
              <div className="px-4 py-1 flex flex-col">
                <span className="text-[10px] font-mono uppercase text-zinc-400">Success Rate</span>
                <span className="text-lg font-bold font-mono text-emerald-400">99.2%</span>
              </div>
            </div>
          </div>

          {/* NAVIGATION TABS */}
          <div className="flex items-center justify-between gap-4 bg-zinc-900/80 p-1.5 rounded-2xl border border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Tab 1 */}
              <button
                type="button"
                onClick={() => setActiveTab("repositories")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "repositories"
                    ? "bg-zinc-800 text-cyan-400 border border-cyan-500/20 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                }`}
              >
                <Box className="w-4 h-4" />
                <span>Dashboard (Repositories)</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-950 text-cyan-400 font-mono text-[10px]">
                  {repositories.length} connected
                </span>
              </button>

              {/* Tab 2 */}
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "history"
                    ? "bg-zinc-800 text-cyan-400 border border-cyan-500/20 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                }`}
              >
                <History className="w-4 h-4" />
                <span>Project History</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-950 text-zinc-400 font-mono text-[10px]">
                  {builds.length} builds
                </span>
              </button>

              {/* Tab 3 */}
              <button
                type="button"
                onClick={() => setActiveTab("terminal")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === "terminal"
                    ? "bg-zinc-800 text-cyan-400 border border-cyan-500/20 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                }`}
              >
                <Terminal className="w-4 h-4" />
                <span>Live Build Terminal</span>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-800/40 font-mono text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                  <span>BUILDING {selectedBuildId}</span>
                </div>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 pr-3 text-xs font-mono">
              <span className="text-zinc-500">Socket stream:</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                synced
              </span>
            </div>
          </div>

          {/* TAB CONTENT VIEWS */}
          {activeTab === "repositories" && (
            <RepositoriesTab
              onOpenImportModal={() => setIsImportModalOpen(true)}
              repositories={repositories}
              onToggleAutoDeploy={handleToggleAutoDeploy}
            />
          )}

          {activeTab === "history" && (
            <ProjectHistoryTab
              builds={builds}
              onViewLogs={handleViewLogs}
            />
          )}

          {activeTab === "terminal" && (
            <LiveTerminalTab selectedBuildId={selectedBuildId} />
          )}
        </div>
      </main>

      {/* Repository Import Modal */}
      <ImportRepositoryModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

export default DashboardPage;
