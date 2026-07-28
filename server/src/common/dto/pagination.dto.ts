import { z } from "zod";

/**
 * Cursor pagination only — OFFSET is banned by convention on tables expected
 * to grow past a few thousand rows. See docs/DATABASE_DESIGN.md §12.
 */
export const cursorPaginationQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CursorPaginationQuery = z.infer<typeof cursorPaginationQuerySchema>;

export interface CursorPagination {
  cursor?: bigint;
  limit: number;
}

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

export function buildCursorPage<T extends { id: bigint }>(
  rows: T[],
  limit: number,
): CursorPage<T> {
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? items[items.length - 1]!.id.toString() : null;
  return { items, nextCursor };
}
