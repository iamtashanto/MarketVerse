import { InventoryRepository } from "@/modules/inventory/inventory.repository";
import { StoresRepository } from "@/modules/stores/stores.repository";
import { ProductsRepository } from "@/modules/products/products.repository";
import { ConflictError, ForbiddenError, NotFoundError } from "@/common/errors/AppError";
import { CursorPagination, buildCursorPage } from "@/common/dto/pagination.dto";

export class InventoryService {
  constructor(
    private readonly inventoryRepo: InventoryRepository,
    private readonly storesRepo: StoresRepository,
    private readonly productsRepo: ProductsRepository,
  ) {}

  async listStoreInventory(storePublicId: string, pagination: CursorPagination) {
    const store = await this.requireStore(storePublicId);
    const rows = await this.inventoryRepo.listByStore(store.id, pagination);
    return buildCursorPage(rows, pagination.limit);
  }

  async getInventoryItem(storePublicId: string, productPublicId: string) {
    const { row } = await this.resolveExistingItem(storePublicId, productPublicId);
    return row;
  }

  async updatePrice(userId: bigint, storePublicId: string, productPublicId: string, price: number) {
    const store = await this.requireOwnedStore(userId, storePublicId);
    const product = await this.requireProduct(productPublicId);
    const row = await this.inventoryRepo.findByStoreAndProduct(store.id, product.id);
    if (!row) throw new NotFoundError("This store doesn't carry that product yet — order it first");

    return this.inventoryRepo.updatePrice(row.id, price);
  }

  /** Warehouse -> shelf. See docs/GAMEPLAY_MECHANICS.md §3 Stocking. */
  async restock(userId: bigint, storePublicId: string, productPublicId: string, quantity: number) {
    const store = await this.requireOwnedStore(userId, storePublicId);
    const product = await this.requireProduct(productPublicId);
    const row = await this.inventoryRepo.findByStoreAndProduct(store.id, product.id);
    if (!row) throw new NotFoundError("This store doesn't carry that product yet — order it first");

    const moved = await this.inventoryRepo.moveWarehouseToShelf(row.id, quantity);
    if (moved === 0) throw new ConflictError("No warehouse stock available to restock");

    return this.inventoryRepo.findByStoreAndProduct(store.id, product.id);
  }

  async requireOwnedStore(userId: bigint, storePublicId: string) {
    const store = await this.requireStore(storePublicId);
    if (store.ownerId !== userId) throw new ForbiddenError("Not your store");
    return store;
  }

  private async requireStore(storePublicId: string) {
    const store = await this.storesRepo.findByPublicId(storePublicId);
    if (!store) throw new NotFoundError("Store not found");
    return store;
  }

  private async requireProduct(productPublicId: string) {
    const product = await this.productsRepo.findActiveByPublicId(productPublicId);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }

  private async resolveExistingItem(storePublicId: string, productPublicId: string) {
    const store = await this.requireStore(storePublicId);
    const product = await this.requireProduct(productPublicId);
    const row = await this.inventoryRepo.findByStoreAndProduct(store.id, product.id);
    if (!row) throw new NotFoundError("This store doesn't carry that product yet");
    return { store, product, row };
  }
}
