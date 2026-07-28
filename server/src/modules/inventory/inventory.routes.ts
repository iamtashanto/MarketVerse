import { Router } from "express";
import { InventoryController } from "@/modules/inventory/inventory.controller";
import { InventoryService } from "@/modules/inventory/inventory.service";
import { InventoryRepository } from "@/modules/inventory/inventory.repository";
import { StoresRepository } from "@/modules/stores/stores.repository";
import { ProductsRepository } from "@/modules/products/products.repository";
import { prismaWrite, prismaRead } from "@/lib/prisma";
import { authenticate, authenticateOptional } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { gameplayWriteLimiter, standardReadLimiter } from "@/middlewares/rateLimiter.middleware";
import {
  getInventoryItemSchema,
  listInventorySchema,
  restockSchema,
  updatePriceSchema,
} from "@/modules/inventory/inventory.validation";

const inventoryRepository = new InventoryRepository(prismaWrite);
const storesRepository = new StoresRepository(prismaWrite);
const productsRepository = new ProductsRepository(prismaRead);
const inventoryService = new InventoryService(inventoryRepository, storesRepository, productsRepository);
const inventoryController = new InventoryController(inventoryService);

export const inventoryRouter = Router({ mergeParams: true });

inventoryRouter.get(
  "/",
  authenticateOptional,
  standardReadLimiter,
  validate(listInventorySchema),
  inventoryController.listInventory,
);

inventoryRouter.get(
  "/:productId",
  authenticateOptional,
  standardReadLimiter,
  validate(getInventoryItemSchema),
  inventoryController.getInventoryItem,
);

inventoryRouter.patch(
  "/:productId",
  authenticate,
  gameplayWriteLimiter,
  validate(updatePriceSchema),
  inventoryController.updatePrice,
);

inventoryRouter.post(
  "/:productId/restock",
  authenticate,
  gameplayWriteLimiter,
  validate(restockSchema),
  inventoryController.restock,
);
