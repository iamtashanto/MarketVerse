import { create } from "zustand";
import type { AuthUser } from "@/features/auth/types";

export type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  setAuthenticated: (user: AuthUser) => void;
  setAnonymous: () => void;
}

/**
 * A synchronous snapshot of session state, kept in sync by useSession()
 * (features/auth/hooks/useSession.ts, backed by TanStack Query). Route
 * guards (routes/ProtectedRoute.tsx) read this directly rather than each
 * re-deriving loading/error state from the query themselves.
 * See docs/FRONTEND_ARCHITECTURE.md §8, §11.
 */
export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  setAuthenticated: (user) => set({ status: "authenticated", user }),
  setAnonymous: () => set({ status: "anonymous", user: null }),
}));
