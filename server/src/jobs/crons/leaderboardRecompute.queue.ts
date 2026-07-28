import { Queue, Worker } from "bullmq";
import { bullConnection } from "@/jobs/queues/connection";
import { logger } from "@/lib/logger";

/**
 * BullMQ repeatable job, NOT node-cron — a schedule registered here fires
 * exactly once per interval regardless of how many app/worker instances are
 * running, because the schedule lives in Redis, not in any one process.
 * See docs/BACKEND_ARCHITECTURE.md §15.
 */
export const leaderboardRecomputeQueue = new Queue("leaderboard-recompute", { connection: bullConnection });

export const leaderboardRecomputeWorker = new Worker(
  "leaderboard-recompute",
  async () => {
    // Recomputes leaderboard_entries from stores/wallet_balances — the
    // derived/cached table pattern from docs/DATABASE_DESIGN.md §5.
    logger.info("Recomputing leaderboard entries (stub)");
  },
  { connection: bullConnection, concurrency: 1 },
);

export async function scheduleLeaderboardRecompute(): Promise<void> {
  await leaderboardRecomputeQueue.add(
    "recompute",
    {},
    {
      repeat: { pattern: "*/5 * * * *" },
      jobId: "leaderboard-recompute", // fixed jobId prevents duplicate schedules on redeploy
    },
  );
}
