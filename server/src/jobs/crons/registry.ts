import { scheduleDailyMissionReset } from "@/jobs/crons/dailyMissionReset.queue";
import { scheduleSpoilageSweep } from "@/jobs/crons/spoilageSweep.queue";
import { scheduleLeaderboardRecompute } from "@/jobs/crons/leaderboardRecompute.queue";
import { logger } from "@/lib/logger";

/**
 * Registers every repeatable job's schedule. Safe to call on every worker
 * boot — BullMQ dedupes by `jobId`, so a redeploy doesn't create duplicate
 * schedules. See docs/BACKEND_ARCHITECTURE.md §15.
 */
export async function registerCronSchedules(): Promise<void> {
  await Promise.all([scheduleDailyMissionReset(), scheduleSpoilageSweep(), scheduleLeaderboardRecompute()]);
  logger.info("Cron schedules registered");
}
