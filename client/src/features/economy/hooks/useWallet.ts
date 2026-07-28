import { useQuery } from "@tanstack/react-query";
import { economyApi } from "@/features/economy/api/economy.api";

export const walletKeys = {
  detail: (storeId: string) => ["wallet", storeId] as const,
};

/** Never cached beyond a fast poll window — financial data is never served
 * stale by design. See docs/BACKEND_ARCHITECTURE.md §13. */
export function useWallet(storeId: string) {
  return useQuery({
    queryKey: walletKeys.detail(storeId),
    queryFn: () => economyApi.getWallet(storeId),
    staleTime: 0,
    enabled: !!storeId,
  });
}
