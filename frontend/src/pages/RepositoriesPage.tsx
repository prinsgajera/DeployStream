import React, { useState, useCallback } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { RepositoriesTab } from "../components/dashboard/RepositoriesTab";
import { ImportRepositoryModal } from "../components/dashboard/ImportRepositoryModal";
import { useUserRepositories } from "../hooks/useUserRepositories";
import { useToggleAutoDeploy } from "../hooks/useToggleAutoDeploy";
import { FolderGit2 } from "lucide-react";
import type { RepositoryItem, ImportedRepository } from "../types/dashboard";

function mapImportedToRepositoryItem(repo: ImportedRepository): RepositoryItem {
  return {
    id: repo.id,
    repoName: repo.repoName,
    fullName: repo.fullName,
    githubRepoId: repo.githubRepoId,
    subdomain: repo.subdomain,
    branch: repo.branch,
    framework: repo.framework,
    buildCommand: repo.buildCommand,
    outputDirectory: repo.outputDirectory,
    status: repo.isActive ? "active" : "inactive",
    isActive: repo.isActive,
    autoDeploy: repo.autoDeploy,
    lastDeployed: "Just now",
    commitHash: "7a9f2c1",
    commitMessage: "Initial deployment from GitHub",
    latencyMs: Math.floor(Math.random() * 40) + 15,
    environment: "Production",
    s3BucketUrl: repo.s3BucketUrl,
    createdAt: repo.createdAt,
    updatedAt: repo.updatedAt,
  };
}

export const RepositoriesPage: React.FC = () => {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [autoDeployOverrides, setAutoDeployOverrides] = useState<Record<string, boolean>>({});

  const { repositories: importedRepos, isLoading: reposLoading, refetch } = useUserRepositories();

  const handleOptimisticUpdate = useCallback((id: string, value: boolean) => {
    setAutoDeployOverrides((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleRevert = useCallback((id: string, originalValue: boolean) => {
    setAutoDeployOverrides((prev) => ({ ...prev, [id]: originalValue }));
  }, []);

  const { toggle, pendingIds } = useToggleAutoDeploy(handleOptimisticUpdate, handleRevert);

  const repositories: RepositoryItem[] = importedRepos.map((repo) => {
    const mapped = mapImportedToRepositoryItem(repo);
    if (autoDeployOverrides[repo.id] !== undefined) {
      mapped.autoDeploy = autoDeployOverrides[repo.id]!;
    }
    return mapped;
  });

  const handleToggleAutoDeploy = useCallback(
    (id: string, currentValue: boolean) => {
      void toggle(id, currentValue);
    },
    [toggle]
  );

  const handleImportComplete = useCallback(
    (_repo: ImportedRepository) => {
      refetch();
    },
    [refetch]
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16 min-h-screen bg-zinc-950">
        <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <FolderGit2 className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                  Repositories
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-cyan-400 font-mono text-xs font-semibold">
                  {repositories.length} connected
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Manage your imported GitHub repositories, CI/CD trigger automation, and build statuses.
              </p>
            </div>
          </div>

          <RepositoriesTab
            onOpenImportModal={() => setIsImportModalOpen(true)}
            repositories={repositories}
            onToggleAutoDeploy={handleToggleAutoDeploy}
            pendingToggleIds={pendingIds}
            isLoading={reposLoading}
          />
        </div>
      </main>

      <ImportRepositoryModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />
    </div>
  );
};

export default RepositoriesPage;
