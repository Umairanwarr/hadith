import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun, Monitor } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
  };

  return (
    <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
      <button
        onClick={() => handleThemeChange('light')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'light' 
            ? 'bg-blue-500 text-white' 
            : 'bg-white text-gray-600 hover:bg-gray-200'
        }`}
        title="Light Theme"
      >
        <Sun size={16} />
      </button>
      
      <button
        onClick={() => handleThemeChange('dark')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'dark' 
            ? 'bg-blue-500 text-white' 
            : 'bg-white text-gray-600 hover:bg-gray-200'
        }`}
        title="Dark Theme"
      >
        <Moon size={16} />
      </button>
      
      <button
        onClick={() => handleThemeChange('system')}
        className={`p-2 rounded-md transition-colors ${
          theme === 'system' 
            ? 'bg-blue-500 text-white' 
            : 'bg-white text-gray-600 hover:bg-gray-200'
        }`}
        title="System Theme"
      >
        <Monitor size={16} />
      </button>
      
      <span className="text-sm text-gray-600 ml-2">
        {theme === 'system' ? `System (${isDark ? 'Dark' : 'Light'})` : theme}
      </span>
    </div>
  );
}; 