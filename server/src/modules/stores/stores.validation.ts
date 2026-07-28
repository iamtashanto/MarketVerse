import { z } from "zod";
import { cursorPaginationQuerySchema } from "@/common/dto/pagination.dto";

const slugRegex = /^[a-z0-9-]+$/;

export const createStoreSchema = z.object({
  body: z.object({
    name: z.string().trim().min(3).max(40),
    slug: z.string().trim().toLowerCase().min(3).max(40).regex(slugRegex),
  }),
});

export const updateStoreSchema = z.object({
  params: z.object({ storeId: z.string().uuid() }),
  body: z.object({
    name: z.string().trim().min(3).max(40).optional(),
  }),
});

export const getStoreSchema = z.object({
  params: z.object({ storeId: z.string().uuid() }),
});

export const listStoresSchema = z.object({
  query: cursorPaginationQuerySchema,
});

export type CreateStoreDto = z.infer<typeof createStoreSchema>["body"];
export type UpdateStoreDto = z.infer<typeof updateStoreSchema>["body"];
