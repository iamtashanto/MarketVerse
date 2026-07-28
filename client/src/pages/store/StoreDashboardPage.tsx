import { useParams } from "react-router";
import { useStore } from "@/features/stores/hooks/useStore";
import { Spinner } from "@/components/feedback/Spinner";
import { EmptyState } from "@/components/feedback/EmptyState";

/**
 * A page composes feature components and stays otherwise boring — see
 * docs/FRONTEND_ARCHITECTURE.md §3. Rendered inside GameLayout's
 * pointer-events-none overlay (§4), so interactive panels here opt back
 * into pointer-events individually.
 */
export default function StoreDashboardPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { data: store, isLoading, isError } = useStore(storeId!);

  if (isLoading) return <Spinner />;
  if (isError || !store) return <EmptyState title="Store not found" />;

  return (
    <div className="pointer-events-auto absolute left-4 top-16 rounded-lg border border-border bg-surface/90 p-4 backdrop-blur">
      <h1 className="text-lg font-semibold">{store.name}</h1>
      <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <dt className="text-text-muted">Level</dt>
        <dd>{store.level}</dd>
        <dt className="text-text-muted">Reputation</dt>
        <dd>{store.reputationStars.toFixed(1)} ★</dd>
      </dl>
    </div>
  );
}
