import { Worker, Job } from "bullmq";
import { bullConnection } from "@/jobs/queues/connection";
import { NotificationJobData } from "@/jobs/queues/notification.queue";
import { logger } from "@/lib/logger";
import { getNotificationNamespace } from "@/sockets";

const BATCH_SIZE = 200;

async function handler(job: Job<NotificationJobData>): Promise<void> {
  const { userIds, type, payload } = job.data;
  const namespace = getNotificationNamespace();

  for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
    const batch = userIds.slice(i, i + BATCH_SIZE);
    for (const userId of batch) {
      namespace.to(`user:${userId}`).emit("notification", { type, payload });
    }
    // Yield between batches so this doesn't monopolize the event loop on huge fan-outs.
    await new Promise((resolve) => setImmediate(resolve));
  }
}

export const notificationWorker = new Worker<NotificationJobData>("notification-fanout", handler, {
  connection: bullConnection,
  concurrency: 5,
});

notificationWorker.on("failed", (job, err) => {
  logger.error({ err, jobId: job?.id }, "notification-fanout job failed");
});
