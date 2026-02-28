import { useState, useCallback } from 'react';
import { portfolioService } from '@/services';
import { Portfolio } from '@/models/Portfolio.model';

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(() => {
    const saved = localStorage.getItem('user_portfolio');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPortfolio = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await portfolioService.getPortfolio();
      setPortfolio(data);
      localStorage.setItem('user_portfolio', JSON.stringify(data));
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
