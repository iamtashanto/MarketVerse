/**
 * Centralized cache key builders — one function per cached shape, so an
 * invalidation call site and a read call site can never drift into
 * generating different keys for the "same" data. See docs/BACKEND_ARCHITECTURE.md §13.
 */
export const cacheKeys = {
  storeInventory: (storeId: bigint) => `store:${storeId}:inventory`,
  leaderboardPage: (seasonId: bigint, cursor: string | null) =>
    `leaderboard:${seasonId}:page:${cursor ?? "first"}`,
  productCatalog: () => "products:catalog",
  userSession: (userId: bigint) => `user:${userId}:session`,
};
