import { apiRequest } from "@/services/apiClient";
import type { TransactionResult, Wallet } from "@/features/economy/types";

export const economyApi = {
  getWallet: (storeId: string) => apiRequest<Wallet>(`/stores/${storeId}/wallet`),

  buy: (storeId: string, productId: string, quantity: number) =>
    apiRequest<TransactionResult>(`/stores/${storeId}/inventory/${productId}/order`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }),

  sell: (storeId: string, productId: string, quantity: number) =>
    apiRequest<TransactionResult>(`/stores/${storeId}/inventory/${productId}/sell`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }),
};
