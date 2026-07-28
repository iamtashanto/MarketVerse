import { useConnectionStore } from "@/state/connection.store";

export function ConnectionStatusBanner() {
  const isOnline = useConnectionStore((s) => s.isOnline);
  if (isOnline) return null;

  return (
    <div role="status" className="bg-danger px-4 py-2 text-center text-sm text-white">
      You&rsquo;re offline — some actions won&rsquo;t work until your connection is back.
    </div>
  );
}
