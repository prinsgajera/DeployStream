import axios from "axios";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3001";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

const isPublicPage = () => PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));

export const apiClient = axios.create({
  baseURL: SERVER_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = error.config?.url ?? "";
      const isSessionCheck = requestUrl.includes("/auth/me");

      if (!isSessionCheck && !isPublicPage()) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
