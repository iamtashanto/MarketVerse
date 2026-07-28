import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { ErrorBoundary } from "@/components/feedback/ErrorBoundary";
import { ConnectionStatusBanner } from "@/components/feedback/ConnectionStatusBanner";
import { ToastRegion } from "@/components/ui/Toast";
import ErrorPage from "@/pages/errors/ErrorPage";

/**
 * Wraps every route. Owns the skip link, the shared toast/aria-live region,
 * and route-change focus management — React Router doesn't reset focus on
 * navigation by default, which silently breaks screen-reader users' sense
 * of location. See docs/FRONTEND_ARCHITECTURE.md §4, §16.
 */
export function RootLayout() {
  const location = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    mainRef.current?.focus();
  }, [location.pathname]);

  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <ConnectionStatusBanner />
      <main id="main-content" ref={mainRef} tabIndex={-1} className="outline-none">
        <Outlet />
      </main>
      <ToastRegion />
    </ErrorBoundary>
  );
}
