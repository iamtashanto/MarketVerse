import { AsyncLocalStorage } from "node:async_hooks";
import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

interface RequestStore {
  requestId: string;
}

export const requestContextStorage = new AsyncLocalStorage<RequestStore>();

/**
 * Generates a per-request correlation id and makes it available both on
 * `req.requestId` (for handlers) and via AsyncLocalStorage (so the logger
 * can attach it to log lines emitted deep inside a service/repository
 * without threading it through every function signature).
 * See docs/BACKEND_ARCHITECTURE.md §16.
 */
export function requestContext(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers["x-request-id"] as string | undefined) ?? randomUUID();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  requestContextStorage.run({ requestId }, next);
}

export function getCurrentRequestId(): string | undefined {
  return requestContextStorage.getStore()?.requestId;
}
