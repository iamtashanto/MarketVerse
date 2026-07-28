import { Queue } from "bullmq";
import { bullConnection, defaultJobOptions } from "@/jobs/queues/connection";

export interface NotificationJobData {
  userIds: string[]; // publicId or internal id as string — worker resolves
  type: string;
  payload: Record<string, unknown>;
}

/**
 * High-fan-out events (mission complete, gift received, event start) are
 * drained into socket emits in batches by the worker — never emitted
 * synchronously from the triggering request. See docs/BACKEND_ARCHITECTURE.md §11, §14.
 */
export const notificationQueue = new Queue<NotificationJobData>("notification-fanout", {
  connection: bullConnection,
  defaultJobOptions,
});
