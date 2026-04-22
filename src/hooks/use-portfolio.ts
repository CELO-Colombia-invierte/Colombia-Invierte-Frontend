import { useState, useCallback, useRef } from 'react';
import { portfolioService } from '@/services';
import { Portfolio } from '@/models/Portfolio.model';

const STORAGE_KEY = 'user_portfolio';
const TIMESTAMP_KEY = 'user_portfolio_fetched_at';
const FRESH_TTL_MS = 30 * 1000;

interface FetchOptions {
  force?: boolean;
}

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isFetchingRef = useRef(false);

  const fetchPortfolio = useCallback(async (options: FetchOptions = {}) => {
    if (isFetchingRef.current) return null;

    if (!options.force) {
      const lastFetched = Number(localStorage.getItem(TIMESTAMP_KEY) ?? 0);
      if (lastFetched && Date.now() - lastFetched < FRESH_TTL_MS) {
        return null;
      }
    }

    isFetchingRef.current = true;
    const hasCachedData = !!localStorage.getItem(STORAGE_KEY);
    if (!hasCachedData) setIsLoading(true);
    setError(null);
    try {
      const data = await portfolioService.getPortfolio();
      setPortfolio(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(TIMESTAMP_KEY, String(Date.now()));
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error fetching portfolio:', error);
      return null;
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  return {
    portfolio,
    isLoading,
    error,
    fetchPortfolio,
  };
};
