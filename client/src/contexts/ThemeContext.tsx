import { createContext, useContext, useEffect, useState } from 'react';

export type ColorScheme = 'green' | 'blue' | 'purple' | 'orange' | 'teal';

export interface ColorTheme {
  name: string;
  arabicName: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  bg: string;
  bgDark: string;
  bgLight: string;
  text: string;
  textDark: string;
  border: string;
  accent: string;
  gradient: string;
}

export const colorThemes: Record<ColorScheme, ColorTheme> = {
  green: {
    name: 'Green',
    arabicName: 'أخضر إسلامي',
    primary: 'text-green-700',
    primaryDark: 'text-green-800',
    primaryLight: 'text-green-600',
    bg: 'bg-green-50',
    bgDark: 'bg-green-100',
    bgLight: 'bg-green-25',
    text: 'text-green-700',
    textDark: 'text-green-800',
    border: 'border-green-200',
    accent: 'bg-green-600',
    gradient: 'from-green-600 to-green-800'
  },
  blue: {
    name: 'Blue',
    arabicName: 'أزرق سماوي',
    primary: 'text-blue-700',
    primaryDark: 'text-blue-800',
    primaryLight: 'text-blue-600',
    bg: 'bg-blue-50',
    bgDark: 'bg-blue-100',
    bgLight: 'bg-blue-25',
    text: 'text-blue-700',
    textDark: 'text-blue-800',
    border: 'border-blue-200',
    accent: 'bg-blue-600',
    gradient: 'from-blue-600 to-blue-800'
  },
  purple: {
    name: 'Purple',
    arabicName: 'بنفسجي ملكي',
    primary: 'text-purple-700',
    primaryDark: 'text-purple-800',
    primaryLight: 'text-purple-600',
    bg: 'bg-purple-50',
    bgDark: 'bg-purple-100',
    bgLight: 'bg-purple-25',
    text: 'text-purple-700',
    textDark: 'text-purple-800',
    border: 'border-purple-200',
    accent: 'bg-purple-600',
    gradient: 'from-purple-600 to-purple-800'
  },
  orange: {
    name: 'Orange',
    arabicName: 'برتقالي دافئ',
    primary: 'text-orange-700',
    primaryDark: 'text-orange-800',
    primaryLight: 'text-orange-600',
    bg: 'bg-orange-50',
    bgDark: 'bg-orange-100',
    bgLight: 'bg-orange-25',
    text: 'text-orange-700',
    textDark: 'text-orange-800',
    border: 'border-orange-200',
    accent: 'bg-orange-600',
    gradient: 'from-orange-600 to-orange-800'
  },
  teal: {
    name: 'Teal',
    arabicName: 'أزرق مخضر',
    primary: 'text-teal-700',
    primaryDark: 'text-teal-800',
    primaryLight: 'text-teal-600',
    bg: 'bg-teal-50',
    bgDark: 'bg-teal-100',
    bgLight: 'bg-teal-25',
    text: 'text-teal-700',
    textDark: 'text-teal-800',
    border: 'border-teal-200',
    accent: 'bg-teal-600',
    gradient: 'from-teal-600 to-teal-800'
  }
};

interface ThemeContextType {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  theme: ColorTheme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('colorScheme');
    return (saved as ColorScheme) || 'green';
  });

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);
    localStorage.setItem('colorScheme', scheme);
  };

  const theme = colorThemes[colorScheme];

  useEffect(() => {
    // Apply theme to document root for CSS custom properties
    const root = document.documentElement;
    const themeColors = colorThemes[colorScheme];
    
    // Extract color values for CSS custom properties
    const extractColor = (className: string) => {
      const match = className.match(/(green|blue|purple|orange|teal)-(\d+)/);
      if (match) {
        const [, color, shade] = match;
        return `var(--${color}-${shade})`;
      }
      return className;
    };

    root.style.setProperty('--theme-primary', extractColor(themeColors.primary));
    root.style.setProperty('--theme-bg', extractColor(themeColors.bg));
    root.style.setProperty('--theme-accent', extractColor(themeColors.accent));
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}