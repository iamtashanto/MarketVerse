import { cacheRedis, lockRedis } from "@/lib/redis";
import { logger } from "@/lib/logger";

const LOCK_TTL_SECONDS = 5;
const LOCK_RETRY_DELAY_MS = 50;
const MAX_LOCK_RETRIES = 20;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Cache-aside with stampede protection. Never used for financial data
 * (wallet balances/transactions always read straight from Postgres).
 * See docs/BACKEND_ARCHITECTURE.md §13.
 */
export async function wrap<T>(
  key: string,
  ttlSeconds: number,
  fn: () => Promise<T>,
  attempt = 0,
): Promise<T> {
  const cached = await cacheRedis.get(key);
  if (cached) return JSON.parse(cached) as T;

  const lockKey = `wrap:${key}`;
  const acquired = await lockRedis.set(lockKey, "1", "EX", LOCK_TTL_SECONDS, "NX");

  if (!acquired) {
    if (attempt >= MAX_LOCK_RETRIES) {
      logger.warn({ key }, "Cache stampede lock exceeded max retries, computing directly");
      return fn();
    }
    await sleep(LOCK_RETRY_DELAY_MS);
    return wrap(key, ttlSeconds, fn, attempt + 1);
  }

  try {
    const value = await fn();
    await cacheRedis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    return value;
  } finally {
    await lockRedis.del(lockKey);
  }
}

export async function invalidate(...keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  await cacheRedis.del(...keys);
}
