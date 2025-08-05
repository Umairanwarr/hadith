import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from './theme-toggle';

export const ThemeDemo: React.FC = () => {
  const { theme, isDark, applyThemeToDocument, removeThemeFromDocument } = useTheme();

  const handleApplyTheme = (themeType: 'light' | 'dark') => {
    applyThemeToDocument(themeType);
  };

  const handleRemoveTheme = () => {
    removeThemeFromDocument();
  };

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Theme Control Demo</h3>
      
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Current theme state: <strong>{theme}</strong> 
            {theme === 'system' && ` (${isDark ? 'Dark' : 'Light'})`}
          </p>
        </div>

        <div>
          <ThemeToggle />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Manual Theme Application:</p>
          <div className="flex space-x-2">
            <button
              onClick={() => handleApplyTheme('light')}
              className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
            >
              Apply Light
            </button>
            <button
              onClick={() => handleApplyTheme('dark')}
              className="px-3 py-1 bg-gray-700 text-white rounded text-sm hover:bg-gray-800"
            >
              Apply Dark
            </button>
            <button
              onClick={handleRemoveTheme}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Remove Theme
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          <p>Note: Theme classes are only applied when you manually click the buttons above.</p>
          <p>This prevents conflicts with your existing styling.</p>
        </div>
      </div>
    </div>
  );
}; 