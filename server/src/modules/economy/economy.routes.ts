import { Router } from "express";
import { EconomyController } from "@/modules/economy/economy.controller";
import { EconomyService } from "@/modules/economy/economy.service";
import { WalletRepository } from "@/modules/economy/wallet.repository";
import { InventoryRepository } from "@/modules/inventory/inventory.repository";
import { InventoryService } from "@/modules/inventory/inventory.service";
import { StoresRepository } from "@/modules/stores/stores.repository";
import { ProductsRepository } from "@/modules/products/products.repository";
import { prismaWrite, prismaRead } from "@/lib/prisma";
import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { gameplayWriteLimiter, standardReadLimiter } from "@/middlewares/rateLimiter.middleware";
import { buySchema, sellSchema, walletParamsSchema } from "@/modules/economy/economy.validation";

const walletRepository = new WalletRepository(prismaWrite);
const inventoryRepository = new InventoryRepository(prismaWrite);
const storesRepository = new StoresRepository(prismaWrite);
const productsRepository = new ProductsRepository(prismaRead);
const inventoryService = new InventoryService(inventoryRepository, storesRepository, productsRepository);
const economyService = new EconomyService(
  walletRepository,
  inventoryRepository,
  storesRepository,
  productsRepository,
  inventoryService,
  prismaWrite,
);
const economyController = new EconomyController(economyService);

/** Mounted at /stores/:storeId — see server/src/routes/index.ts. */
export const economyRouter = Router({ mergeParams: true });

economyRouter.get(
  "/wallet",
  authenticate,
  standardReadLimiter,
  validate(walletParamsSchema),
  economyController.getWallet,
);

economyRouter.post(
  "/inventory/:productId/order",
  authenticate,
  gameplayWriteLimiter,
  validate(buySchema),
  economyController.buy,
);

economyRouter.post(
  "/inventory/:productId/sell",
  authenticate,
  gameplayWriteLimiter,
  validate(sellSchema),
  economyController.sell,
);
