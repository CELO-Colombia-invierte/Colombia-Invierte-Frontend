import { useState, useCallback } from 'react';
import { portfolioService } from '@/services';
import { Portfolio } from '@/models/Portfolio.model';

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPortfolio = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await portfolioService.getPortfolio();
      setPortfolio(data);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Error fetching portfolio:', error);
      // No relanzar el error para evitar que la UI se rompa
      return null;
    } finally {
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
