import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "@/config/env";
import { requestContext } from "@/middlewares/requestContext.middleware";
import { requestLogger } from "@/middlewares/requestLogger.middleware";
import { notFound } from "@/middlewares/notFound.middleware";
import { errorHandler } from "@/middlewares/errorHandler.middleware";
import { apiRouter } from "@/routes";
import { prismaWrite } from "@/lib/prisma";
import { cacheRedis } from "@/lib/redis";

/**
 * Assembles the Express app — no listen() here (that's server.ts), so the
 * app is importable/testable (supertest) without binding a port.
 * See docs/BACKEND_ARCHITECTURE.md §2.
 */
export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1); // behind a load balancer — req.ip reflects X-Forwarded-For

  // --- Security & platform middleware (docs/BACKEND_ARCHITECTURE.md §20) ---
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ALLOWED_ORIGINS,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());

  // --- Observability (docs/BACKEND_ARCHITECTURE.md §16) ---
  app.use(requestContext);
  app.use(requestLogger);

  // --- Health check — checked by the deploy pipeline before routing traffic (§22) ---
  app.get("/health", async (_req: Request, res: Response) => {
    try {
      await prismaWrite.$queryRaw`SELECT 1`;
      await cacheRedis.ping();
      res.status(200).json({ status: "ok" });
    } catch {
      res.status(503).json({ status: "unavailable" });
    }
  });

  // --- API routes ---
  app.use("/api/v1", apiRouter);

  // --- Error handling — MUST be registered last ---
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
