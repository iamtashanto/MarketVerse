import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

/**
 * One lazily-created socket connection per namespace, matching the backend's
 * namespace layout (docs/BACKEND_ARCHITECTURE.md §11). Auth is via the same
 * httpOnly cookie the REST API uses — Socket.IO's `withCredentials` sends it
 * automatically on the handshake, no manual token juggling on the client.
 */
const namespaceSockets = new Map<string, Socket>();

export function getSocket(namespace: "/notifications" | "/stores"): Socket {
  const existing = namespaceSockets.get(namespace);
  if (existing) return existing;

  const socket = io(`${SOCKET_URL}${namespace}`, {
    withCredentials: true,
    autoConnect: true,
    transports: ["websocket"],
  });
  namespaceSockets.set(namespace, socket);
  return socket;
}

export function disconnectAllSockets(): void {
  for (const socket of namespaceSockets.values()) socket.disconnect();
  namespaceSockets.clear();
}
