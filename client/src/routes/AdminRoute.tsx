import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/features/auth/state/auth.store";

/**
 * Layered on top of ProtectedRoute (never a substitute for it) — a
 * separate, additional check, mirroring the backend's two-tier
 * authorization exactly. See docs/BACKEND_ARCHITECTURE.md §10.
 */
export function AdminRoute() {
  const isAdmin = useAuthStore((s) => s.user?.role === "ADMIN");
  if (!isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}
