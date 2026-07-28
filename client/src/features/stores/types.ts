/** Mirrors server/src/modules/stores/stores.dto.ts (StoreResponseDto). */
export interface Store {
  id: string;
  name: string;
  slug: string;
  level: number;
  reputationStars: number;
  status: "ACTIVE" | "ARCHIVED";
  createdAt: string;
}
