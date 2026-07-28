import { apiRequest } from "@/services/apiClient";
import type { Store } from "@/features/stores/types";

export const storesApi = {
  get: (storeId: string) => apiRequest<Store>(`/stores/${storeId}`),
};
