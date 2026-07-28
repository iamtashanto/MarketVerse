// Prisma 7 connection config. As of Prisma 7, connection URLs are no longer
// declared in schema.prisma (see prisma/schema.prisma header comment and
// docs/DATABASE_DESIGN.md §11) — Migrate reads them from here instead.
//
// - DATABASE_URL       → pooled connection (PgBouncer, transaction mode). Used
//                         by the app's PrismaClient at runtime.
// - DIRECT_DATABASE_URL → direct, unpooled connection. Used for
//                         `prisma migrate dev` / `prisma migrate deploy`,
//                         since DDL needs session-level features PgBouncer's
//                         transaction pooling doesn't support.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL,
  },
});
