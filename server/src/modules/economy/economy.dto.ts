export interface WalletResponseDto {
  currency: "CASH";
  balance: number;
}

export interface TransactionResultDto {
  quantity: number;
  unitPrice: number;
  total: number;
  newBalance: number;
}
