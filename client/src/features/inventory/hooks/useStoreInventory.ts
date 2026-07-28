import { useQuery } from "@tanstack/react-query";
import { inventoryApi } from "@/features/inventory/api/inventory.api";

export const inventoryKeys = {
  all: (storeId: string) => ["inventory", storeId] as const,
  list: (storeId: string) => [...inventoryKeys.all(storeId), "list"] as const,
};

/** Cache-aside on the server too (server/src/cache, 10s TTL) — this staleTime
 * just avoids re-fetching faster than the server-side cache would reflect a
 * write anyway. See docs/BACKEND_ARCHITECTURE.md §13. */
export function useStoreInventory(storeId: string) {
  return useQuery({
    queryKey: inventoryKeys.list(storeId),
    queryFn: () => inventoryApi.list(storeId, { limit: 100 }),
    staleTime: 10_000,
    select: (page) => page.items,
    enabled: !!storeId,
  });
}
