import { apiService } from '../api';
import { Wallet, AddWalletRequest, UpdateWalletRequest } from '@/types';

class WalletService {
  async addWallet(data: AddWalletRequest): Promise<Wallet> {
    const response = await apiService.post<Wallet>('/me/wallets', data);
    return response.data;
  }

  async getWallets(): Promise<Wallet[]> {
    const response = await apiService.get<Wallet[]>('/me/wallets');
    return response.data;
  }

  async updateWallet(id: string, data: UpdateWalletRequest): Promise<Wallet> {
    const response = await apiService.patch<Wallet>(`/me/wallets/${id}`, data);
    return response.data;
  }
}

export const walletService = new WalletService();
