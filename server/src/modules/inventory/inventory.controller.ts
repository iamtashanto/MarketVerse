import { Request, Response } from "express";
import { InventoryService } from "@/modules/inventory/inventory.service";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { ok } from "@/common/dto/apiResponse.dto";
import { toInventoryItemResponseDto } from "@/modules/inventory/inventory.dto";
import { CursorPaginationQuery } from "@/common/dto/pagination.dto";
import { RestockDto, UpdatePriceDto } from "@/modules/inventory/inventory.validation";

export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  listInventory = asyncHandler(async (req: Request, res: Response) => {
    const { cursor, limit } = req.query as unknown as CursorPaginationQuery;
    const page = await this.inventoryService.listStoreInventory(req.params.storeId as string, {
      cursor: cursor ? BigInt(cursor) : undefined,
      limit,
    });
    res.json(ok(page.items.map(toInventoryItemResponseDto), { nextCursor: page.nextCursor }));
  });

  getInventoryItem = asyncHandler(async (req: Request, res: Response) => {
    const row = await this.inventoryService.getInventoryItem(
      req.params.storeId as string,
      req.params.productId as string,
    );
    res.json(ok(toInventoryItemResponseDto(row)));
  });

  updatePrice = asyncHandler(async (req: Request, res: Response) => {
    const { price } = req.body as UpdatePriceDto;
    await this.inventoryService.updatePrice(
      req.user!.id,
      req.params.storeId as string,
      req.params.productId as string,
      price,
    );
    const row = await this.inventoryService.getInventoryItem(
      req.params.storeId as string,
      req.params.productId as string,
    );
    res.json(ok(toInventoryItemResponseDto(row)));
  });

  restock = asyncHandler(async (req: Request, res: Response) => {
    const { quantity } = req.body as RestockDto;
    const row = await this.inventoryService.restock(
      req.user!.id,
      req.params.storeId as string,
      req.params.productId as string,
      quantity,
    );
    res.json(ok(toInventoryItemResponseDto(row!)));
  });
}
