import { useEffect, useRef, useCallback } from 'react';
import { isBrowserTranslating } from '@/utils/dom-safety';

interface UseTranslationSafeFormOptions {
  onTranslationDetected?: () => void;
  preventRefresh?: boolean;
}

/**
 * Hook to make forms safe from browser translation interference
 */
export const useTranslationSafeForm = (options: UseTranslationSafeFormOptions = {}) => {
  const { onTranslationDetected, preventRefresh = true } = options;
  const formRef = useRef<HTMLFormElement>(null);
  const isTranslatingRef = useRef(false);

  // Function to add translation prevention attributes
  const protectFormInputs = useCallback(() => {
    const form = formRef.current;
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.setAttribute('translate', 'no');
      input.setAttribute('data-translate', 'no');
      input.setAttribute('data-notranslate', 'true');
      input.classList.add('notranslate');
      
      // Prevent autocomplete which can conflict with translation
      if (input.tagName === 'INPUT') {
        (input as HTMLInputElement).setAttribute('autocomplete', 'off');
      }
    });
  }, []);

  // Handle input events safely
  const handleInputChange = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    
    if (isBrowserTranslating()) {
      // If translation is active, ensure the input maintains focus
      // and prevent any translation-induced value changes
      setTimeout(() => {
        if (document.activeElement !== target) {
          target.focus();
        }
      }, 0);
    }
  }, []);

  // Setup form protection
  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    // Initial protection
    protectFormInputs();

    // Monitor for new inputs
    const observer = new MutationObserver((mutations) => {
      let shouldProtect = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.matches('input, textarea, select') || 
                  element.querySelector('input, textarea, select')) {
                shouldProtect = true;
              }
            }
          });
        }
      });

      if (shouldProtect) {
        setTimeout(protectFormInputs, 0);
      }
    });

    observer.observe(form, {
      childList: true,
      subtree: true
    });

    // Add input event listeners
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach((input) => {
      input.addEventListener('input', handleInputChange);
      input.addEventListener('change', handleInputChange);
    });

    // Monitor translation status
    const checkTranslation = () => {
      const isCurrentlyTranslating = isBrowserTranslating();
      
      if (isCurrentlyTranslating !== isTranslatingRef.current) {
        isTranslatingRef.current = isCurrentlyTranslating;
        
        if (isCurrentlyTranslating) {
          onTranslationDetected?.();
          protectFormInputs();
        }
      }
    };

    const intervalId = setInterval(checkTranslation, 1000);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
      
      // Remove event listeners
      const currentInputs = form.querySelectorAll('input, textarea, select');
      currentInputs.forEach((input) => {
        input.removeEventListener('input', handleInputChange);
        input.removeEventListener('change', handleInputChange);
      });
    };
  }, [protectFormInputs, handleInputChange, onTranslationDetected]);

  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    if (isBrowserTranslating()) {
      console.warn('Form submitted during browser translation - ensuring data integrity');
      
      // Brief delay to ensure translation doesn't interfere with submission
      e.preventDefault();
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }, 100);
    }
  }, []);

  return {
    formRef,
    handleSubmit,
    protectFormInputs,
    isTranslating: isTranslatingRef.current
  };
};