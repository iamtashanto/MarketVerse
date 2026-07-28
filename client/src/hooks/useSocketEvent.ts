import { useEffect } from "react";
import { getSocket } from "@/services/socket";

/**
 * Subscribes to a server-push event for the lifetime of the component —
 * features use this instead of polling. See docs/BACKEND_ARCHITECTURE.md §11
 * and docs/FRONTEND_ARCHITECTURE.md §10.
 */
export function useSocketEvent<T = unknown>(
  namespace: "/notifications" | "/stores",
  event: string,
  handler: (payload: T) => void,
): void {
  useEffect(() => {
    const socket = getSocket(namespace);
    socket.on(event, handler);
    return () => {
      socket.off(event, handler);
    };
  }, [namespace, event, handler]);
}
