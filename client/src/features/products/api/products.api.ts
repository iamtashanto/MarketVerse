import { apiRequest, apiRequestEnvelope, toQueryString } from "@/services/apiClient";
import type { Product } from "@/features/products/types";
import type { CursorPage } from "@/types/api";

export const productsApi = {
  list: async (params?: { cursor?: string; limit?: number }): Promise<CursorPage<Product>> => {
    const envelope = await apiRequestEnvelope<Product[]>(`/products${toQueryString(params)}`);
    return { items: envelope.data, nextCursor: (envelope.meta?.nextCursor as string | null) ?? null };
  },
  get: (productId: string) => apiRequest<Product>(`/products/${productId}`),
};
