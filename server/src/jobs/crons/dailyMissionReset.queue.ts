import { Queue, Worker } from "bullmq";
import { bullConnection } from "@/jobs/queues/connection";
import { logger } from "@/lib/logger";

export const dailyMissionResetQueue = new Queue("daily-mission-reset", { connection: bullConnection });

export const dailyMissionResetWorker = new Worker(
  "daily-mission-reset",
  async () => {
    // Expires yesterday's DAILY user_missions, assigns today's set
    // (cycle_key = current date, see docs/DATABASE_DESIGN.md UserMission model).
    logger.info("Running daily mission reset (stub)");
  },
  { connection: bullConnection, concurrency: 1 },
);

export async function scheduleDailyMissionReset(): Promise<void> {
  await dailyMissionResetQueue.add(
    "reset",
    {},
    { repeat: { pattern: "0 0 * * *" }, jobId: "daily-mission-reset" },
  );
}
