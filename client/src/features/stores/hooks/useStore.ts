import { useQuery } from "@tanstack/react-query";
import { storesApi } from "@/features/stores/api/stores.api";

export const storeKeys = {
  detail: (storeId: string) => ["stores", storeId] as const,
};

export function useStore(storeId: string) {
  return useQuery({
    queryKey: storeKeys.detail(storeId),
    queryFn: () => storesApi.get(storeId),
    staleTime: 30_000, // mirrors server/src/cache TTL for store reads
  });
}
