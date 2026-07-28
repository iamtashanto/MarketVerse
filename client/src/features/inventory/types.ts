/** Mirrors server/src/modules/inventory/inventory.dto.ts (InventoryItemResponseDto). */
export interface InventoryItem {
  productId: string;
  productName: string;
  shelfQuantity: number;
  warehouseQuantity: number;
  price: number;
  reorderThreshold: number;
  updatedAt: string;
}
