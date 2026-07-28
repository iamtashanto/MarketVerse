import { Router } from "express";
import { authRouter } from "@/modules/auth/auth.routes";
import { storesRouter } from "@/modules/stores/stores.routes";
import { uploadsRouter } from "@/modules/uploads/uploads.routes";
import { productsRouter } from "@/modules/products/products.routes";
import { inventoryRouter } from "@/modules/inventory/inventory.routes";
import { economyRouter } from "@/modules/economy/economy.routes";

/**
 * Aggregates every module's router under its base path. Additional modules
 * (employees, missions, social, admin, …) mount here following the same
 * pattern. See docs/BACKEND_ARCHITECTURE.md §2.
 */
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/stores", storesRouter);
apiRouter.use("/uploads", uploadsRouter);
apiRouter.use("/products", productsRouter);
apiRouter.use("/stores/:storeId/inventory", inventoryRouter);
apiRouter.use("/stores/:storeId", economyRouter);
