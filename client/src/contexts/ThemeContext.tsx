import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  applyThemeToDocument: (theme: 'light' | 'dark') => void;
  removeThemeFromDocument: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Get theme from localStorage or default to light (not system to avoid conflicts)
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'light';
  });

  const [isDark, setIsDark] = useState(false);

  // Apply theme to document - only when explicitly set
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Only apply theme classes if theme is explicitly set (not system)
    if (theme !== 'system') {
      // Remove existing theme classes
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      setIsDark(theme === 'dark');
    } else {
      // For system theme, don't apply classes automatically
      // Let the user explicitly choose when to apply system theme
      setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Listen for system theme changes - only update state, don't apply classes
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      const handleChange = (e: MediaQueryListEvent) => {
        // Only update the state, don't apply classes automatically
        setIsDark(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const applyThemeToDocument = (theme: 'light' | 'dark') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  };

  const removeThemeFromDocument = () => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
  };

  const value: ThemeContextType = {
    theme,
    setTheme,
    isDark,
    applyThemeToDocument,
    removeThemeFromDocument,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 