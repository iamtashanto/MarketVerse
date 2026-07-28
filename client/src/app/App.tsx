import { RouterProvider } from "react-router";
import { AppProviders } from "@/app/providers/AppProviders";
import { router } from "@/app/router";
import { useSession } from "@/features/auth/hooks/useSession";

/** Resolves session status once, high in the tree, before any route guard reads it. */
function SessionBootstrap({ children }: { children: React.ReactNode }) {
  useSession();
  return children;
}

export function App() {
  return (
    <AppProviders>
      <SessionBootstrap>
        <RouterProvider router={router} />
      </SessionBootstrap>
    </AppProviders>
  );
}
