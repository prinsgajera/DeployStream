import React, { useState } from "react";
import { Box, Check, Copy, ExternalLink, Pencil } from "lucide-react";
import { formatRelativeTime } from "../../lib/format";
import { DEPLOYED_BASE_DOMAIN } from "../../lib/config";
import type { ImportedRepository } from "../../types/dashboard";

interface DomainCardProps {
  repository: ImportedRepository;
  onEdit: (repositoryId: string) => void;
}

const COPIED_RESET_MS = 2000;
const ICON_BUTTON_CLASS =
  "p-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 active:scale-[0.98] cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500";

export const DomainCard: React.FC<DomainCardProps> = ({ repository, onEdit }) => {
  const [isCopied, setIsCopied] = useState(false);
  const isLive = repository.deployedUrl !== null;

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(`https://${repository.subdomain}.${DEPLOYED_BASE_DOMAIN}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), COPIED_RESET_MS);
  };

  return (
    <article className="flex items-center justify-between gap-3 bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-4 md:p-5 shadow-sm hover:border-zinc-700 transition-all duration-200">
      <div className="flex items-center gap-4 min-w-0">
        <div className="p-2.5 rounded-xl bg-zinc-800 text-cyan-400 shrink-0">
          <Box className="w-5 h-5" />
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="font-semibold text-zinc-100 truncate">{repository.repoName}</h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-mono text-xs font-semibold ${
                isLive
                  ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/40"
                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-400" : "bg-zinc-500"}`} />
              {isLive ? "Live" : "Not deployed"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 min-w-0 text-xs font-mono text-zinc-400">
            <span className="text-cyan-400 truncate" title={`${repository.subdomain}.${DEPLOYED_BASE_DOMAIN}`}>
              {repository.subdomain}
            </span>
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="p-1 rounded text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800 transition-all duration-200 cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-cyan-500"
              aria-label="Copy site address"
              title="Copy address"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            {isLive && (
              <span className="hidden sm:inline shrink-0 text-zinc-500">
                &bull; deployed {formatRelativeTime(repository.lastDeployedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {repository.deployedUrl && (
          <a
            href={repository.deployedUrl}
            target="_blank"
            rel="noreferrer"
            className={ICON_BUTTON_CLASS}
            aria-label={`Open ${repository.repoName}`}
            title="Open site"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
        <button
          type="button"
          onClick={() => onEdit(repository.id)}
          className={ICON_BUTTON_CLASS}
          aria-label={`Edit subdomain for ${repository.repoName}`}
          title="Edit subdomain"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
    </article>
  );
};
