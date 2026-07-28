import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { sessionRedis } from "@/lib/redis";

interface AccessTokenPayload {
  sub: string;
  role: "PLAYER";
  sessionId: string;
}

/**
 * Auth happens once at handshake, not per-event — an invalid/expired token
 * rejects the connection outright. See docs/BACKEND_ARCHITECTURE.md §11.
 */
export async function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void,
): Promise<void> {
  const token = (socket.handshake.auth?.token as string | undefined) ?? extractCookieToken(socket);
  if (!token) {
    next(new Error("Missing credentials"));
    return;
  }

  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_TOKEN_PUBLIC_KEY, {
      algorithms: ["RS256"],
      audience: "marketverse:player",
    }) as AccessTokenPayload;

    const isRevoked = await sessionRedis.get(`revoked:${payload.sessionId}`);
    if (isRevoked) {
      next(new Error("Session revoked"));
      return;
    }

    socket.data.userId = payload.sub;
    next();
  } catch {
    next(new Error("Invalid or expired token"));
  }
}

function extractCookieToken(socket: Socket): string | null {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return null;
  const match = /accessToken=([^;]+)/.exec(cookieHeader);
  return match ? decodeURIComponent(match[1]!) : null;
}
