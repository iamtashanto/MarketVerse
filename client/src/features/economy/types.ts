/** Mirrors server/src/modules/economy/economy.dto.ts */
export interface Wallet {
  currency: "CASH";
  balance: number;
}

export interface TransactionResult {
  quantity: number;
  unitPrice: number;
  total: number;
  newBalance: number;
}
