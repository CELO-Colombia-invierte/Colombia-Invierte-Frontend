export const cleanupThirdwebBackdrop = () => {
  const selectors = [
    '[data-thirdweb]',
    '[class*="tw-"]',
    '[class*="thirdweb"]',
    'div[style*="backdrop"]',
    'div[style*="position: fixed"]',
  ];

  selectors.forEach((selector) => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        const computedStyle = window.getComputedStyle(element);
        if (
          computedStyle.position === 'fixed' &&
          (computedStyle.zIndex === '999999' ||
           computedStyle.backgroundColor.includes('rgba') ||
           computedStyle.backdropFilter !== 'none')
        ) {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up element with selector:', selector, error);
    }
  });

  document.body.style.overflow = '';
  document.body.style.position = '';
  document.documentElement.style.overflow = '';

  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.style.filter = '';
    rootElement.style.webkitFilter = '';
  }
};
