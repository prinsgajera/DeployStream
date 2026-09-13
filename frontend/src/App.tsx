import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { Terminal, LogOut, CheckCircle2, User } from "lucide-react";

const DashboardPlaceholder: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col justify-between selection:bg-zinc-800 font-sans">
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg text-zinc-100">DeployStream Workspace</span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-300">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.username} className="w-7 h-7 rounded-full border border-zinc-700" />
              ) : (
                <User className="w-5 h-5 text-zinc-400" />
              )}
              <span className="font-medium">@{user.username}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-lg w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-100">Workspace Dashboard Placeholder</h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Authentication lifecycle complete. User profile provisioned in MongoDB via Fastify & Prisma ORM.
          </p>
          {user && (
            <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 text-left font-mono text-xs text-zinc-300 space-y-1">
              <div><span className="text-zinc-500">ID:</span> {user.id}</div>
              <div><span className="text-zinc-500">GitHub ID:</span> {user.githubId}</div>
              <div><span className="text-zinc-500">Username:</span> {user.username}</div>
              <div><span className="text-zinc-500">Email:</span> {user.email ?? "N/A (Private)"}</div>
              <div><span className="text-zinc-500">Name:</span> {user.firstName ?? ""} {user.lastName ?? ""}</div>
            </div>
          )}
        </div>
      </main>

      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs font-mono text-zinc-600 border-t border-zinc-900">
        DeployStream Platform
      </footer>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/dashboard" element={<DashboardPlaceholder />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
