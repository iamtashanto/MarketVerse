import { z } from "zod";
import { cursorPaginationQuerySchema } from "@/common/dto/pagination.dto";

export const listProductsSchema = z.object({
  query: cursorPaginationQuerySchema,
});

export const getProductSchema = z.object({
  params: z.object({ productId: z.string().uuid() }),
});
