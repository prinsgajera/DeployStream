import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw, Terminal, User as UserIcon } from "lucide-react";
import type { User } from "../types/auth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const SERVER_ROOT = API_BASE.replace(/\/api\/?$/, "");

type CallbackStatus = "processing" | "success" | "error";

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, checkAuth } = useAuth();

  const [status, setStatus] = useState<CallbackStatus>("processing");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(null);

  const processedRef = useRef<boolean>(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const code = searchParams.get("code");
    const errorParam = searchParams.get("error");
    const successParam = searchParams.get("success");

    if (errorParam) {
      setStatus("error");
      setErrorMessage(
        errorParam === "oauth_failed"
          ? "GitHub authentication was canceled or failed. Please try again."
          : `Authentication error: ${errorParam}`
      );
      return;
    }

    if (successParam === "true") {
      // Backend redirected here after setting cookie
      checkAuth()
        .then(() => {
          setStatus("success");
        })
        .catch(() => {
          setStatus("error");
          setErrorMessage("Failed to verify authentication session.");
        });
      return;
    }

    if (code) {
      // SPA Code exchange: call Fastify backend endpoint /api/auth/callback
      const exchangeCode = async () => {
        try {
          const response = await fetch(`${SERVER_ROOT}/api/auth/callback?code=${encodeURIComponent(code)}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            credentials: "include",
          });

          const data = (await response.json()) as { success?: boolean; user?: User; message?: string; error?: string };

          if (response.ok && data.user) {
            setUser(data.user);
            setAuthenticatedUser(data.user);
            setStatus("success");
          } else {
            setStatus("error");
            setErrorMessage(data.message || data.error || "Failed to complete authentication exchange.");
          }
        } catch (err) {
          setStatus("error");
          setErrorMessage(err instanceof Error ? err.message : "Network error during authentication.");
        }
      };

      exchangeCode();
    } else {
      // Fallback: test if user is already authenticated
      checkAuth()
        .then(() => {
          setStatus("success");
        })
        .catch(() => {
          setStatus("error");
          setErrorMessage("No authorization code found in redirect parameters.");
        });
    }
  }, [searchParams, setUser, checkAuth]);

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-50 flex flex-col justify-between selection:bg-zinc-800 font-sans relative overflow-hidden">
      {/* Background Micro Grids */}
      <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-zinc-900/80">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-zinc-100">
            DeployStream
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-8 shadow-2xl shadow-black/80 text-center space-y-6">
            
            {/* Status Indicator Icon */}
            {status === "processing" && (
              <div className="space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 text-emerald-400">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">Authenticating...</h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Exchanging GitHub code and finalizing user provisioning.
                  </p>
                </div>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-5">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">Authentication Successful!</h2>
                  <p className="text-sm text-emerald-400/90 font-medium mt-1">
                    Your GitHub profile has been securely provisioned.
                  </p>
                </div>

                {authenticatedUser && (
                  <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-4 flex items-center gap-3 text-left">
                    {authenticatedUser.avatarUrl ? (
                      <img
                        src={authenticatedUser.avatarUrl}
                        alt={authenticatedUser.username}
                        className="w-10 h-10 rounded-full border border-zinc-700"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <UserIcon className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-zinc-100 truncate">
                        {authenticatedUser.firstName || authenticatedUser.username}
                      </p>
                      <p className="text-xs font-mono text-zinc-400 truncate">
                        @{authenticatedUser.username} {authenticatedUser.email ? `• ${authenticatedUser.email}` : ""}
                      </p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold py-3 px-4 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <span>Continue to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-5">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-400">
                  <XCircle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-zinc-100">Authentication Failed</h2>
                  <p className="text-sm text-rose-400/90 font-mono bg-rose-950/40 border border-rose-900/40 rounded-lg p-2.5 mt-3 text-left break-words">
                    {errorMessage || "An unknown error occurred during sign in."}
                  </p>
                </div>

                <Link
                  to="/login"
                  className="w-full flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 font-semibold py-3 px-4 rounded-xl transition-all duration-200 active:scale-[0.98] cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs font-mono text-zinc-600 border-t border-zinc-900/60">
        DeployStream OAuth Verification Module
      </footer>
    </div>
  );
};
