import { Prisma, Product, ProductCategory } from "@prisma/client";

export interface ProductResponseDto {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  category: { id: string; name: string; department: string } | null;
  basePrice: number;
  baseCost: number;
  shelfLifeHours: number | null;
  unlockLevel: number;
}

type ProductWithCategory = Product & { category: ProductCategory | null };

export function toProductResponseDto(product: ProductWithCategory): ProductResponseDto {
  return {
    id: product.publicId,
    sku: product.sku,
    name: product.name,
    description: product.description,
    category: product.category
      ? { id: product.category.slug, name: product.category.name, department: product.category.department }
      : null,
    basePrice: toNumber(product.basePrice),
    baseCost: toNumber(product.baseCost),
    shelfLifeHours: product.shelfLifeHours,
    unlockLevel: product.unlockLevel,
  };
}

function toNumber(value: Prisma.Decimal): number {
  return Number(value);
}
