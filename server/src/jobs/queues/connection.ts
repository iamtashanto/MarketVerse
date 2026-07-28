import { queueRedis } from "@/lib/redis";

/** Shared BullMQ connection — see docs/BACKEND_ARCHITECTURE.md §14. */
export const bullConnection = queueRedis;

export const defaultJobOptions = {
  attempts: 5,
  backoff: { type: "exponential" as const, delay: 2000 },
  removeOnComplete: { age: 3600 },
  removeOnFail: { age: 86400 }, // kept longer than successes for investigation
};
