import { useMemo } from "react";
import { Outlet, useParams } from "react-router";
import { GameCanvas } from "@/game/GameCanvas";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useStoreInventory } from "@/features/inventory/hooks/useStoreInventory";
import { useWallet } from "@/features/economy/hooks/useWallet";
import { ShelfPanel } from "@/features/inventory/components/ShelfPanel";
import { formatCurrency } from "@/utils/formatters";
import { Spinner } from "@/components/feedback/Spinner";
import type { ShelfConfig, ShelfStock } from "@/game/engine/createGameEngine";

/**
 * HUD chrome around the canvas. Every value shown here is real, accessible
 * DOM content — never solely rendered inside the canvas itself, since the
 * canvas is opaque to assistive tech. See docs/FRONTEND_ARCHITECTURE.md §1, §16.
 */
export function GameLayout() {
  const { storeId } = useParams<{ storeId: string }>();
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: inventory } = useStoreInventory(storeId!);
  const { data: wallet } = useWallet(storeId!);

  // Fixed floor layout for this store session — a real layout editor
  // (docs/PRD.md §8.3) would persist player-chosen positions instead.
  const shelves = useMemo<ShelfConfig[]>(
    () => (products ?? []).map((p, i) => ({ productId: p.id, name: p.name, gridX: i, gridY: 0 })),
    [products],
  );

  const stock = useMemo<ShelfStock[]>(
    () =>
      (products ?? []).map((p) => {
        const item = inventory?.find((i) => i.productId === p.id);
        return { productId: p.id, shelfQuantity: item?.shelfQuantity ?? 0, price: item?.price ?? p.basePrice };
      }),
    [products, inventory],
  );

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-2 text-sm">
        <span className="font-semibold">MarketVerse</span>
        <div
          className="flex items-center gap-1 rounded-full bg-surface-raised px-4 py-1 font-mono text-sm font-medium tabular-nums text-accent"
          aria-live="polite"
        >
          {wallet ? formatCurrency(wallet.balance) : "—"}
        </div>
      </header>
      <div className="relative flex-1">
        {productsLoading || !storeId ? (
          <div className="flex h-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : (
          <GameCanvas shelves={shelves} stock={stock} />
        )}
        <div className="pointer-events-none absolute inset-0">
          <Outlet />
        </div>
        {storeId && <ShelfPanel storeId={storeId} />}
      </div>
      <footer className="border-t border-border bg-surface px-4 py-2 text-sm text-text-muted">
        Walk up to a shelf and press <kbd className="rounded bg-surface-raised px-1.5 py-0.5 font-mono">E</kbd> (or click it) to order, stock, price, and sell.
      </footer>
    </div>
  );
}
