import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, AuthContextType } from "../types/auth";
import { apiClient } from "../lib/apiClient";
import axios from "axios";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<User>("/api/auth/me");
      setUser(data);
    } catch (err) {
      setUser(null);
      if (!axios.isAxiosError(err) || err.response?.status !== 401) {
        setError(err instanceof Error ? err.message : "Failed to authenticate");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const loginWithGitHub = useCallback((): void => {
    const authServerUrl = import.meta.env.VITE_SERVER_URL;
    window.location.href = `${authServerUrl}/auth/github`;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiClient.post("/api/auth/logout");
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
