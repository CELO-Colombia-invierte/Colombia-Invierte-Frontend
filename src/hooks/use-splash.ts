import { useState, useEffect } from 'react';

interface UseSplashReturn {
  showSplash: boolean;
  showLoading: boolean;
  loadingProgress: number;
  isReady: boolean;
}

export const useSplash = (): UseSplashReturn => {
  const [showSplash, setShowSplash] = useState(true);
  const [showLoading, setShowLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
      setTimeout(() => {
        setShowLoading(true);
      }, 300);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (!showLoading) return;

    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            setShowLoading(false);
            setIsReady(true);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(progressInterval);
  }, [showLoading]);

  return {
    showSplash,
    showLoading,
    loadingProgress,
    isReady,
  };
};

