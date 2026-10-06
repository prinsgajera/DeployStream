import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User, AuthContextType } from "../types/auth";
import { apiClient, API_BASE_URL } from "../lib/apiClient";
import { tokenStorage } from "../lib/tokenStorage";
import axios from "axios";

export const GITHUB_LOGIN_URL = `${API_BASE_URL}/auth/github`;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await apiClient.get<User>("/auth/me");
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
    window.location.href = GITHUB_LOGIN_URL;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiClient.post("/auth/logout");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logout failed");
    } finally {
      tokenStorage.clear();
      setUser(null);
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
