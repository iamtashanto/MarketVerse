import { NextFunction, Request, Response } from "express";
import { NotFoundError } from "@/common/errors/AppError";

/** Registered after all routes, before errorHandler — catches unmatched routes. */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`No route matches ${req.method} ${req.originalUrl}`));
}
