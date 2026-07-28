import { Queue } from "bullmq";
import { bullConnection, defaultJobOptions } from "@/jobs/queues/connection";

export interface IapVerificationJobData {
  iapTransactionPublicId: string;
  platform: "WEB" | "IOS" | "ANDROID";
  platformTransactionId: string;
}

/**
 * Calls an external platform API (Apple/Google/Stripe) — must not block the
 * request, must retry on transient failure. Idempotent on
 * `platformTransactionId` via the DB unique constraint (docs/DATABASE_DESIGN.md),
 * so a retried job is safe to run twice. See docs/BACKEND_ARCHITECTURE.md §14.
 */
export const iapVerificationQueue = new Queue<IapVerificationJobData>("iap-verification", {
  connection: bullConnection,
  defaultJobOptions,
});
