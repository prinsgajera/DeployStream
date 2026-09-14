import React, { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { useAuth } from "../hooks/useAuth";
import {
  User as UserIcon,
  Key,
  ShieldCheck,
  Save,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Mail,
  Smartphone,
} from "lucide-react";

interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsed: string;
}

export const ProfileSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "github" | "tokens" | "security">("profile");

  // Profile Form State
  const [firstName, setFirstName] = useState(user?.firstName || "Alex");
  const [lastName, setLastName] = useState(user?.lastName || "Developer");
  const [email, setEmail] = useState(user?.email || "alex@deploystream.io");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: "key-1",
      name: "CLI Deployment Token",
      prefix: "ds_live_9f81...",
      createdAt: "Sep 01, 2026",
      lastUsed: "10 mins ago",
    },
    {
      id: "key-2",
      name: "GitHub Actions Pipeline Key",
      prefix: "ds_live_3a12...",
      createdAt: "Aug 15, 2026",
      lastUsed: "2 days ago",
    },
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCreateApiKey = () => {
    if (!newKeyName.trim()) return;
    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      prefix: `ds_live_${Math.random().toString(36).substring(2, 6)}...`,
      createdAt: "Just now",
      lastUsed: "Never",
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
  };

  const handleRevokeKey = (id: string) => {
    setApiKeys(apiKeys.filter((k) => k.id !== id));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800">
      <Sidebar />
      <Header />

      <main className="pl-64 pt-16 min-h-screen w-full bg-zinc-950 px-8 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Header Title */}
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Account & Developer Settings</h1>
            <p className="text-xs text-zinc-400 mt-1">Manage your profile, GitHub OAuth tokens, API access keys, and security preferences</p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "bg-zinc-800 text-cyan-400 border border-cyan-500/20 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
              }`}
            >
              <UserIcon className="w-4 h-4" />
              <span>Profile Details</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("github")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "github"
                  ? "bg-zinc-800 text-cyan-400 border border-cyan-500/20 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
              }`}
            >
              <svg className="w-4 h-4 fill-current text-zinc-400" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>GitHub Integration</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("tokens")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "tokens"
                  ? "bg-zinc-800 text-cyan-400 border border-cyan-500/20 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
              }`}
            >
              <Key className="w-4 h-4" />
              <span>API Access Keys</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === "security"
                  ? "bg-zinc-800 text-cyan-400 border border-cyan-500/20 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Security & Sessions</span>
            </button>
          </div>

          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === "profile" && (
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.username}
                    className="w-16 h-16 rounded-full border-2 border-cyan-500/50 object-cover shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500/50 text-cyan-400 flex items-center justify-center font-bold text-xl">
                    <UserIcon className="w-8 h-8" />
                  </div>
                )}
                <div>
                  <h3 className="text-base font-bold text-zinc-100">@{user?.username || "alex-dev"}</h3>
                  <p className="text-xs font-mono text-zinc-400 mt-0.5">MongoDB Account ID: {user?.id || "65f9a2b1c4e..."}</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-zinc-800/60">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-sans text-zinc-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2 text-xs font-sans text-zinc-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-cyan-500"
                    />
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  {savedSuccess && (
                    <span className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Profile updated successfully!
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-all active:scale-[0.98] cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: GITHUB INTEGRATION */}
          {activeTab === "github" && (
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 flex items-center justify-center">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-zinc-100">GitHub OAuth Integration</h3>
                    <p className="text-xs text-zinc-400">Encrypted token stored at rest with AES-256-GCM cipher</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-xs font-mono font-semibold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Connected
                </span>
              </div>

              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 font-mono text-xs text-zinc-300">
                <div className="flex justify-between">
                  <span className="text-zinc-500">GitHub Username:</span>
                  <span className="text-cyan-400 font-semibold">@{user?.username || "alex-dev"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">GitHub User ID:</span>
                  <span>{user?.githubId || "12984019"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">OAuth Scopes Authorized:</span>
                  <span className="text-emerald-400">read:user, user:email, repo, admin:repo_hook</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <a
                  href="http://localhost:3001/auth/github"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-100 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-authenticate GitHub Account</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: API ACCESS KEYS */}
          {activeTab === "tokens" && (
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Personal Access Tokens & API Keys</h3>
                <p className="text-xs text-zinc-400">Use API keys to authenticate CLI deployments & external Webhooks</p>
              </div>

              {/* Create Key Box */}
              <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                <input
                  type="text"
                  placeholder="Key description (e.g. Production CI Runner)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs font-mono text-zinc-100 focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={handleCreateApiKey}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-semibold text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate Key</span>
                </button>
              </div>

              {/* Keys List */}
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between bg-zinc-950 p-4 rounded-xl border border-zinc-800 text-xs"
                  >
                    <div className="space-y-1">
                      <p className="font-semibold text-zinc-100">{key.name}</p>
                      <p className="font-mono text-zinc-400 text-[11px]">
                        Prefix: <span className="text-cyan-400 font-semibold">{key.prefix}</span> &bull; Created {key.createdAt} &bull; Last used {key.lastUsed}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(key.id, key.prefix)}
                        className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
                        title="Copy Key Prefix"
                      >
                        {copiedId === key.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRevokeKey(key.id)}
                        className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Revoke Token"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & SESSIONS */}
          {activeTab === "security" && (
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-2xl p-6 shadow-sm space-y-6">
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Active Sessions & Security Overview</h3>
                <p className="text-xs text-zinc-400">Review devices & IP addresses authorized to access your DeployStream workspace</p>
              </div>

              <div className="space-y-3">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-cyan-400" />
                    <div>
                      <p className="font-semibold text-zinc-100">Chrome on Windows (Current Session)</p>
                      <p className="font-mono text-zinc-400 text-[11px]">IP: 127.0.0.1 &bull; Fastify auth_token Cookie &bull; Last active 1 min ago</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 font-mono text-[10px]">
                    Active Now
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default ProfileSettingsPage;
