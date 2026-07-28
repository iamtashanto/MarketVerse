import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { useAuthStore } from "@/features/auth/state/auth.store";
import { ApiError } from "@/services/apiClient";

export const authKeys = {
  session: () => ["auth", "session"] as const,
};

/**
 * TanStack Query owns the actual fetch/cache; this hook additionally syncs
 * the result into the synchronous auth.store snapshot that route guards read.
 * Mount once, high in the tree (see app/App.tsx). See docs/FRONTEND_ARCHITECTURE.md §11.
 */
export function useSession() {
  const setAuthenticated = useAuthStore((s) => s.setAuthenticated);
  const setAnonymous = useAuthStore((s) => s.setAnonymous);

  const query = useQuery({
    queryKey: authKeys.session(),
    queryFn: authApi.me,
    staleTime: 5 * 60_000,
    retry: false,
  });

  useEffect(() => {
    if (query.isSuccess) setAuthenticated(query.data);
    if (query.isError && query.error instanceof ApiError && query.error.status === 401) setAnonymous();
  }, [query.isSuccess, query.isError, query.data, query.error, setAuthenticated, setAnonymous]);

  return query;
}
