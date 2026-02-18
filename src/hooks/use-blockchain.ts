import { useState } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import type { Account } from 'thirdweb/wallets';
import { blockchainService } from '@/services/blockchain.service';
import type { DeployNatilleraParams, DeployTokenizacionParams } from '@/services/blockchain.service';

interface UseBlockchainReturn {
  account: Account | undefined;
  loading: boolean;
  error: string | null;
  approveToken: (tokenAddress: string, spenderAddress: string, amount: bigint) => Promise<string>;
  depositToNatillera: (contractAddress: string, amount: bigint) => Promise<string>;
  buyTokens: (contractAddress: string, amount: bigint) => Promise<string>;
  deployNatillera: (params: DeployNatilleraParams) => Promise<string>;
  deployTokenizacion: (params: DeployTokenizacionParams) => Promise<string>;
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

  const approveToken = async (
    tokenAddress: string,
    spenderAddress: string,
    amount: bigint,
  ): Promise<string> => {
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

  const depositToNatillera = async (
    contractAddress: string,
    amount: bigint,
  ): Promise<string> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.depositToNatillera(account, contractAddress, amount);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const buyTokens = async (
    contractAddress: string,
    amount: bigint,
  ): Promise<string> => {
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

  const deployNatillera = async (params: DeployNatilleraParams): Promise<string> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.deployNatillera(account, params);
    } catch (err) {
      return handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const deployTokenizacion = async (params: DeployTokenizacionParams): Promise<string> => {
    if (!account) throw new Error('Wallet no conectada');
    setLoading(true);
    setError(null);
    try {
      return await blockchainService.deployTokenizacion(account, params);
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
    deployNatillera,
    deployTokenizacion,
    clearError: () => setError(null),
  };
}
