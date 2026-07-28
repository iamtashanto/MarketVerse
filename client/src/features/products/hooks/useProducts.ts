import { useQuery } from "@tanstack/react-query";
import { productsApi } from "@/features/products/api/products.api";

export const productKeys = {
  list: () => ["products", "list"] as const,
};

/** The seeded catalog is small for now — a single page covers it; a real
 * catalog browser would use hooks/usePagination.ts instead. */
export function useProducts() {
  return useQuery({
    queryKey: productKeys.list(),
    queryFn: () => productsApi.list({ limit: 50 }),
    staleTime: 10 * 60_000, // near-static catalog, matches docs/BACKEND_ARCHITECTURE.md §13
    select: (page) => page.items,
  });
}
