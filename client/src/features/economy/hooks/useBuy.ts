import { useMutation, useQueryClient } from "@tanstack/react-query";
import { economyApi } from "@/features/economy/api/economy.api";
import { walletKeys } from "@/features/economy/hooks/useWallet";
import { inventoryKeys } from "@/features/inventory/hooks/useStoreInventory";

/** Order from a supplier — lands in the warehouse. See docs/GAMEPLAY_MECHANICS.md §4 Buying. */
export function useBuy(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { productId: string; quantity: number }) =>
      economyApi.buy(storeId, input.productId, input.quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.detail(storeId) });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.list(storeId) });
    },
  });
}
