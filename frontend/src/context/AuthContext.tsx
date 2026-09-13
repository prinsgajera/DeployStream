import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, AuthContextType } from "../types/auth";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
// Remove trailing /api if present to get server root when constructing full paths
const SERVER_ROOT = API_BASE.replace(/\/api\/?$/, "");

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${SERVER_ROOT}/api/auth/me`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const userData = (await response.json()) as User;
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : "Failed to authenticate");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginWithGitHub = useCallback((): void => {
    window.location.href = `${SERVER_ROOT}/auth/github`;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await fetch(`${SERVER_ROOT}/api/auth/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    loginWithGitHub,
    logout,
    checkAuth,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
