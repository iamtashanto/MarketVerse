import pino from "pino";
import { env, isProduction } from "@/config/env";

/**
 * Structured JSON logging. See docs/BACKEND_ARCHITECTURE.md §16.
 * Redaction is global and applied here once — never left to per-call-site discipline.
 */
export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "*.password",
      "*.passwordHash",
      "*.refreshToken",
      "*.accessToken",
    ],
    censor: "[REDACTED]",
  },
  transport: isProduction
    ? undefined // production: raw JSON to stdout, shipped by the platform's log agent
    : { target: "pino-pretty", options: { colorize: true, translateTime: "HH:MM:ss" } },
});
