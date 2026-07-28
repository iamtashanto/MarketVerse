import { PrismaClient, Store } from "@prisma/client";
import { BaseRepository, SoftDeletableDelegate } from "@/common/repository/base.repository";
import { CursorPagination } from "@/common/dto/pagination.dto";

export class StoresRepository extends BaseRepository<Store> {
  protected readonly delegate: SoftDeletableDelegate;

  constructor(private readonly prisma: PrismaClient) {
    super();
    this.delegate = prisma.store as unknown as SoftDeletableDelegate;
  }

  findByPublicId(publicId: string): Promise<Store | null> {
    return this.prisma.store.findFirst({ where: { publicId, deletedAt: null } });
  }

  findBySlug(slug: string): Promise<Store | null> {
    return this.prisma.store.findFirst({ where: { slug, deletedAt: null } });
  }

  async findByOwner(ownerId: bigint, pagination: CursorPagination): Promise<Store[]> {
    return this.prisma.store.findMany({
      where: { ownerId, deletedAt: null },
      take: pagination.limit + 1, // +1 to detect "has more" for cursor pagination
      ...(pagination.cursor && { cursor: { id: pagination.cursor }, skip: 1 }),
      orderBy: { id: "asc" },
    });
  }

  create(data: { ownerId: bigint; name: string; slug: string }): Promise<Store> {
    return this.prisma.store.create({ data });
  }

  update(id: bigint, data: Partial<Pick<Store, "name">>): Promise<Store> {
    return this.prisma.store.update({ where: { id }, data });
  }
}
