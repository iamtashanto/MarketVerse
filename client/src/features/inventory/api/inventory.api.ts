import { apiRequest, apiRequestEnvelope, toQueryString } from "@/services/apiClient";
import type { InventoryItem } from "@/features/inventory/types";
import type { CursorPage } from "@/types/api";

export const inventoryApi = {
  list: async (storeId: string, params?: { cursor?: string; limit?: number }): Promise<CursorPage<InventoryItem>> => {
    const envelope = await apiRequestEnvelope<InventoryItem[]>(
      `/stores/${storeId}/inventory${toQueryString(params)}`,
    );
    return { items: envelope.data, nextCursor: (envelope.meta?.nextCursor as string | null) ?? null };
  },

  get: (storeId: string, productId: string) =>
    apiRequest<InventoryItem>(`/stores/${storeId}/inventory/${productId}`),

  updatePrice: (storeId: string, productId: string, price: number) =>
    apiRequest<InventoryItem>(`/stores/${storeId}/inventory/${productId}`, {
      method: "PATCH",
      body: JSON.stringify({ price }),
    }),

  restock: (storeId: string, productId: string, quantity: number) =>
    apiRequest<InventoryItem>(`/stores/${storeId}/inventory/${productId}/restock`, {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }),
};
