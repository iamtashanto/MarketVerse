import { useId, useState } from "react";
import { useGameEvent } from "@/game/bridge/useGameEvent";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useStoreInventory } from "@/features/inventory/hooks/useStoreInventory";
import { useUpdatePrice } from "@/features/inventory/hooks/useUpdatePrice";
import { useRestock } from "@/features/inventory/hooks/useRestock";
import { useBuy } from "@/features/economy/hooks/useBuy";
import { useSell } from "@/features/economy/hooks/useSell";
import { useUiStore } from "@/state/ui.store";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiError } from "@/services/apiClient";

const BUY_QUANTITY = 10;
const RESTOCK_QUANTITY = 5;

/**
 * Opens on the discrete `shelf:selected` engine event (§14 bridge) — this
 * component never polls or reaches into Pixi; it only reacts to the one
 * event the engine emits when the player interacts with a shelf.
 */
export function ShelfPanel({ storeId }: { storeId: string }) {
  const [productId, setProductId] = useState<string | null>(null);
  const [priceDraft, setPriceDraft] = useState<string>("");
  const titleId = useId();

  useGameEvent("shelf:selected", (payload) => {
    setProductId(payload.productId);
  });

  const { data: products } = useProducts();
  const { data: inventory } = useStoreInventory(storeId);
  const pushToast = useUiStore((s) => s.pushToast);

  const updatePrice = useUpdatePrice(storeId);
  const restock = useRestock(storeId);
  const buy = useBuy(storeId);
  const sell = useSell(storeId);

  const product = products?.find((p) => p.id === productId);
  const inventoryItem = inventory?.find((i) => i.productId === productId);

  const shelfQuantity = inventoryItem?.shelfQuantity ?? 0;
  const warehouseQuantity = inventoryItem?.warehouseQuantity ?? 0;
  const currentPrice = inventoryItem?.price ?? product?.basePrice ?? 0;

  // Reset the price draft when the selected shelf changes — computed during
  // render (React's recommended "adjusting state on a prop change" pattern)
  // rather than in an effect, which would cost an extra render pass.
  const [lastSeenProductId, setLastSeenProductId] = useState(productId);
  if (productId !== lastSeenProductId) {
    setLastSeenProductId(productId);
    setPriceDraft(currentPrice.toFixed(2));
  }

  if (!product) return null;

  function notifyError(error: unknown, fallback: string) {
    const message = error instanceof ApiError ? error.message : fallback;
    pushToast({ variant: "danger", message });
  }

  const handleBuy = () => {
    buy.mutate(
      { productId: product.id, quantity: BUY_QUANTITY },
      {
        onSuccess: (result) =>
          pushToast({ variant: "success", message: `Ordered ${result.quantity} ${product.name} for $${result.total.toFixed(2)}` }),
        onError: (error) => notifyError(error, "Order failed"),
      },
    );
  };

  const handleRestock = () => {
    restock.mutate(
      { productId: product.id, quantity: Math.min(RESTOCK_QUANTITY, warehouseQuantity) },
      {
        onSuccess: () => pushToast({ variant: "success", message: `Stocked the shelf with ${product.name}` }),
        onError: (error) => notifyError(error, "Restock failed"),
      },
    );
  };

  const handleSell = () => {
    sell.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: (result) =>
          pushToast({ variant: "success", message: `Sold 1 ${product.name} for $${result.total.toFixed(2)}` }),
        onError: (error) => notifyError(error, "Sale failed"),
      },
    );
  };

  const handleSavePrice = () => {
    const price = Number(priceDraft);
    if (!Number.isFinite(price) || price <= 0) {
      pushToast({ variant: "danger", message: "Enter a valid price" });
      return;
    }
    updatePrice.mutate(
      { productId: product.id, price },
      {
        onSuccess: () => pushToast({ variant: "success", message: "Price updated" }),
        onError: (error) => notifyError(error, "Price update failed"),
      },
    );
  };

  return (
    <Modal.Root open={!!productId} onClose={() => setProductId(null)} titleId={titleId}>
      <Modal.Header>{product.name}</Modal.Header>
      <Modal.Body>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <dt className="text-text-muted">Shelf stock</dt>
          <dd className="mono text-right">{shelfQuantity}</dd>
          <dt className="text-text-muted">Warehouse stock</dt>
          <dd className="mono text-right">{warehouseQuantity}</dd>
          <dt className="text-text-muted">Base cost</dt>
          <dd className="mono text-right">${product.baseCost.toFixed(2)}</dd>
        </dl>

        <div className="mt-4 flex items-end gap-2">
          <Input
            label="Price"
            type="number"
            step="0.01"
            min="0.01"
            value={priceDraft}
            onChange={(e) => setPriceDraft(e.target.value)}
          />
          <Button variant="secondary" onClick={handleSavePrice} isLoading={updatePrice.isPending}>
            Save
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleBuy} isLoading={buy.isPending}>
          Order {BUY_QUANTITY}
        </Button>
        <Button variant="secondary" onClick={handleRestock} disabled={warehouseQuantity === 0} isLoading={restock.isPending}>
          Stock Shelf
        </Button>
        <Button onClick={handleSell} disabled={shelfQuantity === 0} isLoading={sell.isPending}>
          Sell 1
        </Button>
      </Modal.Footer>
    </Modal.Root>
  );
}
