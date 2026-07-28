import { Store } from "@prisma/client";

export interface StoreResponseDto {
  id: string; // publicId
  name: string;
  slug: string;
  level: number;
  reputationStars: number;
  status: string;
  createdAt: string;
}

/**
 * A Prisma model instance must never be passed to res.json() directly — every
 * response goes through a mapper like this one. See docs/BACKEND_ARCHITECTURE.md §7.
 */
export function toStoreResponseDto(store: Store): StoreResponseDto {
  return {
    id: store.publicId,
    name: store.name,
    slug: store.slug,
    level: store.level,
    reputationStars: Number(store.reputationStars),
    status: store.status,
    createdAt: store.createdAt.toISOString(),
  };
}
