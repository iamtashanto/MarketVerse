import { Router } from "express";
import { authRouter } from "@/modules/auth/auth.routes";
import { storesRouter } from "@/modules/stores/stores.routes";
import { uploadsRouter } from "@/modules/uploads/uploads.routes";

/**
 * Aggregates every module's router under its base path. Additional modules
 * (inventory, employees, economy, missions, social, admin, …) mount here
 * following the same pattern as stores/uploads. See docs/BACKEND_ARCHITECTURE.md §2.
 */
export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/stores", storesRouter);
apiRouter.use("/uploads", uploadsRouter);
