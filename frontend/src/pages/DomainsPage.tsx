import React, { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { useUserRepositories } from "../hooks/useUserRepositories";
import { formatRelativeTime } from "../lib/format";
import { Globe, Check, ExternalLink, ShieldCheck, Box, Copy } from "lucide-react";

const COPIED_RESET_MS = 2000;

export const DomainsPage: React.FC = () => {
  const { repositories, isLoading } = useUserRepositories();
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleCopyUrl = async (url: string): Promise<void> => {
    await navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), COPIED_RESET_MS);
  };

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
                Each repository is served on its own subdomain over HTTPS.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Wildcard HTTPS via CloudFront</span>
            </div>
          </div>

          {isLoading && (
            <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading domains...</div>
          )}

          {!isLoading && repositories.length === 0 && (
            <div className="p-12 text-center text-xs font-mono text-zinc-500 bg-zinc-900/40 border border-zinc-800 rounded-2xl">
              No sites yet. Import a repository to get a subdomain.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4">
            {repositories.map((repository) => (
              <article
                key={repository.id}
                className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 rounded-xl bg-zinc-800 text-cyan-400 shrink-0">
                    <Box className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-zinc-100 truncate">{repository.repoName}</span>
                    <span className="text-xs font-mono text-zinc-400">
                      subdomain: <span className="text-cyan-400">{repository.subdomain}</span> &bull; deployed{" "}
                      {formatRelativeTime(repository.lastDeployedAt)}
                    </span>
                  </div>
                </div>

                {repository.deployedUrl ? (
                  <div className="flex items-center gap-2 min-w-0">
                    <a
                      href={repository.deployedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-mono text-xs text-cyan-400 hover:underline truncate flex items-center gap-1 font-semibold focus-visible:ring-2 focus-visible:ring-cyan-500 rounded"
                    >
                      {repository.deployedUrl}
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                    <button
                      type="button"
                      onClick={() => void handleCopyUrl(repository.deployedUrl ?? "")}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-all duration-200 active:scale-[0.98] cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-cyan-500"
                      aria-label="Copy live URL"
                    >
                      {copiedUrl === repository.deployedUrl ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </button>
                  </div>
                ) : (
                  <span className="font-mono text-xs text-zinc-500">Not deployed yet</span>
                )}
              </article>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DomainsPage;
