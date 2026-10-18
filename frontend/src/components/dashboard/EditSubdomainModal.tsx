import React, { useEffect, useState } from "react";
import { X, Loader2, ArrowRight, Info, Globe } from "lucide-react";
import { SubdomainField } from "./SubdomainField";
import { useSubdomainAvailability } from "../../hooks/useSubdomainAvailability";
import { DEPLOYED_BASE_DOMAIN } from "../../lib/config";
import type { ImportedRepository } from "../../types/dashboard";

interface EditSubdomainModalProps {
  repository: ImportedRepository;
  hasActiveBuild: boolean;
  isRenaming: boolean;
  onRename: (repositoryId: string, subdomain: string) => Promise<string | null>;
  onClose: () => void;
  onRenamed: () => void;
}

const BUTTON_CLASS =
  "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan-500";

export const EditSubdomainModal: React.FC<EditSubdomainModalProps> = ({
  repository,
  hasActiveBuild,
  isRenaming,
  onRename,
  onClose,
  onRenamed,
}) => {
  const [draft, setDraft] = useState(repository.subdomain);
  const [error, setError] = useState<string | null>(null);

  const { status, suggestions } = useSubdomainAvailability(draft, repository.subdomain, repository.id);
  const isDeployed = repository.deployedUrl !== null;
  const hasChanged = draft !== repository.subdomain;
  const canSave = status === "available" && !isRenaming && !hasActiveBuild;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && !isRenaming) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRenaming, onClose]);

  const handleChange = (value: string): void => {
    setDraft(value);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!canSave) return;
    const failure = await onRename(repository.id, draft);
    if (failure) {
      setError(failure);
      return;
    }
    onRenamed();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-950/80 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isRenaming) onClose();
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-subdomain-title"
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full sm:max-w-lg max-h-full overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col"
      >
        <header className="flex items-start justify-between gap-4 p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
              <Globe className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 id="edit-subdomain-title" className="font-semibold text-zinc-100">
                Edit subdomain
              </h2>
              <p className="text-xs font-mono text-zinc-500 truncate">{repository.repoName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isRenaming}
            className="p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-cyan-500"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="edit-subdomain-input" className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Site subdomain
            </label>
            <SubdomainField
              id="edit-subdomain-input"
              value={draft}
              status={status}
              suggestions={suggestions}
              disabled={hasActiveBuild || isRenaming}
              autoFocus
              onChange={handleChange}
            />
          </div>

          {hasActiveBuild && (
            <p className="flex items-start gap-2 text-xs text-amber-400 bg-amber-950/30 border border-amber-900/40 rounded-xl p-3">
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              A build is running for this site. You can rename it once the build finishes.
            </p>
          )}

          {hasChanged && status === "available" && (
            <div className="flex flex-col gap-2 bg-zinc-950 border border-zinc-800 rounded-xl p-4">
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">What will change</p>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono">
                <span className="text-zinc-500 line-through break-all">
                  {repository.subdomain}.{DEPLOYED_BASE_DOMAIN}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                <span className="text-emerald-400 break-all">
                  {draft}.{DEPLOYED_BASE_DOMAIN}
                </span>
              </p>
              <p className="text-xs text-zinc-400">
                {isDeployed
                  ? "The old address stops working right away. Your files move to the new address, so no rebuild is needed."
                  : "This site isn't deployed yet. The new address goes live after the first deployment."}
              </p>
            </div>
          )}

          {error && (
            <p
              role="alert"
              className="text-xs font-mono text-rose-400 bg-rose-950/40 border border-rose-900/40 rounded-xl p-3"
            >
              {error}
            </p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 p-5 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isRenaming}
            className={`${BUTTON_CLASS} bg-zinc-800 hover:bg-zinc-700 text-zinc-200`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSave}
            className={`${BUTTON_CLASS} bg-cyan-500 hover:bg-cyan-400 light:hover:bg-cyan-300 text-on-accent`}
          >
            {isRenaming && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {isRenaming ? "Saving..." : "Save subdomain"}
          </button>
        </footer>
      </form>
    </div>
  );
};
