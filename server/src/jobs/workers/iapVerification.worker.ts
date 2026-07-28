import { Worker, Job } from "bullmq";
import { bullConnection } from "@/jobs/queues/connection";
import { IapVerificationJobData } from "@/jobs/queues/iapVerification.queue";
import { logger } from "@/lib/logger";
import { prismaWrite } from "@/lib/prisma";

async function handler(job: Job<IapVerificationJobData>): Promise<void> {
  const { platformTransactionId, platform } = job.data;

  // Idempotency guard: the unique constraint on platform_transaction_id
  // (docs/DATABASE_DESIGN.md) makes a retried job safe — if this receipt was
  // already verified by a previous attempt, there's nothing left to do.
  const existing = await prismaWrite.iapTransaction.findUnique({ where: { platformTransactionId } });
  if (existing?.status === "VERIFIED") {
    logger.info({ platformTransactionId }, "IAP transaction already verified, skipping");
    return;
  }

  // In the full implementation: call the Apple/Google/Stripe server API to
  // verify the receipt, then update the iap_transactions row and credit the
  // wallet inside a single Prisma transaction (mirrors EconomyService.sellProduct
  // in docs/BACKEND_ARCHITECTURE.md §5).
  logger.info({ platformTransactionId, platform }, "Verifying IAP receipt (stub)");
}

export const iapVerificationWorker = new Worker<IapVerificationJobData>("iap-verification", handler, {
  connection: bullConnection,
  concurrency: 5,
});

iapVerificationWorker.on("failed", (job, err) => {
  logger.error({ err, jobId: job?.id }, "iap-verification job failed");
});
