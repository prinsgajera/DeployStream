import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../lib/apiClient";
import type { BuildStatusType } from "../types/dashboard";

export type StreamConnection = "connecting" | "open" | "closed";

interface LogFrame {
  type: "log" | "status" | "error" | "done";
  message?: string;
  status?: BuildStatusType;
}

interface UseBuildLogStreamResult {
  lines: string[];
  status: BuildStatusType | null;
  connection: StreamConnection;
  error: string | null;
  clear: () => void;
}

const HTTP_PROTOCOL = /^http/;

function isLogFrame(value: unknown): value is LogFrame {
  return typeof value === "object" && value !== null && "type" in value;
}

export function useBuildLogStream(buildId: string): UseBuildLogStreamResult {
  const [lines, setLines] = useState<string[]>([]);
  const [status, setStatus] = useState<BuildStatusType | null>(null);
  const [connection, setConnection] = useState<StreamConnection>("connecting");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;
    let socket: WebSocket | null = null;

    const connect = (): void => {
      const active = new WebSocket(
        `${API_BASE_URL.replace(HTTP_PROTOCOL, "ws")}/builds/${buildId}/stream`
      );
      socket = active;

      active.onopen = () => isActive && setConnection("open");
      active.onclose = () => isActive && setConnection("closed");
      active.onerror = () => isActive && setError("Log stream connection failed");
      active.onmessage = (event: MessageEvent<string>) => {
        if (!isActive) return;
        const frame: unknown = JSON.parse(event.data);
        if (!isLogFrame(frame)) return;

        if (frame.type === "log" && frame.message !== undefined) {
          const message = frame.message;
          setLines((prev) => [...prev, message]);
        } else if (frame.type === "status" || frame.type === "done") {
          setStatus(frame.status ?? null);
        } else if (frame.type === "error") {
          setError(frame.message ?? "Log stream error");
        }
      };
    };

    const connectTimer = setTimeout(connect, 0);

    return () => {
      isActive = false;
      clearTimeout(connectTimer);
      socket?.close();
    };
  }, [buildId]);

  const clear = useCallback(() => setLines([]), []);

  return { lines, status, connection, error, clear };
}
