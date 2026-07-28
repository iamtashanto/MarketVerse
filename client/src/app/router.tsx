import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { RootLayout } from "@/layouts/RootLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { GameLayout } from "@/layouts/GameLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { AdminRoute } from "@/routes/AdminRoute";
import { FullPageSpinner } from "@/components/feedback/Spinner";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import NotFoundPage from "@/pages/errors/NotFoundPage";
import ErrorPage from "@/pages/errors/ErrorPage";

// Route-level code splitting: every route past the auth flow is a separate
// chunk, so first paint ships only the login/register bundle.
// See docs/FRONTEND_ARCHITECTURE.md §12.
const StoreDashboardPage = lazy(() => import("@/pages/store/StoreDashboardPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/AdminUsersPage"));

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<FullPageSpinner />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/login", element: <LoginPage /> },
          { path: "/register", element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <GameLayout />,
            children: [{ path: "/stores/:storeId", element: withSuspense(<StoreDashboardPage />) }],
          },
          {
            element: <AdminRoute />,
            children: [
              {
                element: <AdminLayout />,
                children: [{ path: "/admin/users", element: withSuspense(<AdminUsersPage />) }],
              },
            ],
          },
        ],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
