import { QueryClient } from "@tanstack/react-query";
import { ApiError } from "@/services/apiClient";

/**
 * Cache tuning deliberately mirrors the backend's own cache TTLs
 * (server/src/cache) so the client doesn't refetch more eagerly than the
 * server-side cache would even reflect a change. Per-query overrides live
 * alongside each feature's hooks. See docs/FRONTEND_ARCHITECTURE.md §13.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
