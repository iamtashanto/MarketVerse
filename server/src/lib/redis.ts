import Redis from "ioredis";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

/**
 * Named client factories, not one global client — see docs/BACKEND_ARCHITECTURE.md §12.
 * All currently point at the same Redis deployment with different key prefixes;
 * splitting onto dedicated instances later is a config change here, not a
 * code change at call sites.
 */
function createClient(keyPrefix: string): Redis {
  const client = new Redis(env.REDIS_URL, {
    keyPrefix,
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });
  client.on("error", (err) => logger.error({ err, keyPrefix }, "Redis client error"));
  return client;
}

export const cacheRedis = createClient("cache:");
export const rateLimitRedis = createClient("rl:");
export const sessionRedis = createClient("session:");
export const lockRedis = createClient("lock:");

/** BullMQ requires its own unprefixed connection (it manages key namespacing itself). */
export const queueRedis = new Redis(env.REDIS_URL, { maxRetriesPerRequest: null });

export async function disconnectRedis(): Promise<void> {
  await Promise.all(
    [cacheRedis, rateLimitRedis, sessionRedis, lockRedis, queueRedis].map((c) => c.quit()),
  );
}
