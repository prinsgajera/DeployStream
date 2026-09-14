import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderGit2,
  Rocket,
  Globe,
  Settings,
  BookOpen,
  Terminal,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-zinc-950/95 border-r border-zinc-800/80 z-40 flex flex-col justify-between font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <div className="flex flex-col">
        {/* Logo Section */}
        <div className="h-16 px-4 border-b border-zinc-800/80 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400 group-hover:border-cyan-500/50 transition-colors shadow-inner">
              <Terminal className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-zinc-100 group-hover:text-cyan-400 transition-colors">
                DeployStream
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                v2.4 Core
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-4">
          <div>
            <span className="px-3 py-1 block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Platform
            </span>
            <nav className="flex flex-col gap-1">
              <Link
                to="/dashboard"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive("/dashboard")
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold shadow-sm"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/repositories"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive("/repositories")
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold shadow-sm"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
              >
                <FolderGit2 className="w-4 h-4" />
                <span>Repositories</span>
              </Link>

              <Link
                to="/deployments"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive("/deployments")
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold shadow-sm"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
              >
                <Rocket className="w-4 h-4" />
                <span>Deployments</span>
              </Link>
            </nav>
          </div>

          <div className="pt-2 border-t border-zinc-800/60">
            <span className="px-3 py-1 block text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              Configuration
            </span>
            <nav className="flex flex-col gap-1">
              <Link
                to="/domains"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive("/domains")
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold shadow-sm"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
              >
                <Globe className="w-4 h-4" />
                <span>Domains</span>
              </Link>
              <Link
                to="/settings"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all ${isActive("/settings")
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold shadow-sm"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>

              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Docs</span>
              </a>
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
};
