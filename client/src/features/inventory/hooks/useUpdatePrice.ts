import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "@/features/inventory/api/inventory.api";
import { inventoryKeys } from "@/features/inventory/hooks/useStoreInventory";

export function useUpdatePrice(storeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { productId: string; price: number }) =>
      inventoryApi.updatePrice(storeId, input.productId, input.price),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.list(storeId) });
    },
  });
}
