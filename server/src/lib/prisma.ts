import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

/**
 * Prisma 7 requires a driver adapter — a bare connection-string option on
 * the PrismaClient constructor no longer exists (confirmed against the
 * generated client's types under prisma@7.9.1; see
 * docs/DATABASE_DESIGN.md §11.1). `@prisma/adapter-pg` wraps `pg`'s
 * connection pool.
 *
 * Two named clients, not one — repositories choose explicitly which to use.
 * See docs/BACKEND_ARCHITECTURE.md §21 "Read replica routing".
 *
 * - `prismaWrite`: primary, via PgBouncer (DATABASE_URL). All writes and any
 *   read that must be immediately consistent (e.g. wallet balance right
 *   after a purchase) go here.
 * - `prismaRead`: read replica connection string (REPLICA_DATABASE_URL).
 *   Defaults to the primary pool so this is a safe no-op until a real
 *   replica is provisioned.
 */
const writeAdapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const readAdapter = new PrismaPg({
  connectionString: process.env.REPLICA_DATABASE_URL ?? env.DATABASE_URL,
});

export const prismaWrite = new PrismaClient({
  adapter: writeAdapter,
  log: [
    { emit: "event", level: "warn" },
    { emit: "event", level: "error" },
  ],
});

export const prismaRead = new PrismaClient({ adapter: readAdapter });

for (const client of [prismaWrite, prismaRead]) {
  client.$on("warn" as never, (e: unknown) => logger.warn({ prisma: e }, "Prisma warning"));
  client.$on("error" as never, (e: unknown) => logger.error({ prisma: e }, "Prisma error"));
}

export async function disconnectPrisma(): Promise<void> {
  await Promise.all([prismaWrite.$disconnect(), prismaRead.$disconnect()]);
}
