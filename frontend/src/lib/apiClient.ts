import axios from "axios";
import { tokenStorage } from "./tokenStorage";

export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:3001/api";

const PUBLIC_PATHS = ["/login", "/auth/callback"];
const SESSION_CHECK_PATH = "/auth/me";

const isPublicPage = (): boolean =>
  PUBLIC_PATHS.some((path) => window.location.pathname.startsWith(path));

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  console.log(token)
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      tokenStorage.clear();
      const isSessionCheck = (error.config?.url ?? "").includes(SESSION_CHECK_PATH);

      if (!isSessionCheck && !isPublicPage()) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
