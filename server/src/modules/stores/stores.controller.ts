import { Request, Response } from "express";
import { StoresService } from "@/modules/stores/stores.service";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { ok } from "@/common/dto/apiResponse.dto";
import { toStoreResponseDto } from "@/modules/stores/stores.dto";
import { CreateStoreDto, UpdateStoreDto } from "@/modules/stores/stores.validation";
import { CursorPaginationQuery } from "@/common/dto/pagination.dto";

export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  createStore = asyncHandler(async (req: Request, res: Response) => {
    const store = await this.storesService.createStore(req.user!.id, req.body as CreateStoreDto);
    res.status(201).json(ok(toStoreResponseDto(store)));
  });

  getStore = asyncHandler(async (req: Request, res: Response) => {
    const store = await this.storesService.getStoreByPublicId(req.params.storeId as string);
    res.json(ok(toStoreResponseDto(store)));
  });

  listMyStores = asyncHandler(async (req: Request, res: Response) => {
    const { cursor, limit } = req.query as unknown as CursorPaginationQuery;
    const page = await this.storesService.listMyStores(req.user!.id, {
      cursor: cursor ? BigInt(cursor) : undefined,
      limit,
    });
    res.json(ok(page.items.map(toStoreResponseDto), { nextCursor: page.nextCursor }));
  });

  updateStore = asyncHandler(async (req: Request, res: Response) => {
    const store = await this.storesService.updateStore(
      req.user!.id,
      req.params.storeId as string,
      req.body as UpdateStoreDto,
    );
    res.json(ok(toStoreResponseDto(store)));
  });
}
