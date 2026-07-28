import { ProductsRepository } from "@/modules/products/products.repository";
import { NotFoundError } from "@/common/errors/AppError";
import { CursorPagination, buildCursorPage } from "@/common/dto/pagination.dto";

export class ProductsService {
  constructor(private readonly productsRepo: ProductsRepository) {}

  async listProducts(pagination: CursorPagination) {
    const rows = await this.productsRepo.list(pagination);
    return buildCursorPage(rows, pagination.limit);
  }

  async getProduct(publicId: string) {
    const product = await this.productsRepo.findActiveByPublicId(publicId);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }
}
