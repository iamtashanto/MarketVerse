import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/features/auth/state/auth.store";
import { FullPageSpinner } from "@/components/feedback/Spinner";

/**
 * Coarse "authenticated at all" guard. Reads the synchronous auth.store
 * snapshot (kept in sync by useSession(), mounted once in app/App.tsx)
 * rather than each guard re-deriving TanStack Query's loading state.
 * See docs/FRONTEND_ARCHITECTURE.md §11.
 */
export function ProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === "loading") return <FullPageSpinner />;
  if (status === "anonymous") return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
}
