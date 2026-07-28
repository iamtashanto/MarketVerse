import { Prisma } from "@prisma/client";

/** Wallet ledger stores integer minor units (cents); prices/costs are Decimal dollars. */
export function toCents(dollars: Prisma.Decimal | number): bigint {
  const value = typeof dollars === "number" ? dollars : Number(dollars);
  return BigInt(Math.round(value * 100));
}

export function toDollars(cents: bigint): number {
  return Number(cents) / 100;
}
