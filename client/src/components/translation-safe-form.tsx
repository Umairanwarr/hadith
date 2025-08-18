import React, { useEffect, useRef } from 'react';
import { isBrowserTranslating } from '@/utils/dom-safety';

interface TranslationSafeFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onTranslationDetected?: () => void;
}

/**
 * A form wrapper that prevents browser translation from interfering with form inputs
 */
export const TranslationSafeForm: React.FC<TranslationSafeFormProps> = ({
  children,
  onTranslationDetected,
  ...formProps
}) => {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    // Add translation prevention attributes to all form inputs
    const addTranslationAttributes = () => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        input.setAttribute('translate', 'no');
        input.setAttribute('data-translate', 'no');
        input.setAttribute('data-notranslate', 'true');
        // Add class that translation services typically skip
        input.classList.add('notranslate');
      });
    };

    // Initial setup
    addTranslationAttributes();

    // Re-apply attributes when new inputs are added
    const observer = new MutationObserver((mutations) => {
      let shouldReapply = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.matches('input, textarea, select') || 
                  element.querySelector('input, textarea, select')) {
                shouldReapply = true;
              }
            }
          });
        }
      });

      if (shouldReapply) {
        setTimeout(addTranslationAttributes, 0);
      }
    });

    observer.observe(form, {
      childList: true,
      subtree: true
    });

    // Check for translation conflicts periodically
    const checkTranslation = () => {
      if (isBrowserTranslating()) {
        onTranslationDetected?.();
        // Re-apply protection attributes
        addTranslationAttributes();
      }
    };

    const intervalId = setInterval(checkTranslation, 1000);

    return () => {
      observer.disconnect();
      clearInterval(intervalId);
    };
  }, [onTranslationDetected]);

  // Handle form submission with translation safety
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission to stop page refresh

    // Check if translation is interfering
    if (isBrowserTranslating()) {
      console.warn('Form submission attempted during browser translation - this may cause issues');
    }

    // Call original onSubmit if provided
    if (formProps.onSubmit) {
      formProps.onSubmit(e);
    }
  };

  return (
    <form
      {...formProps}
      ref={formRef}
      onSubmit={handleSubmit}
      // Form-level translation prevention
      translate="no"
      data-translate="no"
      data-notranslate="true"
      className={`notranslate ${formProps.className || ''}`}
    >
      {children}
    </form>
  );
};
