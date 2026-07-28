import { Request, Response } from "express";
import { ProductsService } from "@/modules/products/products.service";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { ok } from "@/common/dto/apiResponse.dto";
import { toProductResponseDto } from "@/modules/products/products.dto";
import { CursorPaginationQuery } from "@/common/dto/pagination.dto";

export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  listProducts = asyncHandler(async (req: Request, res: Response) => {
    const { cursor, limit } = req.query as unknown as CursorPaginationQuery;
    const page = await this.productsService.listProducts({
      cursor: cursor ? BigInt(cursor) : undefined,
      limit,
    });
    res.json(ok(page.items.map(toProductResponseDto), { nextCursor: page.nextCursor }));
  });

  getProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.productsService.getProduct(req.params.productId as string);
    res.json(ok(toProductResponseDto(product)));
  });
}
