import { PrismaClient, User, UserSession } from "@prisma/client";

export class AuthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findActiveUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { email, deletedAt: null } });
  }

  findActiveUserByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { username, deletedAt: null } });
  }

  findActiveUserById(id: bigint): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  createUser(data: { email: string; username: string; passwordHash: string }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  createSession(data: {
    userId: bigint;
    refreshTokenHash: string;
    deviceId?: bigint;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }): Promise<UserSession> {
    return this.prisma.userSession.create({ data });
  }

  findSessionById(id: bigint): Promise<UserSession | null> {
    return this.prisma.userSession.findFirst({ where: { id, revokedAt: null } });
  }

  revokeSession(id: bigint): Promise<UserSession> {
    return this.prisma.userSession.update({ where: { id }, data: { revokedAt: new Date() } });
  }

  revokeAllSessionsForUser(userId: bigint): Promise<{ count: number }> {
    return this.prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  touchLastLogin(userId: bigint): Promise<User> {
    return this.prisma.user.update({ where: { id: userId }, data: { lastLoginAt: new Date() } });
  }
}
