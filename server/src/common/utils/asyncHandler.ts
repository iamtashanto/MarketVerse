import { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Express 5 auto-forwards rejected promises from async handlers to `next()`,
 * but this wrapper is kept as an explicit, enforced convention (see
 * docs/BACKEND_ARCHITECTURE.md §4) — it's what a lint rule checks for, and it
 * keeps the codebase resilient if a handler is ever downgraded to a plain
 * callback style or the app is ever run on Express 4 in a sub-service.
 */
export function asyncHandler<Req extends Request = Request>(
  fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req as Req, res, next).catch(next);
  };
}
