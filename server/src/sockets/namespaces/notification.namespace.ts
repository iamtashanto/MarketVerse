import { Namespace, Server } from "socket.io";
import { socketAuthMiddleware } from "@/sockets/socketAuth.middleware";
import { logger } from "@/lib/logger";

/**
 * Personal-notification namespace — every connection joins exactly one room,
 * `user:<id>`, derived server-side from the authenticated token, never from
 * client-sent input. See docs/BACKEND_ARCHITECTURE.md §11.
 */
export function registerNotificationNamespace(io: Server): Namespace {
  const namespace = io.of("/notifications");
  namespace.use(socketAuthMiddleware);

  namespace.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    void socket.join(`user:${userId}`);
    logger.debug({ userId, socketId: socket.id }, "Client connected to /notifications");

    socket.on("disconnect", () => {
      logger.debug({ userId, socketId: socket.id }, "Client disconnected from /notifications");
    });
  });

  return namespace;
}
