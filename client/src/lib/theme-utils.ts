/**
 * Utility functions for theme management
 */

export const applyTheme = (theme: 'light' | 'dark') => {
  const root = window.document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Apply the new theme
  root.classList.add(theme);
};

export const removeTheme = () => {
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
};

export const getSystemTheme = (): 'light' | 'dark' => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const isDarkMode = (): boolean => {
  return getSystemTheme() === 'dark';
}; 