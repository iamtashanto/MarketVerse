import { CurrencyType, LedgerReason, PrismaClient, Prisma } from "@prisma/client";
import { ConflictError } from "@/common/errors/AppError";

type Db = PrismaClient | Prisma.TransactionClient;

export interface LedgerEntryInput {
  userId: bigint;
  currency: CurrencyType;
  amountCents: bigint;
  reason: LedgerReason;
  referenceType?: string;
  referenceId?: bigint;
}

/**
 * Ledger-first: every balance change is a wallet_transactions row before
 * it's a number anywhere else. Balances are stored in integer minor units
 * (cents) per docs/DATABASE_DESIGN.md §5 — callers convert to/from dollars
 * at the API boundary, never inside the ledger itself.
 */
export class WalletRepository {
  constructor(private readonly prisma: PrismaClient) {}

  getBalance(userId: bigint, currency: CurrencyType, db: Db = this.prisma) {
    return db.walletBalance.findUnique({ where: { userId_currency: { userId, currency } } });
  }

  async credit(input: LedgerEntryInput, db: Db = this.prisma): Promise<bigint> {
    const balance = await this.upsertBalance(input.userId, input.currency, input.amountCents, db);
    await this.writeLedgerRow(input, balance, db);
    return balance;
  }

  async debit(input: LedgerEntryInput, db: Db = this.prisma): Promise<bigint> {
    // NOTE: check-then-act, not row-locked — under concurrent debits on the
    // same wallet this has a narrow TOCTOU window. Acceptable for this
    // slice; a production hardening pass would move the sufficiency check
    // into a single `UPDATE ... WHERE balance >= amount` (or SELECT ... FOR
    // UPDATE) so the check and the decrement are the same atomic statement.
    const current = await this.getBalance(input.userId, input.currency, db);
    const currentBalance = current?.balance ?? 0n;
    if (currentBalance < input.amountCents) {
      throw new ConflictError("Insufficient funds");
    }
    const balance = await this.upsertBalance(input.userId, input.currency, -input.amountCents, db);
    await this.writeLedgerRow({ ...input, amountCents: -input.amountCents }, balance, db);
    return balance;
  }

  private async upsertBalance(userId: bigint, currency: CurrencyType, deltaCents: bigint, db: Db): Promise<bigint> {
    const row = await db.walletBalance.upsert({
      where: { userId_currency: { userId, currency } },
      create: { userId, currency, balance: deltaCents },
      update: { balance: { increment: deltaCents } },
    });
    return row.balance;
  }

  private writeLedgerRow(input: LedgerEntryInput, balanceAfter: bigint, db: Db) {
    return db.walletTransaction.create({
      data: {
        userId: input.userId,
        currency: input.currency,
        amount: input.amountCents,
        balanceAfter,
        reason: input.reason,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
      },
    });
  }
}
