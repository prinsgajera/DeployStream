import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Search,
  Check,
  ChevronRight,
  Plus,
  Trash2,
  Lock,
  Globe,
  Key,
  Rocket,
  GitBranch,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { GitHubRepoOption, EnvironmentVariable, ImportedRepository } from "../../types/dashboard";
import { useGitHubRepos } from "../../hooks/useGitHubRepos";
import { apiClient } from "../../lib/apiClient";
import axios from "axios";

interface ImportRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (repo: ImportedRepository) => void;
}

function generateSubdomain(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
}

function formatUpdatedAt(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHours / 24);
    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

const RepoListSkeleton: React.FC = () => (
  <div className="space-y-2.5">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 bg-zinc-800 rounded w-2/5" />
            <div className="h-3 bg-zinc-800/60 rounded w-3/5" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const ImportRepositoryModal: React.FC<ImportRepositoryModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const { repos, isLoading: reposLoading, error: reposError, refetch } = useGitHubRepos();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepoOption | null>(null);

  const [framework, setFramework] = useState("React / Vite");
  const [branch, setBranch] = useState("main");
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [outputDirectory, setOutputDirectory] = useState("dist");
  const [subdomain, setSubdomain] = useState("");

  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([]);

  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  useEffect(() => {
    if (selectedRepo) {
      setBranch(selectedRepo.default_branch);
      setSubdomain(generateSubdomain(selectedRepo.full_name));
    }
  }, [selectedRepo]);

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setSearchQuery("");
      setSelectedRepo(null);
      setFramework("React / Vite");
      setBranch("main");
      setBuildCommand("npm run build");
      setOutputDirectory("dist");
      setSubdomain("");
      setEnvVars([]);
      setImportError(null);
      setImportSuccess(false);
    }
  }, [isOpen]);

  const filteredRepos = useMemo(
    () =>
      repos.filter(
        (repo) =>
          repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.name.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [repos, searchQuery]
  );

  const addEnvVar = () => {
    setEnvVars((prev) => [
      ...prev,
      { id: Date.now().toString(), key: "", value: "", isSecret: false },
    ]);
  };

  const removeEnvVar = (id: string) => {
    setEnvVars((prev) => prev.filter((v) => v.id !== id));
  };

  const updateEnvVar = (id: string, field: keyof EnvironmentVariable, val: string | boolean) => {
    setEnvVars((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: val } : v))
    );
  };

  const handleDeploy = async () => {
    if (!selectedRepo) return;
    setIsImporting(true);
    setImportError(null);

    try {
      const { data: imported } = await apiClient.post<ImportedRepository>("/api/repositories/import", {
        githubRepoId: String(selectedRepo.id),
        repoName: selectedRepo.name,
        fullName: selectedRepo.full_name,
        subdomain,
        branch,
        framework,
        buildCommand,
        outputDirectory,
        envVars: envVars
          .filter((v) => v.key.trim() !== "")
          .map(({ key, value, isSecret }) => ({ key, value, isSecret })),
      });

      setImportSuccess(true);

      setTimeout(() => {
        onImportComplete(imported);
        onClose();
      }, 1200);
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data as { message?: string })?.message ?? "Import failed. Please try again."
        : "Import failed.";
      setImportError(message);
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans selection:bg-zinc-800">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">Import GitHub Repository</h2>
              <p className="text-xs text-zinc-400">Configure deployment settings and environment variables</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Steps Progress */}
        <div className="px-6 py-3 border-b border-zinc-800/60 bg-zinc-950/30 flex items-center justify-between text-xs font-mono shrink-0">
          {(
            [
              { num: 1, label: "Select Repository" },
              { num: 2, label: "Build Config" },
              { num: 3, label: "Environment Vars" },
            ] as const
          ).map((s, idx) => (
            <React.Fragment key={s.num}>
              {idx > 0 && <ChevronRight className="w-4 h-4 text-zinc-600" />}
              <div
                onClick={() => selectedRepo && setStep(s.num)}
                className={`flex items-center gap-2 cursor-pointer transition-colors ${
                  step === s.num ? "text-cyan-400 font-semibold" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors ${
                    step === s.num
                      ? "bg-cyan-500 text-zinc-950"
                      : step > s.num
                      ? "bg-emerald-500 text-zinc-950"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {step > s.num ? <Check className="w-3 h-3" /> : s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">

          {/* STEP 1: SELECT REPOSITORY */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500/60 font-mono transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={refetch}
                  disabled={reposLoading}
                  title="Refresh repositories"
                  className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${reposLoading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {reposLoading && <RepoListSkeleton />}

              {reposError && !reposLoading && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-400 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{reposError}</span>
                </div>
              )}

              {!reposLoading && !reposError && (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {filteredRepos.length === 0 && (
                    <p className="text-center text-zinc-500 text-xs py-8 font-mono">
                      No repositories found.
                    </p>
                  )}
                  {filteredRepos.map((repo) => {
                    const isSelected = selectedRepo?.id === repo.id;
                    return (
                      <div
                        key={repo.id}
                        onClick={() => setSelectedRepo(repo)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                          isSelected
                            ? "bg-cyan-500/10 border-cyan-500/50 shadow-md"
                            : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                            {repo.private ? (
                              <Lock className="w-4 h-4 text-amber-400" />
                            ) : (
                              <Globe className="w-4 h-4 text-zinc-400" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-100 flex items-center gap-2 flex-wrap">
                              <span className="truncate">{repo.full_name}</span>
                              {repo.private && (
                                <span className="text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800/40 px-1.5 py-0.5 rounded font-mono shrink-0">
                                  Private
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">
                              <span className="text-cyan-400">{repo.default_branch}</span>
                              {repo.language && <> &bull; {repo.language}</>}
                              {" "}&bull; {formatUpdatedAt(repo.updated_at)}
                            </p>
                          </div>
                        </div>

                        <div className={`w-6 h-6 rounded-full shrink-0 ml-3 flex items-center justify-center font-bold transition-all ${
                          isSelected
                            ? "bg-cyan-500 text-zinc-950"
                            : "bg-zinc-800/0 group-hover:bg-zinc-800 border border-transparent group-hover:border-zinc-700"
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* STEP 2: BUILD CONFIGURATION */}
          {step === 2 && selectedRepo && (
            <div className="space-y-5">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <svg className="w-5 h-5 fill-current text-cyan-400 shrink-0" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs text-zinc-400">Selected Repository</p>
                    <p className="text-sm font-semibold text-zinc-100 truncate">{selectedRepo.full_name}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors shrink-0 ml-3"
                >
                  Change
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 tracking-wider">
                    Framework Preset
                  </label>
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500/60 font-mono cursor-pointer transition-colors"
                  >
                    <option value="React / Vite">React / Vite</option>
                    <option value="Next.js 14 App">Next.js 14 App</option>
                    <option value="Node.js / Express">Node.js / Express</option>
                    <option value="Go / Gin">Go / Gin</option>
                    <option value="Python / FastAPI">Python / FastAPI</option>
                    <option value="Vue / Vite">Vue / Vite</option>
                    <option value="SvelteKit">SvelteKit</option>
                    <option value="Astro">Astro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 tracking-wider">
                    Production Branch
                  </label>
                  <div className="relative">
                    <GitBranch className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500/60 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-zinc-800/60">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 tracking-wider">
                    Build Command
                  </label>
                  <input
                    type="text"
                    value={buildCommand}
                    onChange={(e) => setBuildCommand(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/60 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5 tracking-wider">
                    Output Directory
                  </label>
                  <input
                    type="text"
                    value={outputDirectory}
                    onChange={(e) => setOutputDirectory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500/60 transition-colors"
                  />
                </div>
              </div>

              {/* Subdomain Preview */}
              <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800/60">
                <p className="text-[10px] font-mono uppercase text-zinc-500 mb-1 tracking-wider">
                  Deployment URL (auto-generated)
                </p>
                <p className="text-sm font-mono text-zinc-100">
                  <span className="text-cyan-400">{subdomain}</span>
                  <span className="text-zinc-500">.deploystream.io</span>
                </p>
                <p className="text-[10px] text-zinc-600 mt-1">Customizable later in project settings</p>
              </div>
            </div>
          )}

          {/* STEP 3: ENVIRONMENT VARIABLES */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    <Key className="w-4 h-4 text-cyan-400" />
                    Environment Variables
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">Build-time &amp; runtime secret keys</p>
                </div>
                <button
                  type="button"
                  onClick={addEnvVar}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  Add Variable
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {envVars.length === 0 && (
                  <div className="text-center py-8 text-zinc-600 text-xs font-mono border border-dashed border-zinc-800 rounded-xl">
                    No environment variables. Click "Add Variable" to add one.
                  </div>
                )}
                {envVars.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <input
                      type="text"
                      placeholder="KEY"
                      value={v.key}
                      onChange={(e) => updateEnvVar(v.id, "key", e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/60 transition-colors"
                    />
                    <input
                      type={v.isSecret ? "password" : "text"}
                      placeholder="VALUE"
                      value={v.value}
                      onChange={(e) => updateEnvVar(v.id, "value", e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500/60 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => updateEnvVar(v.id, "isSecret", !v.isSecret)}
                      title={v.isSecret ? "Secret" : "Public"}
                      className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                        v.isSecret
                          ? "bg-amber-950/40 border-amber-800/50 text-amber-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeEnvVar(v.id)}
                      className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between gap-3 shrink-0">
          <div className="flex-1">
            {importError && (
              <div className="flex items-center gap-2 text-xs text-rose-400 font-mono">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
            {importSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Repository imported! Starting deployment…</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (step > 1) setStep((step - 1) as 1 | 2 | 3);
                else onClose();
              }}
              disabled={isImporting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {step === 1 ? "Cancel" : "Back"}
            </button>

            {step < 3 ? (
              <button
                type="button"
                disabled={!selectedRepo}
                onClick={() => setStep((step + 1) as 2 | 3)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-950/40"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleDeploy}
                disabled={isImporting || importSuccess}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-semibold text-xs transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-lg shadow-emerald-950/40"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing…</span>
                  </>
                ) : importSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Imported!</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    <span>Import &amp; Deploy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportRepositoryModal;
