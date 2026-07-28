import { z } from "zod";

const ALLOWED_CONTENT_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export const presignUploadSchema = z.object({
  body: z.object({
    purpose: z.enum(["AVATAR", "STORE_BRANDING"]),
    contentType: z.enum(ALLOWED_CONTENT_TYPES),
    sizeBytes: z.number().int().positive().max(MAX_SIZE_BYTES),
  }),
});

export const confirmUploadSchema = z.object({
  body: z.object({
    objectKey: z.string().min(1),
  }),
});

export type PresignUploadDto = z.infer<typeof presignUploadSchema>["body"];
export type ConfirmUploadDto = z.infer<typeof confirmUploadSchema>["body"];
