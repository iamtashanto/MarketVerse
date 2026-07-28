import { startServer } from "@/server";
import { logger } from "@/lib/logger";

/** Composition root — web process entrypoint. See docs/BACKEND_ARCHITECTURE.md §2. */
startServer().catch((err) => {
  logger.fatal({ err }, "Failed to start server");
  process.exit(1);
});
