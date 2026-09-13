import React from "react";
import { useAuth } from "../hooks/useAuth";
import { Terminal, ShieldCheck, Zap, ArrowRight, GitBranch } from "lucide-react";

export const LoginPage: React.FC = () => {
  const { loginWithGitHub, isLoading } = useAuth();

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-50 flex flex-col justify-between selection:bg-zinc-800 selection:text-zinc-100 font-sans relative overflow-hidden">
      {/* Background Decorative Tech Grids & Subtle Micro-glows */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shadow-inner">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
            DeployStream
          </span>
          <span className="ml-2 px-2 py-0.5 text-xs font-mono font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 rounded-full flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            v1.0.0
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-6 text-sm text-zinc-400 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-zinc-500" /> AES-256 Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-zinc-500" /> Fastify Runtime
          </span>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-md mx-auto">
          {/* Card Container */}
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl shadow-black/80 relative group">
            {/* Top Border Accent Line */}
            <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

            <div className="text-center space-y-3 mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 mb-2 shadow-sm">
                <GitBranch className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                Welcome to DeployStream
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Connect your GitHub profile to launch type-safe continuous integration & automated deployments.
              </p>
            </div>

            {/* High-Affordance Authentication Button */}
            <button
              type="button"
              id="github-signin-btn"
              onClick={loginWithGitHub}
              disabled={isLoading}
              className="w-full relative group/btn flex items-center justify-center gap-3 bg-zinc-50 text-zinc-950 font-semibold py-3.5 px-5 rounded-xl transition-all duration-200 hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-zinc-950/50 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current transition-transform duration-200 group-hover/btn:scale-110" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>Sign in with GitHub</span>
              <ArrowRight className="w-4 h-4 text-zinc-500 ml-auto transition-transform duration-200 group-hover/btn:translate-x-1 group-hover/btn:text-zinc-950" />
            </button>

            {/* Terminal Preview Code Snippet */}
            <div className="mt-8 pt-6 border-t border-zinc-800/60">
              <div className="bg-zinc-950 rounded-lg p-3 font-mono text-xs text-zinc-400 border border-zinc-800/80 flex items-center justify-between">
                <span className="text-zinc-500">$ git push origin main</span>
                <span className="text-emerald-400 text-[10px] uppercase font-semibold tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                  Ready
                </span>
              </div>
            </div>
          </div>

          {/* Footer Subtext */}
          <p className="text-center text-xs text-zinc-500 mt-6 leading-relaxed">
            By authenticating, you agree to DeployStream&apos;s developer usage policies and OAuth session handling guidelines.
          </p>
        </div>
      </main>
    </div>
  );
};
