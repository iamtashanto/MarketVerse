import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { UnauthorizedError } from "@/common/errors/AppError";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { sessionRedis } from "@/lib/redis";
import { AuthenticatedUser } from "@/common/types/express";

interface AccessTokenPayload {
  sub: string; // user.id (bigint as string)
  role: "PLAYER";
  sessionId: string;
}

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice("Bearer ".length);
  return req.cookies?.accessToken ?? null;
}

/**
 * Verifies a player access token. See docs/BACKEND_ARCHITECTURE.md §9.
 * Admin auth uses a structurally separate audience/key — see authenticateAdmin below —
 * so a player token can never be mistaken for an admin token.
 */
export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractToken(req);
  if (!token) throw new UnauthorizedError("Missing credentials");

  let payload: AccessTokenPayload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_TOKEN_PUBLIC_KEY, {
      algorithms: ["RS256"],
      audience: "marketverse:player",
    }) as AccessTokenPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }

  const isRevoked = await sessionRedis.get(`revoked:${payload.sessionId}`);
  if (isRevoked) throw new UnauthorizedError("Session revoked");

  const user: AuthenticatedUser = { id: BigInt(payload.sub), role: "PLAYER" };
  req.user = user;
  next();
});

/** Optional auth: attaches req.user if a valid token is present, never throws. */
export const authenticateOptional = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) return next();
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_TOKEN_PUBLIC_KEY, {
        algorithms: ["RS256"],
        audience: "marketverse:player",
      }) as AccessTokenPayload;
      req.user = { id: BigInt(payload.sub), role: "PLAYER" };
    } catch {
      // Not authenticated — proceed anonymously rather than failing.
    }
    next();
  },
);

interface AdminTokenPayload {
  sub: string;
  role: "ADMIN";
  adminRole: "SUPPORT" | "MODERATOR" | "ECONOMY_MANAGER" | "SUPERADMIN";
}

export const authenticateAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) throw new UnauthorizedError("Missing admin credentials");
    let payload: AdminTokenPayload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_TOKEN_PUBLIC_KEY, {
        algorithms: ["RS256"],
        audience: "marketverse:admin", // distinct audience — rejects any player token outright
      }) as AdminTokenPayload;
    } catch {
      throw new UnauthorizedError("Invalid or expired admin token");
    }
    req.user = { id: BigInt(payload.sub), role: "ADMIN", adminRole: payload.adminRole };
    next();
  },
);
