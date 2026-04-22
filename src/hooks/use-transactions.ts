import { useState, useCallback, useRef } from 'react';
import {
  transactionsService,
  TransactionDto,
} from '@/services/transactions';

const STORAGE_KEY = 'user_transactions';
const TIMESTAMP_KEY = 'user_transactions_fetched_at';
const FRESH_TTL_MS = 30 * 1000;

interface FetchOptions {
  force?: boolean;
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<TransactionDto[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isFetchingRef = useRef(false);

  const fetchTransactions = useCallback(
    async (options: FetchOptions = {}) => {
      if (isFetchingRef.current) return null;

      if (!options.force) {
        const lastFetched = Number(
          localStorage.getItem(TIMESTAMP_KEY) ?? 0,
        );
        if (lastFetched && Date.now() - lastFetched < FRESH_TTL_MS) {
          return null;
        }
      }

      isFetchingRef.current = true;
      const hasCachedData = !!localStorage.getItem(STORAGE_KEY);
      if (!hasCachedData) setIsLoading(true);
      setError(null);
      try {
        const data = await transactionsService.getTransactions();
        setTransactions(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(TIMESTAMP_KEY, String(Date.now()));
        return data;
      } catch (err) {
        const error = err as Error;
        setError(error);
        console.error('Error fetching transactions:', error);
        return null;
      } finally {
        isFetchingRef.current = false;
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
  };
};
