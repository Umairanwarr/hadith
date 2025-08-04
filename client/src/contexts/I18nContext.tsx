import React, { createContext, useReducer, useEffect } from 'react';
import { translations, defaultLanguage } from '../locales';

// Initial state
const initialState = {
  currentLanguage: defaultLanguage,
  translations: translations[defaultLanguage],
  isRTL: defaultLanguage === 'ar',
};

// Action types
const I18N_ACTIONS = {
  CHANGE_LANGUAGE: 'CHANGE_LANGUAGE',
  SET_LANGUAGE: 'SET_LANGUAGE',
};

// Reducer
const i18nReducer = (state, action) => {
  switch (action.type) {
    case I18N_ACTIONS.CHANGE_LANGUAGE:
    case I18N_ACTIONS.SET_LANGUAGE:
      const { language } = action.payload;
      return {
        ...state,
        currentLanguage: language,
        translations: translations[language],
        isRTL: language === 'ar',
      };
    default:
      return state;
  }
};

// Create context
export const I18nContext = createContext();

// Provider component
export const I18nProvider = ({ children }) => {
  const [state, dispatch] = useReducer(i18nReducer, initialState);

  // Load saved language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && translations[savedLanguage]) {
      dispatch({
        type: I18N_ACTIONS.SET_LANGUAGE,
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
  const changeLanguage = (language) => {
    if (!translations[language]) {
      console.warn(`Language ${language} not supported`);
      return;
    }

    dispatch({
      type: I18N_ACTIONS.CHANGE_LANGUAGE,
      payload: { language },
    });

    // Save to localStorage
    localStorage.setItem('preferred-language', language);
  };

  // Translation function with parameter interpolation
  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = state.translations;

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
