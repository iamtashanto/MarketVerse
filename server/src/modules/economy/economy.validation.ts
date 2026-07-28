import { z } from "zod";

export const walletParamsSchema = z.object({
  params: z.object({ storeId: z.string().uuid() }),
});

export const buySchema = z.object({
  params: z.object({ storeId: z.string().uuid(), productId: z.string().uuid() }),
  body: z.object({ quantity: z.number().int().positive().max(10000) }),
});

export const sellSchema = z.object({
  params: z.object({ storeId: z.string().uuid(), productId: z.string().uuid() }),
  body: z.object({ quantity: z.number().int().positive().max(1000) }),
});

export type BuyDto = z.infer<typeof buySchema>["body"];
export type SellDto = z.infer<typeof sellSchema>["body"];
