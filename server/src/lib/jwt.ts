import jwt, { SignOptions } from "jsonwebtoken";
import { randomBytes, createHash } from "node:crypto";
import { env } from "@/config/env";

// jsonwebtoken types `expiresIn` as a template-literal `StringValue` (from `ms`),
// not a plain `string` — env.JWT_ACCESS_TOKEN_TTL is validated at boot (config/env.ts)
// to be a well-formed duration, so this cast is safe.
const ACCESS_TOKEN_TTL = env.JWT_ACCESS_TOKEN_TTL as SignOptions["expiresIn"];

export function signPlayerAccessToken(userId: bigint, sessionId: bigint): string {
  return jwt.sign({ role: "PLAYER", sessionId: sessionId.toString() }, env.JWT_ACCESS_TOKEN_PRIVATE_KEY, {
    algorithm: "RS256",
    subject: userId.toString(),
    audience: "marketverse:player",
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

/** Raw refresh token returned to the client; only its hash is ever persisted. */
export function generateRefreshToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashRefreshToken(token) };
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function accessTokenTtlSeconds(): number {
  // jsonwebtoken expiresIn accepts "15m" style strings; this mirrors it in seconds for API responses.
  const match = /^(\d+)([smhd])$/.exec(env.JWT_ACCESS_TOKEN_TTL);
  if (!match) return 900;
  const [, amount, unit] = match;
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit as "s" | "m" | "h" | "d"];
  return Number(amount) * multiplier;
}
