import { z } from "zod";
import { cursorPaginationQuerySchema } from "@/common/dto/pagination.dto";

export const listInventorySchema = z.object({
  params: z.object({ storeId: z.string().uuid() }),
  query: cursorPaginationQuerySchema,
});

export const getInventoryItemSchema = z.object({
  params: z.object({ storeId: z.string().uuid(), productId: z.string().uuid() }),
});

export const updatePriceSchema = z.object({
  params: z.object({ storeId: z.string().uuid(), productId: z.string().uuid() }),
  body: z.object({ price: z.number().positive().max(100000) }),
});

export const restockSchema = z.object({
  params: z.object({ storeId: z.string().uuid(), productId: z.string().uuid() }),
  body: z.object({ quantity: z.number().int().positive().max(10000) }),
});

export type UpdatePriceDto = z.infer<typeof updatePriceSchema>["body"];
export type RestockDto = z.infer<typeof restockSchema>["body"];
