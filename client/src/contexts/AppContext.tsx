import React, { ReactNode } from 'react';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './ThemeContext';
import { NotificationProvider } from './NotificationContext';
import { LoadingProvider } from './LoadingContext';
import { I18nProvider } from './I18nContext';

interface AppContextProviderProps {
  children: ReactNode;
}

export const AppContextProvider: React.FC<AppContextProviderProps> = ({ children }) => {
  return (
    <I18nProvider>
      <NotificationProvider>
        <LoadingProvider>
          <AuthProvider>
            <ThemeProvider>
              {children}
            </ThemeProvider>
          </AuthProvider>
        </LoadingProvider>
      </NotificationProvider>
    </I18nProvider>
  );
}; 