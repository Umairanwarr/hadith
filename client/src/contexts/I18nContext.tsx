import React, { createContext, useReducer, useEffect, ReactNode, useContext } from 'react';
import { translations, defaultLanguage } from '../locales';

interface I18nState {
  currentLanguage: string;
  translations: Record<string, any>;
  isRTL: boolean;
}

interface I18nContextType extends I18nState {
  t: (key: string, params?: Record<string, any>) => string;
  changeLanguage: (language: string) => void;
}

// Initial state
const initialState: I18nState = {
  currentLanguage: defaultLanguage,
  translations: translations[defaultLanguage],
  isRTL: defaultLanguage === 'ar',
};

// Action types
type I18nAction = 
  | { type: 'CHANGE_LANGUAGE'; payload: { language: string } }
  | { type: 'SET_LANGUAGE'; payload: { language: string } };

// Reducer
const i18nReducer = (state: I18nState, action: I18nAction): I18nState => {
  switch (action.type) {
    case 'CHANGE_LANGUAGE':
    case 'SET_LANGUAGE':
      const { language } = action.payload;
      return {
        ...state,
        currentLanguage: language,
        translations: translations[language as keyof typeof translations] || translations[defaultLanguage],
        isRTL: language === 'ar',
      };
    default:
      return state;
  }
};

// Create context
export const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(i18nReducer, initialState);

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && translations[savedLanguage as keyof typeof translations]) {
      dispatch({
        type: 'SET_LANGUAGE',
        payload: { language: savedLanguage },
      });
    }
  }, []);

  // Update document direction when language changes
  useEffect(() => {
    document.documentElement.dir = state.isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = state.currentLanguage;
  }, [state.currentLanguage, state.isRTL]);

  // Change language function
  const changeLanguage = (language: string) => {
    if (!translations[language as keyof typeof translations]) {
      console.warn(`Language ${language} not supported`);
      return;
    }

    dispatch({
      type: 'CHANGE_LANGUAGE',
      payload: { language },
    });

    // Save to localStorage
    localStorage.setItem('preferred-language', language);
  };

  // Translation function with parameter interpolation
  const t = (key: string, params: Record<string, any> = {}) => {
    const keys = key.split('.');
    let value: any = state.translations;

    for (const k of keys) {
      value = value?.[k];
    }

    if (!value) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }

    // Handle parameter interpolation
    let result = value;
    Object.keys(params).forEach((param) => {
      result = result.replace(new RegExp(`{${param}}`, 'g'), params[param]);
    });

    return result;
  };

  const value = {
    ...state,
    t,
    changeLanguage,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

// Hook to use I18n context
export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
