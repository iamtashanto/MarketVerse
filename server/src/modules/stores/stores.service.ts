import { StoresRepository } from "@/modules/stores/stores.repository";
import { CreateStoreDto, UpdateStoreDto } from "@/modules/stores/stores.validation";
import { ConflictError, ForbiddenError, NotFoundError } from "@/common/errors/AppError";
import { CursorPage, CursorPagination, buildCursorPage } from "@/common/dto/pagination.dto";
import { Store } from "@prisma/client";
import { wrap, invalidate } from "@/cache/cache.service";
import { cacheKeys } from "@/cache/keys";

export class StoresService {
  constructor(private readonly storesRepo: StoresRepository) {}

  async createStore(ownerId: bigint, dto: CreateStoreDto): Promise<Store> {
    const existingSlug = await this.storesRepo.findBySlug(dto.slug);
    if (existingSlug) throw new ConflictError("That store URL is already taken");

    // NOTE: in the full implementation this also creates the store's default
    // StoreLayout and StoreWarehouse rows inside the same transaction (all
    // three are the same aggregate — a store is never valid without them).
    // Omitted here to keep this reference slice focused; see
    // docs/BACKEND_ARCHITECTURE.md §5 for the pattern this follows.
    return this.storesRepo.create({ ownerId, name: dto.name, slug: dto.slug });
  }

  async getStoreByPublicId(publicId: string): Promise<Store> {
    const store = await this.storesRepo.findByPublicId(publicId);
    if (!store) throw new NotFoundError("Store not found");
    return store;
  }

  async listMyStores(ownerId: bigint, pagination: CursorPagination): Promise<CursorPage<Store>> {
    const rows = await this.storesRepo.findByOwner(ownerId, pagination);
    return buildCursorPage(rows, pagination.limit);
  }

  /**
   * Ownership is re-verified server-side on every mutating call — never
   * trusted from a client-supplied field. See docs/BACKEND_ARCHITECTURE.md §10.
   */
  async updateStore(userId: bigint, storePublicId: string, dto: UpdateStoreDto): Promise<Store> {
    const store = await this.storesRepo.findByPublicId(storePublicId);
    if (!store) throw new NotFoundError("Store not found");
    if (store.ownerId !== userId) throw new ForbiddenError("Not your store");

    const updated = await this.storesRepo.update(store.id, dto);
    await invalidate(cacheKeys.storeInventory(store.id));
    return updated;
  }

  async getStoreInventorySnapshot(storeId: bigint): Promise<unknown> {
    return wrap(cacheKeys.storeInventory(storeId), 10, async () => {
      // Delegates to inventory.repository in the full implementation —
      // illustrates the cache-aside call shape from docs/BACKEND_ARCHITECTURE.md §13.
      return { storeId: storeId.toString(), items: [] };
    });
  }
}
