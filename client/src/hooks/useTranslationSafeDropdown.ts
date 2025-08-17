import { useEffect, useCallback } from 'react';
import { isBrowserTranslating } from '@/utils/dom-safety';

interface UseTranslationSafeDropdownOptions {
  onTranslationDetected?: () => void;
  preventRefresh?: boolean;
}

/**
 * Hook to make dropdowns safe from browser translation interference
 */
export const useTranslationSafeDropdown = (options: UseTranslationSafeDropdownOptions = {}) => {
  const { onTranslationDetected, preventRefresh = true } = options;

  // Handle dropdown value changes safely
  const handleValueChange = useCallback((value: string, originalHandler?: (value: string) => void) => {
    if (isBrowserTranslating()) {
      console.log('Dropdown value change during translation, ensuring safety');
      
      // Brief delay to prevent translation conflicts
      setTimeout(() => {
        originalHandler?.(value);
      }, 100);
    } else {
      originalHandler?.(value);
    }
  }, []);

  // Handle dropdown open/close safely
  const handleOpenChange = useCallback((open: boolean, originalHandler?: (open: boolean) => void) => {
    if (isBrowserTranslating() && open) {
      console.log('Dropdown opening during translation, applying safety measures');
      
      // Add protection attributes to dropdown elements
      setTimeout(() => {
        const dropdownElements = document.querySelectorAll('[data-radix-select-content], [role="listbox"], [role="option"]');
        dropdownElements.forEach((element) => {
          element.setAttribute('translate', 'no');
          element.setAttribute('data-translate', 'no');
          element.setAttribute('data-notranslate', 'true');
          element.classList.add('notranslate');
        });
      }, 0);
    }
    
    originalHandler?.(open);
  }, []);

  // Monitor for translation state changes
  useEffect(() => {
    if (!preventRefresh) return;

    let isTranslating = isBrowserTranslating();
    
    const checkTranslation = () => {
      const newTranslatingState = isBrowserTranslating();
      if (newTranslatingState !== isTranslating) {
        isTranslating = newTranslatingState;
        if (newTranslatingState) {
          onTranslationDetected?.();
        }
      }
    };

    const intervalId = setInterval(checkTranslation, 1000);

    // Handle specific dropdown events
    const handleDropdownClick = (e: MouseEvent) => {
      if (isBrowserTranslating()) {
        const target = e.target as Element;
        if (target.closest('[data-radix-select-trigger]') || 
            target.closest('[data-radix-select-item]')) {
          
          // Prevent any unwanted side effects
          e.stopPropagation();
          
          // Ensure the dropdown remains functional
          setTimeout(() => {
            if (target.closest('[data-radix-select-item]')) {
              // For select items, ensure the selection completes
              const selectItem = target.closest('[data-radix-select-item]') as HTMLElement;
              selectItem.click();
            }
          }, 50);
        }
      }
    };

    document.addEventListener('click', handleDropdownClick, true);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('click', handleDropdownClick, true);
    };
  }, [onTranslationDetected, preventRefresh]);

  return {
    handleValueChange,
    handleOpenChange,
    isTranslating: isBrowserTranslating()
  };
};