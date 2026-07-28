import { Request, Response } from "express";
import { UploadsService } from "@/modules/uploads/uploads.service";
import { asyncHandler } from "@/common/utils/asyncHandler";
import { ok } from "@/common/dto/apiResponse.dto";
import { ConfirmUploadDto, PresignUploadDto } from "@/modules/uploads/uploads.validation";

export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  presign = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.uploadsService.createPresignedUpload(req.user!.id, req.body as PresignUploadDto);
    res.json(ok(result));
  });

  confirm = asyncHandler(async (req: Request, res: Response) => {
    const { objectKey } = req.body as ConfirmUploadDto;
    const result = await this.uploadsService.confirmUpload(req.user!.id, objectKey);
    res.json(ok(result));
  });
}
