import { PrismaClient } from "@prisma/client";
import { WalletRepository } from "@/modules/economy/wallet.repository";
import { InventoryRepository } from "@/modules/inventory/inventory.repository";
import { StoresRepository } from "@/modules/stores/stores.repository";
import { ProductsRepository } from "@/modules/products/products.repository";
import { ConflictError, NotFoundError } from "@/common/errors/AppError";
import { toCents, toDollars } from "@/modules/economy/economy.util";
import { WalletResponseDto, TransactionResultDto } from "@/modules/economy/economy.dto";
import { InventoryService } from "@/modules/inventory/inventory.service";

const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Owns every money-moving action — buying and selling always touch the
 * wallet ledger and store_inventory/inventory_batches together, in one
 * $transaction, per docs/BACKEND_ARCHITECTURE.md §5. Non-money inventory
 * actions (restock, pricing) stay in InventoryService.
 */
export class EconomyService {
  constructor(
    private readonly walletRepo: WalletRepository,
    private readonly inventoryRepo: InventoryRepository,
    private readonly storesRepo: StoresRepository,
    private readonly productsRepo: ProductsRepository,
    private readonly inventoryService: InventoryService,
    private readonly prisma: PrismaClient,
  ) {}

  async getWallet(storePublicId: string): Promise<WalletResponseDto> {
    const store = await this.storesRepo.findByPublicId(storePublicId);
    if (!store) throw new NotFoundError("Store not found");

    const balance = await this.walletRepo.getBalance(store.ownerId, "CASH");
    return { currency: "CASH", balance: toDollars(balance?.balance ?? 0n) };
  }

  /** Order from a supplier — always lands in the warehouse. See docs/GAMEPLAY_MECHANICS.md §4 Buying. */
  async buyFromSupplier(
    userId: bigint,
    storePublicId: string,
    productPublicId: string,
    quantity: number,
  ): Promise<TransactionResultDto> {
    const store = await this.inventoryService.requireOwnedStore(userId, storePublicId);
    const product = await this.requireProduct(productPublicId);

    const unitCostCents = toCents(product.baseCost);
    const totalCents = unitCostCents * BigInt(quantity);
    const expiresAt = product.shelfLifeHours ? new Date(Date.now() + product.shelfLifeHours * MS_PER_HOUR) : null;

    const newBalanceCents = await this.prisma.$transaction(async (tx) => {
      const storeInventory = await this.inventoryRepo.ensureStoreInventory(store.id, product, tx);

      const balance = await this.walletRepo.debit(
        {
          userId: store.ownerId,
          currency: "CASH",
          amountCents: totalCents,
          reason: "SUPPLIER_PURCHASE",
          referenceType: "store_inventory",
          referenceId: storeInventory.id,
        },
        tx,
      );

      await this.inventoryRepo.createWarehouseBatch(
        storeInventory.id,
        quantity,
        Number(product.baseCost),
        expiresAt,
        tx,
      );

      return balance;
    });

    return {
      quantity,
      unitPrice: toDollars(unitCostCents),
      total: toDollars(totalCents),
      newBalance: toDollars(newBalanceCents),
    };
  }

  /** A walk-up sale — see docs/GAMEPLAY_MECHANICS.md §5 Selling. */
  async sell(
    userId: bigint,
    storePublicId: string,
    productPublicId: string,
    quantity: number,
  ): Promise<TransactionResultDto> {
    const store = await this.inventoryService.requireOwnedStore(userId, storePublicId);
    const product = await this.requireProduct(productPublicId);

    const existing = await this.inventoryRepo.findByStoreAndProduct(store.id, product.id);
    if (!existing) throw new ConflictError("This store doesn't carry that product yet");

    const unitPriceCents = toCents(existing.price);

    const { soldQuantity, newBalanceCents } = await this.prisma.$transaction(async (tx) => {
      const sold = await this.inventoryRepo.consumeShelfForSale(existing.id, quantity, tx);
      if (sold === 0) throw new ConflictError("Out of stock on the shelf");

      const saleTotalCents = unitPriceCents * BigInt(sold);
      const balance = await this.walletRepo.credit(
        {
          userId: store.ownerId,
          currency: "CASH",
          amountCents: saleTotalCents,
          reason: "PRODUCT_SALE",
          referenceType: "store_inventory",
          referenceId: existing.id,
        },
        tx,
      );

      return { soldQuantity: sold, newBalanceCents: balance };
    });

    return {
      quantity: soldQuantity,
      unitPrice: toDollars(unitPriceCents),
      total: toDollars(unitPriceCents * BigInt(soldQuantity)),
      newBalance: toDollars(newBalanceCents),
    };
  }

  private async requireProduct(productPublicId: string) {
    const product = await this.productsRepo.findActiveByPublicId(productPublicId);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }
}
