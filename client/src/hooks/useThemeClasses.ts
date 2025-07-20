import { useTheme } from '@/contexts/ThemeContext';

export function useThemeClasses() {
  const { theme, colorScheme } = useTheme();

  // Helper function to get theme-aware classes
  const getThemeClass = (type: 'primary' | 'bg' | 'bgDark' | 'bgLight' | 'text' | 'textDark' | 'border' | 'accent' | 'gradient') => {
    return theme[type];
  };

  // Common component class combinations
  const classes = {
    // Cards
    card: `bg-white ${theme.border} hover:shadow-lg transition-all`,
    cardHeader: `${theme.bg} ${theme.border}`,
    cardAccent: `${theme.bg} ${theme.border}`,
    
    // Buttons
    primaryButton: `${theme.accent} hover:opacity-90 text-white`,
    outlineButton: `border-2 ${theme.border} ${theme.text} hover:${theme.bg}`,
    ghostButton: `${theme.text} hover:${theme.bg}`,
    
    // Text
    heading: `${theme.primaryDark} font-amiri font-bold`,
    subheading: `${theme.primary} font-amiri`,
    body: `${theme.text}`,
    muted: `text-gray-600`,
    
    // Backgrounds
    pageBg: 'bg-gray-50',
    sectionBg: `${theme.bg}`,
    accentBg: `${theme.bgDark}`,
    
    // Interactive elements
    link: `${theme.primary} hover:${theme.primaryDark} transition-colors`,
    badge: `${theme.bg} ${theme.text}`,
    
    // Gradients
    gradient: `bg-gradient-to-r ${theme.gradient}`,
    gradientText: `bg-gradient-to-r ${theme.gradient} bg-clip-text text-transparent`,
    
    // Borders
    border: theme.border,
    divider: `border-t ${theme.border}`,
    
    // Navigation
    navItem: `${theme.text} hover:${theme.primaryDark} transition-colors`,
    activeNavItem: `${theme.primaryDark} bg-white`,
    
    // Form elements
    input: `border ${theme.border} focus:ring-2 focus:ring-${colorScheme}-500`,
    
    // Status colors (keep consistent across themes)
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
  };

  return {
    theme,
    colorScheme,
    getThemeClass,
    classes
  };
}