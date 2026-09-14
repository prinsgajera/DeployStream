import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link } from "react-router-dom";
import {
  Search,
  Bell,
  User as UserIcon,
  LogOut,
  Settings,
  ExternalLink,
  ChevronDown,
} from "lucide-react";

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 z-30 px-6 flex items-center justify-between font-sans selection:bg-zinc-800 selection:text-zinc-100">
      {/* Search Input Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search deployments, commit SHA, clusters... (⌘K)"
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg pl-9 pr-10 py-1.5 text-xs font-mono text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
          />
          <div className="absolute right-2.5 top-2 bg-zinc-950 px-1.5 py-0.5 rounded border border-zinc-800 text-[10px] font-mono text-zinc-400 pointer-events-none">
            /
          </div>
        </div>
      </div>

      {/* Header Right Actions */}
      <div className="flex items-center gap-5">
        {/* System Health Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
          <span className="text-xs font-mono text-zinc-300 font-medium">
            All Systems Normal
          </span>
        </div>

        <div className="h-4 w-px bg-zinc-800 hidden sm:block" />

        {/* Notifications Icon Button */}
        <button
          type="button"
          className="relative text-zinc-400 hover:text-zinc-100 transition-colors p-1.5 rounded-lg hover:bg-zinc-900 cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
        </button>

        {/* User Profile Dropdown Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-1 p-1 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            {user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-8 h-8 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-semibold text-xs">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
            <span className="text-xs font-medium text-zinc-200 hidden md:inline-block">
              @{user?.username || "developer"}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Dropdown Menu Popup */}
          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 text-xs font-sans"
              onClick={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2.5 border-b border-zinc-800/80">
                <p className="font-semibold text-zinc-100 truncate">
                  {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username}
                </p>
                <p className="text-[11px] font-mono text-zinc-400 truncate mt-0.5">
                  {user?.email || `@${user?.username}`}
                </p>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  className="flex items-center gap-2.5 px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Profile Settings</span>
                </Link>

                <a
                  href={`https://github.com/${user?.username || ""}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 px-4 py-2 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                  <span>GitHub Profile</span>
                </a>
              </div>

              <div className="pt-1 border-t border-zinc-800/80">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
