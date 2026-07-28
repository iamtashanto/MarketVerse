import { Queue, Worker } from "bullmq";
import { bullConnection } from "@/jobs/queues/connection";
import { logger } from "@/lib/logger";

export const spoilageSweepQueue = new Queue("spoilage-sweep", { connection: bullConnection });

export const spoilageSweepWorker = new Worker(
  "spoilage-sweep",
  async () => {
    // Scans inventory_batches where expires_at < now(), transitions
    // FRESH/EXPIRING -> EXPIRED (docs/DATABASE_DESIGN.md InventoryBatch model).
    logger.info("Running spoilage sweep (stub)");
  },
  { connection: bullConnection, concurrency: 1 },
);

export async function scheduleSpoilageSweep(): Promise<void> {
  await spoilageSweepQueue.add("sweep", {}, { repeat: { pattern: "*/15 * * * *" }, jobId: "spoilage-sweep" });
}
