import React, { useState, useEffect } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { useUserRepositories } from "../hooks/useUserRepositories";
import {
  Globe,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  Save,
  Box,
  Copy,
  Info,
  Sparkles,
} from "lucide-react";

interface DomainConfig {
  repoId: string;
  repoName: string;
  subdomain: string;
  customDomain?: string;
  framework: string;
  sslActive: boolean;
}

export const DomainsPage: React.FC = () => {
  const { repositories: importedRepos, isLoading } = useUserRepositories();
  const [domainConfigs, setDomainConfigs] = useState<DomainConfig[]>([]);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  useEffect(() => {
    if (importedRepos.length > 0) {
      const initialConfigs: DomainConfig[] = importedRepos.map((repo) => ({
        repoId: repo.id,
        repoName: repo.repoName,
        subdomain: repo.subdomain || repo.repoName.toLowerCase().replace(/[^a-z0-9-]/g, ""),
        customDomain: "",
        framework: repo.framework,
        sslActive: true,
      }));
      setDomainConfigs(initialConfigs);
    } else {
      // Default demo configs if no repos imported yet
      setDomainConfigs([
        {
          repoId: "demo-1",
          repoName: "my-react-app",
          subdomain: "my-react-app",
          customDomain: "app.acmedev.com",
          framework: "Vite / React",
          sslActive: true,
        },
        {
          repoId: "demo-2",
          repoName: "auth-microservice",
          subdomain: "auth-api",
          customDomain: "",
          framework: "Next.js",
          sslActive: true,
        },
        {
          repoId: "demo-3",
          repoName: "api-gateway-service",
          subdomain: "gateway-prod",
          customDomain: "",
          framework: "Node.js / Express",
          sslActive: true,
        },
      ]);
    }
  }, [importedRepos]);

  const handleSubdomainChange = (repoId: string, value: string) => {
    // Sanitize input for valid subdomain format
    const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setDomainConfigs((prev) =>
      prev.map((item) =>
        item.repoId === repoId ? { ...item, subdomain: sanitized } : item
      )
    );
  };

  const handleCustomDomainChange = (repoId: string, value: string) => {
    setDomainConfigs((prev) =>
      prev.map((item) =>
        item.repoId === repoId ? { ...item, customDomain: value } : item
      )
    );
  };

  const handleSaveDomain = (repoId: string) => {
    setSavedSuccessId(repoId);
    setTimeout(() => setSavedSuccessId(null), 2500);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedDomain(url);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <Sidebar />
      <Header />

      <main className="ml-64 pt-16 min-h-screen bg-zinc-950">
        <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col gap-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Globe className="w-5 h-5" />
                </div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-100">
                  Domains & Routing Configuration
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-cyan-400 font-mono text-xs font-semibold">
                  {domainConfigs.length} configured
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                Configure custom subdomains, manage SSL encryption certificates, and route deployments to edge CDN endpoints.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Global Wildcard SSL Active (*.deploystream.io)</span>
            </div>
          </div>

          {/* Domain Configurations Listing */}
          {isLoading ? (
            <div className="p-12 text-center text-xs font-mono text-zinc-500">
              Loading deployment domain configurations...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {domainConfigs.map((config) => {
                const liveUrl = `https://${config.subdomain}.deploystream.io`;
                const isSaved = savedSuccessId === config.repoId;

                return (
                  <div
                    key={config.repoId}
                    className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 shadow-sm flex flex-col gap-6"
                  >
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-zinc-800 text-cyan-400">
                          <Box className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-base text-zinc-100">
                            {config.repoName}
                          </span>
                          <span className="text-xs font-mono text-cyan-400/80">
                            {config.framework}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono text-xs font-semibold">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          SSL Auto-Renewed
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-400 border border-cyan-800/40 font-mono text-xs font-semibold">
                          <Zap className="w-3.5 h-3.5" />
                          CDN Active
                        </span>
                      </div>
                    </div>

                    {/* Subdomain Input Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Subdomain Form */}
                      <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-zinc-200">
                          DeployStream Subdomain
                        </label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1 flex items-center bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500">
                            <input
                              type="text"
                              value={config.subdomain}
                              onChange={(e) =>
                                handleSubdomainChange(config.repoId, e.target.value)
                              }
                              placeholder="my-app-subdomain"
                              className="w-full bg-transparent px-3 py-2.5 text-xs font-mono text-cyan-400 focus:outline-none placeholder:text-zinc-600"
                            />
                            <span className="bg-zinc-900 px-3 py-2.5 text-xs font-mono text-zinc-400 border-l border-zinc-800 select-none">
                              .deploystream.io
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleSaveDomain(config.repoId)}
                            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-all shadow-md shadow-cyan-950/40 cursor-pointer shrink-0"
                          >
                            {isSaved ? (
                              <>
                                <Check className="w-4 h-4 text-zinc-950" />
                                <span>Saved!</span>
                              </>
                            ) : (
                              <>
                                <Save className="w-4 h-4" />
                                <span>Save</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Only lowercase alphanumeric characters and hyphens allowed.
                        </p>
                      </div>

                      {/* Optional Custom Domain */}
                      <div className="flex flex-col gap-3">
                        <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                          <span>Custom Domain (Optional)</span>
                          <span className="text-[10px] text-zinc-400 font-mono">CNAME required</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={config.customDomain || ""}
                            onChange={(e) =>
                              handleCustomDomainChange(config.repoId, e.target.value)
                            }
                            placeholder="app.yourdomain.com"
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 placeholder:text-zinc-600"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveDomain(config.repoId)}
                            className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs border border-zinc-700 transition-colors cursor-pointer shrink-0"
                          >
                            Update
                          </button>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-mono">
                          Point CNAME record to <code className="text-cyan-400">cname.deploystream.io</code>
                        </p>
                      </div>
                    </div>

                    {/* Live Preview Box */}
                    <div className="flex items-center gap-2 min-w-0">
                      <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs font-mono text-zinc-400">Live Endpoint:</span>
                      <a
                        href={liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-xs text-cyan-400 hover:underline truncate flex items-center gap-1 font-semibold"
                      >
                        {liveUrl}
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(liveUrl)}
                        className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-mono text-zinc-300 border border-zinc-800 transition-colors cursor-pointer shrink-0"
                      >
                        {copiedDomain === liveUrl ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DomainsPage;
