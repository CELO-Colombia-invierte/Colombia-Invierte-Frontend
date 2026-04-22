import { apiService } from '../api';

export type TransactionType =
  | 'QUOTA_PAID'
  | 'VAULT_DEPOSITED'
  | 'VAULT_RELEASED'
  | 'INVESTED'
  | 'REVENUE_CLAIMED'
  | 'NATILLERA_CLAIMED'
  | 'JOINED'
  | 'REFUNDED';

export interface TransactionDto {
  id: string;
  type: TransactionType;
  tx_hash: string;
  block_number: number;
  contract_address: string;
  created_at: string;
  project: { id: string; name: string; type: string } | null;
  amount: string | null;
  counterparty: string | null;
  direction: 'in' | 'out' | 'neutral';
}

class TransactionsService {
  async getTransactions(): Promise<TransactionDto[]> {
    const response = await apiService.get<TransactionDto[]>(
      '/portfolio/transactions',
    );
    return response.data ?? [];
  }
}

export const transactionsService = new TransactionsService();
