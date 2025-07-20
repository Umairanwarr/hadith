import { useState } from 'react';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme, ColorScheme, colorThemes } from '@/contexts/ThemeContext';
import { useThemeClasses } from '@/hooks/useThemeClasses';

export default function ThemeSettings() {
  const { colorScheme, setColorScheme } = useTheme();
  const { classes } = useThemeClasses();
  const [selectedTheme, setSelectedTheme] = useState<ColorScheme>(colorScheme);

  const handleSaveTheme = () => {
    setColorScheme(selectedTheme);
  };

  const handleResetToDefault = () => {
    setSelectedTheme('green');
    setColorScheme('green');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 mt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-amiri font-bold text-gray-800 mb-4">
            إعدادات الألوان والمظهر
          </h1>
          <p className="text-gray-600">
            اختر نظام الألوان المفضل لك لتخصيص مظهر المنصة التعليمية
          </p>
        </div>

        {/* Current Theme Preview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-amiri">المظهر الحالي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`p-6 rounded-lg ${classes.sectionBg} ${classes.border}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-full ${classes.accent}`}></div>
                <div>
                  <h3 className={`text-lg font-amiri font-bold ${classes.heading}`}>
                    {colorThemes[colorScheme].arabicName}
                  </h3>
                  <p className={classes.body}>
                    {colorThemes[colorScheme].name}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-3 rounded ${classes.bg} ${classes.border}`}>
                  <div className={`text-sm font-bold ${classes.text} mb-1`}>خلفية فاتحة</div>
                  <div className="text-xs text-gray-500">Light Background</div>
                </div>
                <div className={`p-3 rounded ${classes.accentBg} ${classes.border}`}>
                  <div className={`text-sm font-bold ${classes.text} mb-1`}>خلفية مميزة</div>
                  <div className="text-xs text-gray-500">Accent Background</div>
                </div>
                <div className={`p-3 rounded bg-white ${classes.border}`}>
                  <div className={`text-sm font-bold ${classes.primary} mb-1`}>نص أساسي</div>
                  <div className="text-xs text-gray-500">Primary Text</div>
                </div>
                <div className={`p-3 rounded text-white ${classes.accent}`}>
                  <div className="text-sm font-bold mb-1">زر أساسي</div>
                  <div className="text-xs opacity-80">Primary Button</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="font-amiri">اختيار نظام الألوان</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(colorThemes).map(([key, theme]) => {
                const scheme = key as ColorScheme;
                const isSelected = selectedTheme === scheme;
                const isCurrent = colorScheme === scheme;
                
                return (
                  <Card 
                    key={scheme}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
                    }`}
                    onClick={() => setSelectedTheme(scheme)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div className={`w-4 h-4 rounded-full bg-${scheme}-600`}></div>
                            <div className={`w-4 h-4 rounded-full bg-${scheme}-100`}></div>
                            <div className={`w-4 h-4 rounded-full bg-${scheme}-200`}></div>
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
                        
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <Badge variant="secondary" className="text-xs">
                              مُطبق
                            </Badge>
                          )}
                          {isSelected && (
                            <div className="text-blue-600">
                              <i className="fas fa-check-circle"></i>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Theme Preview */}
                      <div className={`p-3 rounded-lg bg-${scheme}-50 border border-${scheme}-200`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-6 h-6 rounded bg-${scheme}-600`}></div>
                          <div className={`text-sm font-amiri font-bold text-${scheme}-800`}>
                            عنوان تجريبي
                          </div>
                        </div>
                        <div className={`text-xs bg-white text-${scheme}-700 p-2 rounded border border-${scheme}-200`}>
                          نص تجريبي لمعاينة الألوان والخطوط في هذا النمط
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleSaveTheme}
            className={`${classes.accent} hover:opacity-90 text-white px-8 py-2`}
            disabled={selectedTheme === colorScheme}
          >
            <i className="fas fa-save ml-2"></i>
            حفظ التغييرات
          </Button>
          
          <Button
            variant="outline"
            onClick={handleResetToDefault}
            className="px-8 py-2"
          >
            <i className="fas fa-undo ml-2"></i>
            استعادة الافتراضي
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="px-8 py-2"
          >
            <i className="fas fa-arrow-right ml-2"></i>
            إلغاء
          </Button>
        </div>

        {/* Usage Tips */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-lightbulb text-blue-600 text-lg"></i>
              </div>
              <div>
                <h3 className="font-amiri font-bold text-blue-800 text-lg mb-3">
                  نصائح للاستخدام
                </h3>
                <ul className="text-blue-700 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-blue-600 text-xs mt-1"></i>
                    يتم حفظ اختيارك تلقائياً في متصفحك
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-blue-600 text-xs mt-1"></i>
                    يمكنك تغيير الألوان في أي وقت من القائمة العلوية
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-blue-600 text-xs mt-1"></i>
                    الألوان تنطبق على جميع صفحات المنصة
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="fas fa-check text-blue-600 text-xs mt-1"></i>
                    اللون الأخضر هو اللون الافتراضي للمنصة
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}