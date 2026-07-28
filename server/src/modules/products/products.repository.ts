import { PrismaClient } from "@prisma/client";

export class ProductsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findActiveByPublicId(publicId: string) {
    return this.prisma.product.findFirst({
      where: { publicId, deletedAt: null, isActive: true },
      include: { category: true },
    });
  }

  findActiveById(id: bigint) {
    return this.prisma.product.findFirst({
      where: { id, deletedAt: null, isActive: true },
      include: { category: true },
    });
  }

  async list(pagination: { cursor?: bigint; limit: number }) {
    return this.prisma.product.findMany({
      where: { deletedAt: null, isActive: true },
      include: { category: true },
      take: pagination.limit + 1,
      ...(pagination.cursor && { cursor: { id: pagination.cursor }, skip: 1 }),
      orderBy: { id: "asc" },
    });
  }
}
