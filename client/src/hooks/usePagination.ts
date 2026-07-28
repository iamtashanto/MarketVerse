import { useInfiniteQuery, type QueryKey } from "@tanstack/react-query";
import type { CursorPage } from "@/types/api";

/**
 * Wraps the cursor-pagination contract (docs/API_REFERENCE.md §0.7) into a
 * reusable { items, loadMore, hasMore } shape, backed by TanStack Query's
 * infinite-query cache rather than hand-rolled page-accumulation state.
 */
export function usePagination<T>(
  queryKey: QueryKey,
  fetchPage: (cursor: string | undefined) => Promise<CursorPage<T>>,
) {
  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage(pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });

  return {
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    loadMore: () => query.fetchNextPage(),
    hasMore: query.hasNextPage,
    isLoading: query.isLoading,
    isLoadingMore: query.isFetchingNextPage,
    error: query.error,
  };
}
