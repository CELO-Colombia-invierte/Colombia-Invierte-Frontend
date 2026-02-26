import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import type { Account } from 'thirdweb/wallets';
import { blockchainService } from '@/services/blockchain.service';
import type {
  DeployNatilleraV2Params,
  DeployTokenizacionV2Params,
  V2ContractAddresses,
} from '@/services/blockchain.service';

interface UseBlockchainReturn {
  account: Account | undefined;
  loading: boolean;
  error: string | null;
  approveToken: (tokenAddress: string, spenderAddress: string, amount: bigint) => Promise<string>;
  depositToNatillera: (contractAddress: string) => Promise<string>;
  buyTokens: (contractAddress: string, amount: bigint) => Promise<string>;
  deployNatilleraV2: (params: DeployNatilleraV2Params) => Promise<V2ContractAddresses>;
  deployTokenizacionV2: (params: DeployTokenizacionV2Params) => Promise<V2ContractAddresses>;
  investInProject: (revenueAddress: string, vaultAddress: string, amount: bigint) => Promise<string>;
  claimRendimientos: (revenueAddress: string) => Promise<string>;
  joinNatilleraOnChain: (natilleraAddress: string) => Promise<string>;
  payQuota: (natilleraAddress: string, vaultAddress: string, monthId: bigint, amount: bigint) => Promise<string>;
  claimFinalNatillera: (natilleraAddress: string) => Promise<string>;
  clearError: () => void;
}

export function useBlockchain(): UseBlockchainReturn {
  const account = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (err: unknown): never => {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    setError(message);
    throw err;
  };

  const approveToken = async (tokenAddress: string, spenderAddress: string, amount: bigint): Promise<string> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.approveToken(account, tokenAddress, spenderAddress, amount);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const depositToNatillera = async (contractAddress: string): Promise<string> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.depositToNatillera(account, contractAddress);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const buyTokens = async (contractAddress: string, amount: bigint): Promise<string> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.buyTokens(account, contractAddress, amount);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const deployNatilleraV2 = async (params: DeployNatilleraV2Params): Promise<V2ContractAddresses> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.deployNatilleraV2(account, params);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const deployTokenizacionV2 = async (params: DeployTokenizacionV2Params): Promise<V2ContractAddresses> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.deployTokenizacionV2(account, params);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const investInProject = async (revenueAddress: string, vaultAddress: string, amount: bigint): Promise<string> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.investInProject(account, revenueAddress, vaultAddress, amount);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const claimRendimientos = async (revenueAddress: string): Promise<string> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.claimRendimientos(account, revenueAddress);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const joinNatilleraOnChain = async (natilleraAddress: string): Promise<string> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.joinNatilleraOnChain(account, natilleraAddress);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const payQuota = async (natilleraAddress: string, vaultAddress: string, monthId: bigint, amount: bigint): Promise<string> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.payQuota(account, natilleraAddress, vaultAddress, monthId, amount);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const claimFinalNatillera = async (natilleraAddress: string): Promise<string> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.claimFinalNatillera(account, natilleraAddress);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return {
    account,
    loading,
    error,
    approveToken,
    depositToNatillera,
    buyTokens,
    deployNatilleraV2,
    deployTokenizacionV2,
    investInProject,
    claimRendimientos,
    joinNatilleraOnChain,
    payQuota,
    claimFinalNatillera,
    clearError: () => setError(null),
  };
}
