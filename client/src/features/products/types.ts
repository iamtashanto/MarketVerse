/** Mirrors server/src/modules/products/products.dto.ts (ProductResponseDto). */
export interface Product {
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
