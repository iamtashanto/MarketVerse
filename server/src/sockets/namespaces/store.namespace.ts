import { Namespace, Server, Socket } from "socket.io";
import { z } from "zod";
import { socketAuthMiddleware } from "@/sockets/socketAuth.middleware";
import { logger } from "@/lib/logger";

const joinStoreSchema = z.object({ storePublicId: z.string().uuid() });

/**
 * Store-visiting presence namespace — rooms are scoped per store
 * (`store:<publicId>`), never a global broadcast. Room membership requests
 * are validated per event, not just at handshake, since a client can send
 * arbitrary event payloads after connecting. See docs/BACKEND_ARCHITECTURE.md §11.
 */
export function registerStoreNamespace(io: Server): Namespace {
  const namespace = io.of("/stores");
  namespace.use(socketAuthMiddleware);

  namespace.on("connection", (socket: Socket) => {
    socket.on("join-store", async (raw: unknown) => {
      const parsed = joinStoreSchema.safeParse(raw);
      if (!parsed.success) return;

      // In the full implementation: verify the store exists and is public
      // before joining (mirrors service-layer ownership checks, §10).
      const room = `store:${parsed.data.storePublicId}`;
      await socket.join(room);
      namespace.to(room).emit("visitor-joined", { socketId: socket.id });
    });

    socket.on("disconnect", () => {
      logger.debug({ socketId: socket.id }, "Client disconnected from /stores");
    });
  });

  return namespace;
}
