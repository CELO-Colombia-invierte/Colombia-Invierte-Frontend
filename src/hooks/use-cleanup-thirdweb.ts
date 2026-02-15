import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { cleanupThirdwebBackdrop } from '@/utils/cleanup-thirdweb';

export const useCleanupThirdweb = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  useEffect(() => {
    if (isAuthPage) return;

    const observer = new MutationObserver(() => {
      const suspiciousElements = document.querySelectorAll(
        'div[style*="position: fixed"]'
      );
      suspiciousElements.forEach((element) => {
        const style = window.getComputedStyle(element);
        if (
          style.position === 'fixed' &&
          style.zIndex === '999999' &&
          !element.closest('[data-ion-page]') &&
          !element.closest('.ion-page')
        ) {
          setTimeout(() => {
            const stillExists = document.body.contains(element);
            if (stillExists && element.parentNode) {
              element.parentNode.removeChild(element);
            }
          }, 1000);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });


    cleanupThirdwebBackdrop();

    return () => {
      observer.disconnect();
    };
  }, [isAuthPage]);
};
