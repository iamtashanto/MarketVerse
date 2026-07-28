import { Request, Response } from "express";
import { EconomyService } from "@/modules/economy/economy.service";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { ok } from "@/common/dto/apiResponse.dto";
import { BuyDto, SellDto } from "@/modules/economy/economy.validation";

export class EconomyController {
  constructor(private readonly economyService: EconomyService) {}

  getWallet = asyncHandler(async (req: Request, res: Response) => {
    const wallet = await this.economyService.getWallet(req.params.storeId as string);
    res.json(ok(wallet));
  });

  buy = asyncHandler(async (req: Request, res: Response) => {
    const { quantity } = req.body as BuyDto;
    const result = await this.economyService.buyFromSupplier(
      req.user!.id,
      req.params.storeId as string,
      req.params.productId as string,
      quantity,
    );
    res.status(201).json(ok(result));
  });

  sell = asyncHandler(async (req: Request, res: Response) => {
    const { quantity } = req.body as SellDto;
    const result = await this.economyService.sell(
      req.user!.id,
      req.params.storeId as string,
      req.params.productId as string,
      quantity,
    );
    res.status(201).json(ok(result));
  });
}
