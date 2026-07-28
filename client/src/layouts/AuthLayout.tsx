import { Outlet } from "react-router";

/** No HUD, no canvas — just a centered card. Used for /login, /register. */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-canvas px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8">
        <Outlet />
      </div>
    </div>
  );
}
