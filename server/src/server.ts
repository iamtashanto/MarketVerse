import http from "node:http";
import { createApp } from "@/app";
import { initSockets } from "@/sockets";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { disconnectPrisma } from "@/lib/prisma";
import { disconnectRedis } from "@/lib/redis";

const GRACEFUL_SHUTDOWN_TIMEOUT_MS = 15_000;

/**
 * Boots the HTTP + Socket.IO server and wires graceful shutdown — required
 * for zero-downtime rolling deploys to actually be zero-downtime.
 * See docs/BACKEND_ARCHITECTURE.md §21, §22.
 */
export async function startServer(): Promise<http.Server> {
  const app = createApp();
  const httpServer = http.createServer(app);

  await initSockets(httpServer);

  await new Promise<void>((resolve) => httpServer.listen(env.PORT, resolve));
  logger.info({ port: env.PORT }, "MarketVerse API listening");

  registerGracefulShutdown(httpServer);
  return httpServer;
}

function registerGracefulShutdown(httpServer: http.Server): void {
  let shuttingDown = false;

  const shutdown = async (signal: string): Promise<void> => {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info({ signal }, "Received shutdown signal, draining connections");

    const forceExit = setTimeout(() => {
      logger.warn("Graceful shutdown timed out, forcing exit");
      process.exit(1);
    }, GRACEFUL_SHUTDOWN_TIMEOUT_MS);

    httpServer.close(async () => {
      clearTimeout(forceExit);
      await Promise.all([disconnectPrisma(), disconnectRedis()]);
      logger.info("Shutdown complete");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}
