import React, { useCallback, useMemo, useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { DomainCard } from "../components/dashboard/DomainCard";
import { EditSubdomainModal } from "../components/dashboard/EditSubdomainModal";
import { useUserRepositories } from "../hooks/useUserRepositories";
import { useBuilds } from "../hooks/useBuilds";
import { useRepositoryActions } from "../hooks/useRepositoryActions";
import { ACTIVE_BUILD_STATUSES } from "../types/dashboard";
import { Globe, ShieldCheck, CheckCircle2 } from "lucide-react";

const NOTICE_RESET_MS = 4000;

export const DomainsPage: React.FC = () => {
  const { repositories, isLoading, refetch } = useUserRepositories();
  const { builds } = useBuilds();
  const { renameSubdomain, pendingIds } = useRepositoryActions(refetch);
  const [editingRepositoryId, setEditingRepositoryId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const editingRepository = repositories.find((repository) => repository.id === editingRepositoryId) ?? null;

  const closeModal = useCallback(() => setEditingRepositoryId(null), []);

  const handleRenamed = useCallback((): void => {
    setEditingRepositoryId(null);
    setNotice("Subdomain updated. Your site now lives at the new address.");
    setTimeout(() => setNotice(null), NOTICE_RESET_MS);
  }, []);

  const repositoriesWithActiveBuild = useMemo(
    () =>
      new Set(
        builds.filter((build) => ACTIVE_BUILD_STATUSES.includes(build.status)).map((build) => build.repositoryId)
      ),
    [builds]
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
                  <Globe className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">Domains</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-cyan-400 font-mono text-xs font-semibold">
                  {repositories.length} {repositories.length === 1 ? "site" : "sites"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Choose the subdomain each site is served on. Every address gets HTTPS automatically.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Wildcard HTTPS via CloudFront</span>
            </div>
          </div>

          {notice && (
            <p
              role="status"
              className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-3"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {notice}
            </p>
          )}

          {isLoading && (
            <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading domains...</div>
          )}

          {!isLoading && repositories.length === 0 && (
            <div className="p-12 text-center text-xs font-mono text-zinc-500 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              No sites yet. Import a repository to get a subdomain.
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            {repositories.map((repository) => (
              <DomainCard key={repository.id} repository={repository} onEdit={setEditingRepositoryId} />
            ))}
          </div>
        </div>
      </main>

      {editingRepository && (
        <EditSubdomainModal
          key={editingRepository.id}
          repository={editingRepository}
          hasActiveBuild={repositoriesWithActiveBuild.has(editingRepository.id)}
          isRenaming={pendingIds.has(editingRepository.id)}
          onRename={renameSubdomain}
          onClose={closeModal}
          onRenamed={handleRenamed}
        />
      )}
    </div>
  );
};

export default DomainsPage;
