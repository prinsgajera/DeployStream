import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { RepositoriesTab } from "../components/dashboard/RepositoriesTab";
import { ImportRepositoryModal } from "../components/dashboard/ImportRepositoryModal";
import { RepositorySettingsModal } from "../components/dashboard/RepositorySettingsModal";
import { useUserRepositories } from "../hooks/useUserRepositories";
import { useToggleAutoDeploy } from "../hooks/useToggleAutoDeploy";
import { useBuilds } from "../hooks/useBuilds";
import { useBuildActions } from "../hooks/useBuildActions";
import { useRepositoryActions } from "../hooks/useRepositoryActions";
import { FolderGit2 } from "lucide-react";
import type { Build, ImportedRepository, RepositorySettingsPayload } from "../types/dashboard";

export const RepositoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [settingsRepositoryId, setSettingsRepositoryId] = useState<string | null>(null);
  const [autoDeployOverrides, setAutoDeployOverrides] = useState<Record<string, boolean>>({});

  const { repositories: importedRepos, isLoading: reposLoading, refetch } = useUserRepositories();
  const { builds, refetch: refetchBuilds } = useBuilds();
  const { triggerBuild, pendingIds: deployingIds, error: deployError } = useBuildActions(refetchBuilds);
  const {
    deleteRepository,
    updateSettings,
    pendingIds: repositoryActionIds,
    error: repositoryError,
  } = useRepositoryActions(refetch);

  const handleOptimisticUpdate = useCallback((id: string, value: boolean) => {
    setAutoDeployOverrides((prev) => ({ ...prev, [id]: value }));
  }, []);

  const handleRevert = useCallback((id: string, originalValue: boolean) => {
    setAutoDeployOverrides((prev) => ({ ...prev, [id]: originalValue }));
  }, []);

  const { toggle, pendingIds: toggleIds } = useToggleAutoDeploy(handleOptimisticUpdate, handleRevert);

  const repositories: ImportedRepository[] = importedRepos.map((repo) => ({
    ...repo,
    autoDeploy: autoDeployOverrides[repo.id] ?? repo.autoDeploy,
  }));

  const latestBuildByRepository = useMemo(() => {
    const latest = new Map<string, Build>();
    builds.forEach((build) => {
      if (!latest.has(build.repositoryId)) latest.set(build.repositoryId, build);
    });
    return latest;
  }, [builds]);

  const pendingActionIds = useMemo(
    () => new Set([...deployingIds, ...repositoryActionIds]),
    [deployingIds, repositoryActionIds]
  );

  const settingsRepository = repositories.find((repo) => repo.id === settingsRepositoryId) ?? null;

  const handleDeploy = useCallback(
    async (id: string): Promise<void> => {
      const build = await triggerBuild(id);
      if (build) navigate("/deployments");
    },
    [triggerBuild, navigate]
  );

  const handleDelete = useCallback(
    async (repository: ImportedRepository): Promise<void> => {
      const confirmed = window.confirm(
        `Delete ${repository.repoName}? This removes its deployed files, build history and GitHub webhook.`
      );
      if (confirmed) await deleteRepository(repository.id);
    },
    [deleteRepository]
  );

  const handleSaveSettings = useCallback(
    async (payload: RepositorySettingsPayload): Promise<void> => {
      if (!settingsRepositoryId) return;
      const saved = await updateSettings(settingsRepositoryId, payload);
      if (saved) setSettingsRepositoryId(null);
    },
    [settingsRepositoryId, updateSettings]
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
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">Repositories</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-cyan-400 font-mono text-xs font-semibold">
                  {repositories.length} connected
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Deploy, configure and manage your imported GitHub repositories.
              </p>
            </div>
          </div>

          {(deployError || (repositoryError && !settingsRepository)) && (
            <p className="text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-900/40 rounded-lg p-3">
              {deployError ?? repositoryError}
            </p>
          )}

          <RepositoriesTab
            repositories={repositories}
            latestBuildByRepository={latestBuildByRepository}
            pendingToggleIds={toggleIds}
            pendingActionIds={pendingActionIds}
            isLoading={reposLoading}
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onToggleAutoDeploy={(id, currentValue) => void toggle(id, currentValue)}
            onDeploy={(id) => void handleDeploy(id)}
            onOpenSettings={setSettingsRepositoryId}
            onDelete={(repository) => void handleDelete(repository)}
          />
        </div>
      </main>

      <ImportRepositoryModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={() => refetch()}
      />

      {settingsRepository && (
        <RepositorySettingsModal
          key={settingsRepository.id}
          repository={settingsRepository}
          isSaving={repositoryActionIds.has(settingsRepository.id)}
          error={repositoryError}
          onClose={() => setSettingsRepositoryId(null)}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
};

export default RepositoriesPage;
