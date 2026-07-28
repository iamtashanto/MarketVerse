import { Router } from "express";
import { UploadsController } from "@/modules/uploads/uploads.controller";
import { UploadsService } from "@/modules/uploads/uploads.service";
import { authenticate } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validate.middleware";
import { gameplayWriteLimiter } from "@/middlewares/rateLimiter.middleware";
import { confirmUploadSchema, presignUploadSchema } from "@/modules/uploads/uploads.validation";

const uploadsService = new UploadsService();
const uploadsController = new UploadsController(uploadsService);

export const uploadsRouter = Router();

uploadsRouter.post(
  "/presign",
  authenticate,
  gameplayWriteLimiter,
  validate(presignUploadSchema),
  uploadsController.presign,
);

uploadsRouter.post(
  "/confirm",
  authenticate,
  gameplayWriteLimiter,
  validate(confirmUploadSchema),
  uploadsController.confirm,
);
