/**
 * Standalone seed script — deliberately does NOT import server/src/config/env.ts
 * (which validates JWT/S3 vars unrelated to seeding) or server/src/lib/prisma.ts.
 * Run via `npm run db:seed` (wired through prisma.config.ts's `migrations.seed`).
 */
import "dotenv/config";
import { PrismaClient, SupplierTier } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL (or DIRECT_DATABASE_URL) must be set to seed");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function findOrCreateSupplier(name: string, tier: SupplierTier) {
  const existing = await prisma.supplier.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.supplier.create({ data: { name, tier } });
}

async function main(): Promise<void> {
  const grocery = await prisma.productCategory.upsert({
    where: { slug: "dairy" },
    update: {},
    create: { department: "GROCERY", name: "Dairy", slug: "dairy" },
  });

  const bakery = await prisma.productCategory.upsert({
    where: { slug: "bakery-bread" },
    update: {},
    create: { department: "BAKERY", name: "Bread", slug: "bakery-bread" },
  });

  // Supplier has no natural unique key in the schema — find-or-create by name
  // rather than upserting on a guessed id.
  const budget = await findOrCreateSupplier("ValueDairy Co.", "BUDGET");
  const standard = await findOrCreateSupplier("FreshFarms Direct", "STANDARD");

  const milk = await prisma.product.upsert({
    where: { sku: "GRO-DAIRY-MILK-1L" },
    update: {},
    create: {
      categoryId: grocery.id,
      sku: "GRO-DAIRY-MILK-1L",
      name: "Whole Milk 1L",
      description: "Fresh whole milk, 1 liter carton.",
      baseCost: 2.1,
      basePrice: 3.49,
      shelfLifeHours: 168,
      unlockLevel: 1,
    },
  });

  const bread = await prisma.product.upsert({
    where: { sku: "BAK-BREAD-SOURDOUGH" },
    update: {},
    create: {
      categoryId: bakery.id,
      sku: "BAK-BREAD-SOURDOUGH",
      name: "Sourdough Loaf",
      description: "Freshly baked sourdough loaf.",
      baseCost: 2.5,
      basePrice: 4.25,
      shelfLifeHours: 48,
      unlockLevel: 1,
    },
  });

  await Promise.all([
    prisma.productSupplier.upsert({
      where: { productId_supplierId: { productId: milk.id, supplierId: budget.id } },
      update: {},
      create: { productId: milk.id, supplierId: budget.id, cost: 1.95, leadTimeMinutes: 45 },
    }),
    prisma.productSupplier.upsert({
      where: { productId_supplierId: { productId: bread.id, supplierId: standard.id } },
      update: {},
      create: { productId: bread.id, supplierId: standard.id, cost: 2.3, leadTimeMinutes: 20 },
    }),
  ]);

  console.log("Seeded:", { categories: [grocery.name, bakery.name], products: [milk.name, bread.name] });
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
