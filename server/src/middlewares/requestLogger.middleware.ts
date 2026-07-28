import pinoHttp from "pino-http";
import { logger } from "@/lib/logger";
import { getCurrentRequestId } from "@/middlewares/requestContext.middleware";

/**
 * HTTP access logging, correlated via the request id set in requestContext.middleware.
 * See docs/BACKEND_ARCHITECTURE.md §16.
 */
export const requestLogger = pinoHttp({
  logger,
  customProps: () => ({ requestId: getCurrentRequestId() }),
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  autoLogging: {
    ignore: (req) => req.url === "/health",
  },
});
