import "@/jobs/workers/notification.worker";
import "@/jobs/workers/imageProcessing.worker";
import "@/jobs/workers/iapVerification.worker";
import "@/jobs/crons/leaderboardRecompute.queue";
import "@/jobs/crons/dailyMissionReset.queue";
import "@/jobs/crons/spoilageSweep.queue";
import { registerCronSchedules } from "@/jobs/crons/registry";
import { logger } from "@/lib/logger";
import { disconnectPrisma } from "@/lib/prisma";
import { disconnectRedis } from "@/lib/redis";

/**
 * Separate process from the web server (src/index.ts) — a slow/stuck job
 * must never starve the HTTP event loop, and this scales independently.
 * See docs/BACKEND_ARCHITECTURE.md §14, §21.
 */
async function main(): Promise<void> {
  await registerCronSchedules();
  logger.info("Worker process started");
}

main().catch((err) => {
  logger.fatal({ err }, "Worker process failed to start");
  process.exit(1);
});

async function shutdown(signal: string): Promise<void> {
  logger.info({ signal }, "Worker shutting down");
  await Promise.all([disconnectPrisma(), disconnectRedis()]);
  process.exit(0);
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
