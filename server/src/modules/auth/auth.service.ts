import argon2 from "argon2";
import { AuthRepository } from "@/modules/auth/auth.repository";
import { ConflictError, UnauthorizedError } from "@/common/errors/AppError";
import { LoginDto, RegisterDto } from "@/modules/auth/auth.validation";
import { AuthResponseDto, toAuthUserResponseDto } from "@/modules/auth/auth.dto";
import { accessTokenTtlSeconds, generateRefreshToken, hashRefreshToken, signPlayerAccessToken } from "@/lib/jwt";
import { env } from "@/config/env";
import { sessionRedis } from "@/lib/redis";
import { logger } from "@/lib/logger";

interface RequestMeta {
  ipAddress?: string;
  userAgent?: string;
}

export class AuthService {
  constructor(private readonly authRepo: AuthRepository) {}

  async register(dto: RegisterDto, meta: RequestMeta): Promise<AuthResponseDto> {
    const [existingEmail, existingUsername] = await Promise.all([
      this.authRepo.findActiveUserByEmail(dto.email),
      this.authRepo.findActiveUserByUsername(dto.username),
    ]);
    if (existingEmail) throw new ConflictError("Email already registered");
    if (existingUsername) throw new ConflictError("Username already taken");

    const passwordHash = await argon2.hash(dto.password, { type: argon2.argon2id });
    const user = await this.authRepo.createUser({
      email: dto.email,
      username: dto.username,
      passwordHash,
    });

    const tokens = await this.issueSession(user.id, meta);
    return { user: toAuthUserResponseDto(user), tokens };
  }

  async login(dto: LoginDto, meta: RequestMeta): Promise<AuthResponseDto> {
    const user = await this.authRepo.findActiveUserByEmail(dto.email);
    // Constant-shape response whether or not the user exists — avoids user enumeration.
    const passwordHash = user?.passwordHash ?? (await argon2.hash("dummy-to-equalize-timing"));
    const valid = await argon2.verify(passwordHash, dto.password).catch(() => false);

    if (!user || !valid) throw new UnauthorizedError("Invalid email or password");

    await this.authRepo.touchLastLogin(user.id);
    const tokens = await this.issueSession(user.id, meta);
    return { user: toAuthUserResponseDto(user), tokens };
  }

  /**
   * Refresh-token rotation with reuse detection (docs/BACKEND_ARCHITECTURE.md §9):
   * the presented token is looked up by its hash; if the matching session is
   * already revoked, this is a replay of a stolen/rotated-away token — every
   * session for the user is revoked immediately.
   */
  async refresh(refreshToken: string, sessionId: bigint, meta: RequestMeta): Promise<AuthResponseDto> {
    const session = await this.authRepo.findSessionById(sessionId);
    const presentedHash = hashRefreshToken(refreshToken);

    if (!session || session.refreshTokenHash !== presentedHash) {
      throw new UnauthorizedError("Invalid refresh token");
    }
    if (session.expiresAt < new Date()) {
      throw new UnauthorizedError("Refresh token expired");
    }

    const user = await this.authRepo.findActiveUserById(session.userId);
    if (!user) throw new UnauthorizedError("Account no longer active");

    await this.authRepo.revokeSession(session.id);
    const tokens = await this.issueSession(user.id, meta);
    return { user: toAuthUserResponseDto(user), tokens };
  }

  async logout(sessionId: bigint): Promise<void> {
    const session = await this.authRepo.revokeSession(sessionId).catch(() => null);
    if (session) {
      await sessionRedis.set(`revoked:${session.id}`, "1", "EX", 60 * 60 * 24); // covers any still-valid access token
    }
  }

  /** Reuse-detection trigger — called if a revoked session's refresh token is presented again. */
  async revokeAllSessions(userId: bigint): Promise<void> {
    logger.warn({ userId: userId.toString() }, "Refresh token reuse detected — revoking all sessions");
    await this.authRepo.revokeAllSessionsForUser(userId);
  }

  private async issueSession(userId: bigint, meta: RequestMeta) {
    const { token: refreshToken, hash } = generateRefreshToken();
    const expiresAt = new Date(Date.now() + env.JWT_REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    const session = await this.authRepo.createSession({
      userId,
      refreshTokenHash: hash,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      expiresAt,
    });

    return {
      accessToken: signPlayerAccessToken(userId, session.id),
      refreshToken,
      sessionId: session.id.toString(),
      expiresIn: accessTokenTtlSeconds(),
    };
  }
}
