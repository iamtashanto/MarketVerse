import { Router } from "express";
import { StoresController } from "@/modules/stores/stores.controller";
import { StoresService } from "@/modules/stores/stores.service";
import { StoresRepository } from "@/modules/stores/stores.repository";
import { prismaWrite } from "@/lib/prisma";
import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { gameplayWriteLimiter, standardReadLimiter } from "@/middlewares/rateLimiter.middleware";
import {
  createStoreSchema,
  getStoreSchema,
  listStoresSchema,
  updateStoreSchema,
} from "@/modules/stores/stores.validation";

const storesRepository = new StoresRepository(prismaWrite);
const storesService = new StoresService(storesRepository);
const storesController = new StoresController(storesService);

export const storesRouter = Router();

storesRouter.post(
  "/",
  authenticate,
  gameplayWriteLimiter,
  validate(createStoreSchema),
  storesController.createStore,
);

storesRouter.get(
  "/mine",
  authenticate,
  standardReadLimiter,
  validate(listStoresSchema),
  storesController.listMyStores,
);

storesRouter.get("/:storeId", standardReadLimiter, validate(getStoreSchema), storesController.getStore);

storesRouter.patch(
  "/:storeId",
  authenticate,
  gameplayWriteLimiter,
  validate(updateStoreSchema),
  storesController.updateStore,
);
