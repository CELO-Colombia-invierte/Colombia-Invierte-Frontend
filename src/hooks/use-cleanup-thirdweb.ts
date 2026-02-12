import { useEffect } from 'react';
import { cleanupThirdwebBackdrop } from '@/utils/cleanup-thirdweb';

export const useCleanupThirdweb = () => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const suspiciousElements = document.querySelectorAll('div[style*="position: fixed"]');
      suspiciousElements.forEach((element) => {
        const style = window.getComputedStyle(element);
        if (
          style.position === 'fixed' &&
          style.zIndex === '999999' &&
          !element.closest('[data-ion-page]') &&
          !element.closest('.ion-page')
        ) {
          const hasThirdwebContent = element.querySelector('[data-thirdweb]') ||
                                      element.className.includes('tw-') ||
                                      element.className.includes('thirdweb');

          if (!hasThirdwebContent) {
            setTimeout(() => {
              const stillExists = document.body.contains(element);
              if (stillExists && element.parentNode) {
                element.parentNode.removeChild(element);
              }
            }, 1000);
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const intervalId = setInterval(() => {
      cleanupThirdwebBackdrop();
    }, 2000);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, []);
};
