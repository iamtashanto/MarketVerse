import { Prisma, Product, StoreInventory } from "@prisma/client";

export interface InventoryItemResponseDto {
  productId: string;
  productName: string;
  shelfQuantity: number;
  warehouseQuantity: number;
  price: number;
  reorderThreshold: number;
  updatedAt: string;
}

type InventoryWithProduct = StoreInventory & { product: Product };

export function toInventoryItemResponseDto(row: InventoryWithProduct): InventoryItemResponseDto {
  return {
    productId: row.product.publicId,
    productName: row.product.name,
    shelfQuantity: row.shelfQuantity,
    warehouseQuantity: row.warehouseQuantity,
    price: toNumber(row.price),
    reorderThreshold: row.reorderThreshold,
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toNumber(value: Prisma.Decimal): number {
  return Number(value);
}
