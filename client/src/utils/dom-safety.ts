/**
 * Utility functions to handle DOM conflicts with browser translation services
 */

/**
 * Detects if browser translation is currently active
 */
export const isBrowserTranslating = (): boolean => {
  try {
    // Check for Google Translate indicators
    const hasGoogleTranslate = !!(
      document.querySelector('.goog-te-banner-frame') ||
      document.querySelector('.skiptranslate') ||
      document.querySelector('[class*="goog-te"]') ||
      document.querySelector('iframe[src*="translate.googleapis.com"]')
    );

    // Check for Microsoft Translator indicators
    const hasMicrosoftTranslator = !!(
      document.querySelector('[class*="microsoft-translator"]') ||
      document.querySelector('[data-translator]')
    );

    // Check for generic translation indicators
    const hasGenericTranslation = !!(
      document.documentElement.hasAttribute('translate') ||
      document.querySelector('[translate="yes"]') ||
      document.querySelector('[class*="translate"]') ||
      document.querySelector('[data-translate]')
    );

    // Check if DOM has been modified by translation services
    const hasTranslationModifications = !!(
      document.querySelector('font[style*="vertical-align"]') || // Common translation artifact
      document.querySelector('span[style*="background-color"]') // Translation highlighting
    );

    return hasGoogleTranslate || hasMicrosoftTranslator || hasGenericTranslation || hasTranslationModifications;
  } catch (error) {
    console.warn('Error detecting browser translation:', error);
    return false;
  }
};

/**
 * Safely executes DOM operations that might conflict with browser translation
 */
export const safeDOMOperation = (operation: () => void, fallback?: () => void): void => {
  try {
    if (!isBrowserTranslating()) {
      operation();
    } else {
      console.log('Skipping DOM operation due to active browser translation');
      fallback?.();
    }
  } catch (error) {
    console.warn('DOM operation failed, possibly due to browser translation conflict:', error);
    fallback?.();
  }
};

/**
 * Prevents page refresh during dropdown interactions when browser translation is active
 */
export const preventDropdownTranslationRefresh = (): (() => void) => {
  const handleClick = (e: MouseEvent) => {
    if (isBrowserTranslating()) {
      const target = e.target as Element;
      // Check if click is on dropdown-related elements
      if (target.closest('[role="combobox"]') || 
          target.closest('[role="option"]') || 
          target.closest('[data-radix-select-trigger]') ||
          target.closest('[data-radix-select-content]') ||
          target.closest('[data-radix-select-item]')) {
        
        // Prevent any potential page refresh
        e.stopPropagation();
        
        // Add a small delay to ensure the selection completes
        setTimeout(() => {
          // Re-focus if needed
          if (document.activeElement && document.activeElement !== target) {
            (target as HTMLElement).focus?.();
          }
        }, 50);
      }
    }
  };

  const handleChange = (e: Event) => {
    if (isBrowserTranslating()) {
      const target = e.target as Element;
      if (target.closest('select') || target.hasAttribute('role')) {
        // Prevent translation from interfering with value changes
        e.stopPropagation();
      }
    }
  };

  document.addEventListener('click', handleClick, true);
  document.addEventListener('change', handleChange, true);

  return () => {
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('change', handleChange, true);
  };
};

/**
 * Prevents page refresh during form input when browser translation is active
 */
export const preventTranslationRefresh = (): (() => void) => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isBrowserTranslating()) {
      // Check if this is likely a translation-induced refresh
      const hasActiveInput = document.activeElement && 
        (document.activeElement.tagName === 'INPUT' || 
         document.activeElement.tagName === 'TEXTAREA');
      
      if (hasActiveInput) {
        console.warn('Preventing page refresh during translation input');
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    // Prevent F5 refresh when translation is active and user is typing
    if (e.key === 'F5' && isBrowserTranslating()) {
      const hasActiveInput = document.activeElement && 
        (document.activeElement.tagName === 'INPUT' || 
         document.activeElement.tagName === 'TEXTAREA');
      
      if (hasActiveInput) {
        console.warn('Preventing F5 refresh during translation input');
        e.preventDefault();
      }
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  window.addEventListener('keydown', handleKeyDown);

  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Adds event listeners to detect when browser translation starts/stops
 */
export const setupTranslationDetection = (onTranslationChange?: (isTranslating: boolean) => void): (() => void) => {
  let isCurrentlyTranslating = isBrowserTranslating();
  
  const checkTranslationStatus = () => {
    const newStatus = isBrowserTranslating();
    if (newStatus !== isCurrentlyTranslating) {
      isCurrentlyTranslating = newStatus;
      onTranslationChange?.(newStatus);
    }
  };

  // Use MutationObserver to detect DOM changes that might indicate translation
  const observer = new MutationObserver((mutations) => {
    let shouldCheck = false;
    
    mutations.forEach((mutation) => {
      // Check if translation-related elements were added/removed
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.className?.includes('goog-te') || 
                element.className?.includes('translate') ||
                element.hasAttribute?.('translate')) {
              shouldCheck = true;
            }
          }
        });
      }
      
      // Check if attributes related to translation changed
      if (mutation.type === 'attributes' && 
          (mutation.attributeName === 'translate' || 
           mutation.attributeName === 'lang' ||
           mutation.attributeName === 'dir')) {
        shouldCheck = true;
      }
    });

    if (shouldCheck) {
      setTimeout(checkTranslationStatus, 100); // Debounce
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['translate', 'lang', 'dir', 'class']
  });

  // Also check periodically as a fallback
  const intervalId = setInterval(checkTranslationStatus, 2000);

  // Return cleanup function
  return () => {
    observer.disconnect();
    clearInterval(intervalId);
  };
};