import type { ApiEnvelope } from "@/types/api";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api/v1";

/**
 * Stable, machine-readable error — safe to branch on `code`, never on
 * `message`. Mirrors docs/API_REFERENCE.md §0.4.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
    public readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let refreshPromise: Promise<void> | null = null;

/**
 * Single-flight refresh: if N requests 401 concurrently, exactly one
 * `/auth/refresh` call is made — the rest await it instead of each
 * triggering their own. See docs/FRONTEND_ARCHITECTURE.md §10.
 */
async function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then((res) => {
        if (!res.ok) throw new ApiError(res.status, "UNAUTHORIZED", "Session refresh failed");
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

interface RequestOptions extends RequestInit {
  /** Skip the automatic 401 -> refresh -> retry dance (used by auth endpoints themselves). */
  skipAuthRetry?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuthRetry, ...init } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });

  const body = (await res.json()) as ApiEnvelope<T>;

  if (!body.success) {
    if (res.status === 401 && !skipAuthRetry) {
      await refreshSession();
      return apiRequest<T>(path, { ...options, skipAuthRetry: true });
    }
    throw new ApiError(res.status, body.error.code, body.error.message, body.error.details, body.error.requestId);
  }

  return body.data;
}

export function toQueryString(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
