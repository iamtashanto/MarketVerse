import { InventoryLocation, PrismaClient, Prisma, Product, StoreInventory } from "@prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

const ACTIVE_STATUSES: Array<"FRESH" | "EXPIRING"> = ["FRESH", "EXPIRING"];

/**
 * Owns store_inventory + inventory_batches — the only place FIFO batch
 * logic lives, per docs/DATABASE_DESIGN.md §5 (shelfQuantity/warehouseQuantity
 * are denormalized caches over the batches; this repository is what keeps
 * them in sync). Every write method accepts an optional `db` so callers can
 * run it inside a $transaction alongside a wallet debit/credit — see
 * docs/BACKEND_ARCHITECTURE.md §5.
 */
export class InventoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByStoreAndProduct(storeId: bigint, productId: bigint, db: Db = this.prisma) {
    return db.storeInventory.findUnique({
      where: { storeId_productId: { storeId, productId } },
      include: { product: true },
    });
  }

  listByStore(storeId: bigint, pagination: { cursor?: bigint; limit: number }, db: Db = this.prisma) {
    return db.storeInventory.findMany({
      where: { storeId },
      include: { product: true },
      take: pagination.limit + 1,
      ...(pagination.cursor && { cursor: { id: pagination.cursor }, skip: 1 }),
      orderBy: { id: "asc" },
    });
  }

  /** Creates the store_inventory row on first purchase of a product a store has never carried before. */
  async ensureStoreInventory(
    storeId: bigint,
    product: Product,
    db: Db = this.prisma,
  ): Promise<StoreInventory> {
    const existing = await db.storeInventory.findUnique({
      where: { storeId_productId: { storeId, productId: product.id } },
    });
    if (existing) return existing;

    return db.storeInventory.create({
      data: { storeId, productId: product.id, price: product.basePrice },
    });
  }

  updatePrice(id: bigint, price: number, db: Db = this.prisma) {
    return db.storeInventory.update({ where: { id }, data: { price } });
  }

  /** Buying from a supplier — always lands as a fresh batch in the warehouse. */
  async createWarehouseBatch(
    storeInventoryId: bigint,
    quantity: number,
    unitCost: number,
    expiresAt: Date | null,
    db: Db = this.prisma,
  ): Promise<void> {
    await db.inventoryBatch.create({
      data: { storeInventoryId, location: "WAREHOUSE", quantity, unitCost, expiresAt, status: "FRESH" },
    });
    await db.storeInventory.update({
      where: { id: storeInventoryId },
      data: { warehouseQuantity: { increment: quantity } },
    });
  }

  /**
   * Restocking — moves up to `requestedQuantity` units from warehouse to
   * shelf, oldest batch first, preserving each batch's original expiry.
   * Returns the quantity actually moved (may be less than requested if the
   * warehouse doesn't have enough on hand).
   */
  async moveWarehouseToShelf(storeInventoryId: bigint, requestedQuantity: number, db: Db = this.prisma): Promise<number> {
    const moved = await this.moveBatchesFifo(storeInventoryId, "WAREHOUSE", "SHELF", requestedQuantity, db);
    if (moved > 0) {
      await db.storeInventory.update({
        where: { id: storeInventoryId },
        data: { warehouseQuantity: { decrement: moved }, shelfQuantity: { increment: moved } },
      });
    }
    return moved;
  }

  /**
   * Selling — consumes up to `requestedQuantity` units from the shelf,
   * oldest batch first, never touching an EXPIRED batch (hard sale block,
   * per docs/GAMEPLAY_MECHANICS.md §13). Returns the quantity actually sold.
   */
  async consumeShelfForSale(storeInventoryId: bigint, requestedQuantity: number, db: Db = this.prisma): Promise<number> {
    const sold = await this.moveBatchesFifo(storeInventoryId, "SHELF", null, requestedQuantity, db);
    if (sold > 0) {
      await db.storeInventory.update({
        where: { id: storeInventoryId },
        data: { shelfQuantity: { decrement: sold } },
      });
    }
    return sold;
  }

  /**
   * Shared FIFO walker. `to = null` means consume/delete (a sale); a
   * non-null `to` relocates the batch (a restock). Full-batch moves update
   * `location` in place; partial moves split off exactly the moved quantity
   * so the remainder keeps its own row (and its own receivedAt/expiresAt).
   */
  private async moveBatchesFifo(
    storeInventoryId: bigint,
    from: InventoryLocation,
    to: InventoryLocation | null,
    requestedQuantity: number,
    db: Db,
  ): Promise<number> {
    let remaining = requestedQuantity;
    const batches = await db.inventoryBatch.findMany({
      where: { storeInventoryId, location: from, status: { in: ACTIVE_STATUSES } },
      orderBy: { receivedAt: "asc" },
    });

    for (const batch of batches) {
      if (remaining <= 0) break;
      const moveQty = Math.min(remaining, batch.quantity);

      if (moveQty === batch.quantity) {
        if (to) {
          await db.inventoryBatch.update({ where: { id: batch.id }, data: { location: to } });
        } else {
          await db.inventoryBatch.delete({ where: { id: batch.id } });
        }
      } else {
        await db.inventoryBatch.update({ where: { id: batch.id }, data: { quantity: { decrement: moveQty } } });
        if (to) {
          await db.inventoryBatch.create({
            data: {
              storeInventoryId,
              location: to,
              quantity: moveQty,
              unitCost: batch.unitCost,
              receivedAt: batch.receivedAt,
              expiresAt: batch.expiresAt,
              status: batch.status,
            },
          });
        }
      }
      remaining -= moveQty;
    }

    return requestedQuantity - remaining;
  }
}
