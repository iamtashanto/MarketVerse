import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { Request } from "express";
import { rateLimitRedis } from "@/lib/redis";
import { RateLimitedError } from "@/common/errors/AppError";

/**
 * Redis-backed so limits are consistent across every app instance — a
 * per-process in-memory store is wrong the moment there's more than one
 * instance. See docs/BACKEND_ARCHITECTURE.md §18.
 */
function makeLimiter(windowMs: number, limit: number, keyGenerator?: (req: Request) => string) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      // ioredis's `.call` types its first argument separately from the rest
      // parameter, so a plain `string[]` spread doesn't satisfy it — split
      // off the command name explicitly instead of spreading the whole array.
      sendCommand: (...args: string[]) =>
        rateLimitRedis.call(args[0] as string, ...args.slice(1)) as Promise<never>,
    }),
    keyGenerator: keyGenerator ?? ((req) => req.user?.id.toString() ?? req.ip ?? "anonymous"),
    handler: (_req, _res, next) => next(new RateLimitedError("Too many attempts, try again later")),
  });
}

/** Brute-force resistance on auth endpoints — keyed by IP (pre-authentication). */
export const authLimiter = makeLimiter(15 * 60 * 1000, 5, (req) => req.ip ?? "anonymous");

/** Write-heavy gameplay actions — keyed by authenticated user. */
export const gameplayWriteLimiter = makeLimiter(60 * 1000, 60);

/** Standard authenticated reads. */
export const standardReadLimiter = makeLimiter(60 * 1000, 300);

/** Admin panel routes. */
export const adminLimiter = makeLimiter(60 * 1000, 120);
