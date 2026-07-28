import { ErrorRequestHandler } from "express";
import { normalizeError } from "@/common/errors/normalizeError";
import { logger } from "@/lib/logger";
import { isProduction } from "@/config/env";

/**
 * Centralized error formatting — the ONLY place a caught error becomes an
 * HTTP response. Must be registered last, after notFound.
 * See docs/BACKEND_ARCHITECTURE.md §17.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const appError = normalizeError(err);

  const logPayload = { err, requestId: req.requestId, path: req.originalUrl, method: req.method };
  if (appError.isOperational) {
    logger.warn(logPayload, appError.message);
  } else {
    logger.error(logPayload, appError.message); // non-operational: paged via log-level alerting
  }

  res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message,
      ...(!isProduction && { details: appError.details }),
      requestId: req.requestId,
    },
  });
};
