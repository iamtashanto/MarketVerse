/**
 * Generic soft-delete-aware CRUD base — encodes the convention from
 * docs/DATABASE_DESIGN.md §7 exactly once instead of per module.
 *
 * NOTE: Prisma's generated delegate types don't expose a single clean shared
 * interface across models (each delegate's `WhereInput`/`CreateInput` are
 * distinct generated types), so this base is intentionally loosely typed at
 * the delegate boundary and re-tightened by each concrete repository's public
 * method signatures (see modules/stores/stores.repository.ts for the pattern).
 * This is a known, accepted Prisma limitation — not an oversight.
 */
export interface SoftDeletableDelegate {
  findFirst(args: unknown): Promise<unknown>;
  update(args: unknown): Promise<unknown>;
}

export abstract class BaseRepository<TModel extends { id: bigint; deletedAt?: Date | null }> {
  protected abstract readonly delegate: SoftDeletableDelegate;

  async findById(id: bigint): Promise<TModel | null> {
    const row = await this.delegate.findFirst({ where: { id, deletedAt: null } });
    return row as TModel | null;
  }

  async softDelete(id: bigint): Promise<void> {
    await this.delegate.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
