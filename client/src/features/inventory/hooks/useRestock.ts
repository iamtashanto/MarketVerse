import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/features/inventory/api/inventory.api";
import { inventoryKeys } from "@/features/inventory/hooks/useStoreInventory";

/** Warehouse -> shelf. See docs/GAMEPLAY_MECHANICS.md §3 Stocking. */
export function useRestock(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { productId: string; quantity: number }) =>
      inventoryApi.restock(storeId, input.productId, input.quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.list(storeId) });
    },
  });
}
