import { useContext } from 'react';
import { I18nContext } from '../contexts/I18nContext';

export const useTranslation = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useTranslation must be used within I18nProvider');
  }

  return context;
};

// Additional hooks for common use cases
export const useCurrentLanguage = () => {
  const { currentLanguage } = useTranslation();
  return currentLanguage;
};

export const useIsRTL = () => {
  const { isRTL } = useTranslation();
  return isRTL;
};
