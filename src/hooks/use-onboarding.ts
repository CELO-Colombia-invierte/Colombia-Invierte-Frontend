import { useState, useEffect } from 'react';
import { storageService } from '@/services/storage';

const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkOnboarding = () => {
      const completed = storageService.getItem(ONBOARDING_COMPLETED_KEY);
      setShowOnboarding(!completed);
      setIsLoading(false);
    };

    checkOnboarding();
  }, []);

  const completeOnboarding = () => {
    storageService.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    setShowOnboarding(false);
  };

  return {
    showOnboarding,
    isLoading,
    completeOnboarding,
  };
};

