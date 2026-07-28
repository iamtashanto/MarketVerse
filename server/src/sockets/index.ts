import { Server as HttpServer } from "node:http";
import { Namespace, Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { env } from "@/config/env";
import { registerNotificationNamespace } from "@/sockets/namespaces/notification.namespace";
import { registerStoreNamespace } from "@/sockets/namespaces/store.namespace";
import { logger } from "@/lib/logger";

let ioServer: Server | null = null;
let notificationNamespace: Namespace | null = null;

/**
 * Redis adapter fans events out across every app instance — required the
 * moment there's more than one instance, and removes the need for
 * load-balancer sticky sessions on the WebSocket upgrade path.
 * See docs/BACKEND_ARCHITECTURE.md §11, §21.
 */
export async function initSockets(httpServer: HttpServer): Promise<Server> {
  const io = new Server(httpServer, {
    cors: { origin: env.CORS_ALLOWED_ORIGINS, credentials: true },
  });

  const pubClient = new Redis(env.REDIS_URL);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  notificationNamespace = registerNotificationNamespace(io);
  registerStoreNamespace(io);

  ioServer = io;
  logger.info("Socket.IO initialized with Redis adapter");
  return io;
}

export function getNotificationNamespace(): Namespace {
  if (!notificationNamespace) throw new Error("Sockets not initialized yet");
  return notificationNamespace;
}

export function getIoServer(): Server {
  if (!ioServer) throw new Error("Sockets not initialized yet");
  return ioServer;
}
