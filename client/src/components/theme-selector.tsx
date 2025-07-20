import { useState } from 'react';
import { useTheme, ColorScheme, colorThemes } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function ThemeSelector() {
  const { colorScheme, setColorScheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleThemeChange = (scheme: ColorScheme) => {
    setColorScheme(scheme);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 text-gray-600 hover:text-gray-800"
        >
          <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
          <span className="hidden sm:inline">الألوان</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-right font-amiri">
            اختر نظام الألوان المفضل
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-3 mt-4">
          {Object.entries(colorThemes).map(([key, theme]) => {
            const scheme = key as ColorScheme;
            const isActive = colorScheme === scheme;
            
            return (
              <Card 
                key={scheme}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isActive ? 'ring-2 ring-blue-500 shadow-md' : ''
                }`}
                onClick={() => handleThemeChange(scheme)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <div className={`w-4 h-4 rounded-full ${theme.accent.replace('bg-', 'bg-')}`}></div>
                        <div className={`w-4 h-4 rounded-full ${theme.bg.replace('bg-', 'bg-')}`}></div>
                        <div className={`w-4 h-4 rounded-full ${theme.bgDark.replace('bg-', 'bg-')}`}></div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {theme.arabicName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {theme.name}
                        </div>
                      </div>
                    </div>
                    
                    {isActive && (
                      <div className="text-blue-600">
                        <i className="fas fa-check-circle"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* Preview */}
                  <div className="mt-3 p-3 rounded-lg bg-gray-50 border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-6 h-6 rounded ${theme.accent}`}></div>
                      <div className={`text-sm font-amiri font-bold ${theme.primary}`}>
                        عنوان تجريبي
                      </div>
                    </div>
                    <div className={`text-xs ${theme.bg} ${theme.text} p-2 rounded`}>
                      نص تجريبي لمعاينة الألوان
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}