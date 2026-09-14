import React, { useState } from "react";
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
} from "lucide-react";
import type { GitHubRepoOption, EnvironmentVariable } from "../../types/dashboard";

interface ImportRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (repoData: {
    repoName: string;
    fullName: string;
    branch: string;
    framework: string;
    buildCommand: string;
    outputDirectory: string;
    envVars: EnvironmentVariable[];
  }) => void;
}

const MOCK_GITHUB_REPOS: GitHubRepoOption[] = [
  {
    id: "gh-1",
    name: "e-commerce-storefront",
    fullName: "alex-dev/e-commerce-storefront",
    private: false,
    defaultBranch: "main",
    updatedAt: "2 hours ago",
    language: "TypeScript",
  },
  {
    id: "gh-2",
    name: "auth-gateway-api",
    fullName: "alex-dev/auth-gateway-api",
    private: true,
    defaultBranch: "main",
    updatedAt: "5 hours ago",
    language: "Go",
  },
  {
    id: "gh-3",
    name: "dashboard-analytics-ui",
    fullName: "alex-dev/dashboard-analytics-ui",
    private: false,
    defaultBranch: "main",
    updatedAt: "1 day ago",
    language: "React",
  },
  {
    id: "gh-4",
    name: "payment-processing-service",
    fullName: "alex-dev/payment-processing-service",
    private: true,
    defaultBranch: "production",
    updatedAt: "3 days ago",
    language: "Python",
  },
];

export const ImportRepositoryModal: React.FC<ImportRepositoryModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepoOption | null>(MOCK_GITHUB_REPOS[0] || null);

  // Step 2 Form State
  const [framework, setFramework] = useState("React / Vite");
  const [branch, setBranch] = useState("main");
  const [buildCommand, setBuildCommand] = useState("npm run build");
  const [outputDirectory, setOutputDirectory] = useState("dist");

  // Step 3 Env Vars State
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([
    { id: "1", key: "VITE_API_URL", value: "https://api.deploystream.io", isSecret: false },
    { id: "2", key: "DATABASE_URL", value: "mongodb+srv://user:pass@cluster.mongodb.net", isSecret: true },
  ]);

  if (!isOpen) return null;

  const addEnvVar = () => {
    setEnvVars([
      ...envVars,
      { id: Date.now().toString(), key: "", value: "", isSecret: false },
    ]);
  };

  const removeEnvVar = (id: string) => {
    setEnvVars(envVars.filter((v) => v.id !== id));
  };

  const updateEnvVar = (id: string, field: keyof EnvironmentVariable, val: any) => {
    setEnvVars(
      envVars.map((v) => (v.id === id ? { ...v, [field]: val } : v))
    );
  };

  const handleDeploy = () => {
    if (!selectedRepo) return;
    onImportComplete({
      repoName: selectedRepo.name,
      fullName: selectedRepo.fullName,
      branch: branch || selectedRepo.defaultBranch,
      framework,
      buildCommand,
      outputDirectory,
      envVars,
    });
    onClose();
  };

  const filteredRepos = MOCK_GITHUB_REPOS.filter((repo) =>
    repo.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans selection:bg-zinc-800">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
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

        {/* Wizard Steps Progress Bar */}
        <div className="px-6 py-3 border-b border-zinc-800/60 bg-zinc-950/30 flex items-center justify-between text-xs font-mono">
          <div
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 cursor-pointer ${
              step === 1 ? "text-cyan-400 font-semibold" : "text-zinc-400"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 1 ? "bg-cyan-500 text-zinc-950 font-bold" : "bg-zinc-800 text-zinc-400"}`}>1</span>
            <span>Select Repository</span>
          </div>

          <ChevronRight className="w-4 h-4 text-zinc-600" />

          <div
            onClick={() => selectedRepo && setStep(2)}
            className={`flex items-center gap-2 cursor-pointer ${
              step === 2 ? "text-cyan-400 font-semibold" : "text-zinc-400"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 2 ? "bg-cyan-500 text-zinc-950 font-bold" : "bg-zinc-800 text-zinc-400"}`}>2</span>
            <span>Build Configuration</span>
          </div>

          <ChevronRight className="w-4 h-4 text-zinc-600" />

          <div
            onClick={() => selectedRepo && setStep(3)}
            className={`flex items-center gap-2 cursor-pointer ${
              step === 3 ? "text-cyan-400 font-semibold" : "text-zinc-400"
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === 3 ? "bg-cyan-500 text-zinc-950 font-bold" : "bg-zinc-800 text-zinc-400"}`}>3</span>
            <span>Environment Variables</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: SELECT REPOSITORY */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search GitHub repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {filteredRepos.map((repo) => {
                  const isSelected = selectedRepo?.id === repo.id;
                  return (
                    <div
                      key={repo.id}
                      onClick={() => setSelectedRepo(repo)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/50 shadow-md"
                          : "bg-zinc-950/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-950"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                          {repo.private ? <Lock className="w-4 h-4 text-amber-400" /> : <Globe className="w-4 h-4 text-zinc-400" />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                            {repo.fullName}
                            {repo.private && (
                              <span className="text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800/40 px-1.5 py-0.5 rounded font-mono">
                                Private
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-zinc-400 font-mono mt-0.5">
                            Branch: <span className="text-cyan-400">{repo.defaultBranch}</span> &bull; {repo.language} &bull; Updated {repo.updatedAt}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-cyan-500 text-zinc-950 flex items-center justify-center font-bold">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: BUILD CONFIGURATION */}
          {step === 2 && selectedRepo && (
            <div className="space-y-5">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 fill-current text-cyan-400" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <div>
                    <p className="text-xs text-zinc-400">Selected Repository</p>
                    <p className="text-sm font-semibold text-zinc-100">{selectedRepo.fullName}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-cyan-400 hover:underline font-mono"
                >
                  Change
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Framework Preset
                  </label>
                  <select
                    value={framework}
                    onChange={(e) => setFramework(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500 font-mono cursor-pointer"
                  >
                    <option value="React / Vite">React / Vite</option>
                    <option value="Next.js 14">Next.js 14 App</option>
                    <option value="Node.js Express">Node.js / Express</option>
                    <option value="Go Gin">Go / Gin</option>
                    <option value="Python FastAPI">Python / FastAPI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
                    Production Branch
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                    />
                    <GitBranch className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-zinc-800/60">
                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Build Command
                  </label>
                  <input
                    type="text"
                    value={buildCommand}
                    onChange={(e) => setBuildCommand(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Output Directory
                  </label>
                  <input
                    type="text"
                    value={outputDirectory}
                    onChange={(e) => setOutputDirectory(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
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
                  <p className="text-xs text-zinc-400">Build-time & runtime secret keys</p>
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
                {envVars.map((v) => (
                  <div key={v.id} className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <input
                      type="text"
                      placeholder="KEY (e.g. API_KEY)"
                      value={v.key}
                      onChange={(e) => updateEnvVar(v.id, "key", e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-400 focus:outline-none focus:border-cyan-500"
                    />
                    <input
                      type={v.isSecret ? "password" : "text"}
                      placeholder="VALUE"
                      value={v.value}
                      onChange={(e) => updateEnvVar(v.id, "value", e.target.value)}
                      className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => updateEnvVar(v.id, "isSecret", !v.isSecret)}
                      className={`p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                        v.isSecret
                          ? "bg-amber-950/40 border-amber-800/50 text-amber-400"
                          : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
                      }`}
                      title={v.isSecret ? "Secret Variable" : "Public Variable"}
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

        {/* Footer Navigation Actions */}
        <div className="px-6 py-4 border-t border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step > 1) setStep((step - 1) as any);
              else onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>

          {step < 3 ? (
            <button
              type="button"
              disabled={!selectedRepo}
              onClick={() => setStep((step + 1) as any)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-950/40"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDeploy}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-zinc-950 font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-emerald-950/40"
            >
              <Rocket className="w-4 h-4" />
              <span>Import & Deploy Project</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
