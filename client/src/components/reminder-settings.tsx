import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

interface ReminderSettingsProps {
  onClose?: () => void;
}

export function ReminderSettings({ onClose }: ReminderSettingsProps) {
  const { 
    permission, 
    preferences, 
    requestPermission, 
    updatePreferences 
  } = useNotifications();
  const { toast } = useToast();
  const [localPrefs, setLocalPrefs] = useState(preferences);

  useEffect(() => {
    setLocalPrefs(preferences);
  }, [preferences]);

  const handleBrowserNotificationToggle = async (enabled: boolean) => {
    if (enabled && permission !== 'granted') {
      const result = await requestPermission();
      if (result !== 'granted') {
        toast({
          title: "تم رفض الإذن",
          description: "لا يمكن تفعيل إشعارات المتصفح بدون الإذن",
          variant: "destructive",
        });
        return;
      }
    }
    
    setLocalPrefs(prev => ({ ...prev, browserNotifications: enabled }));
  };

  const handleReminderTimeChange = (index: number, newValue: string) => {
    const newMinutes = parseInt(newValue);
    const newReminderMinutes = [...localPrefs.reminderMinutes];
    newReminderMinutes[index] = newMinutes;
    
    // ترتيب التذكيرات تنازلياً
    newReminderMinutes.sort((a, b) => b - a);
    
    setLocalPrefs(prev => ({ ...prev, reminderMinutes: newReminderMinutes }));
  };

  const addReminderTime = () => {
    if (localPrefs.reminderMinutes.length < 5) {
      setLocalPrefs(prev => ({
        ...prev,
        reminderMinutes: [...prev.reminderMinutes, 10].sort((a, b) => b - a)
      }));
    }
  };

  const removeReminderTime = (index: number) => {
    if (localPrefs.reminderMinutes.length > 1) {
      setLocalPrefs(prev => ({
        ...prev,
        reminderMinutes: prev.reminderMinutes.filter((_, i) => i !== index)
      }));
    }
  };

  const saveSettings = () => {
    updatePreferences(localPrefs);
    toast({
      title: "تم حفظ الإعدادات",
      description: "تم تطبيق إعدادات التذكير الجديدة",
    });
    if (onClose) onClose();
  };

  const resetToDefaults = () => {
    setLocalPrefs({
      browserNotifications: true,
      emailNotifications: false,
      reminderMinutes: [15, 5, 1]
    });
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800">مُفعل</Badge>;
      case 'denied':
        return <Badge variant="destructive">مرفوض</Badge>;
      default:
        return <Badge variant="outline">لم يُطلب بعد</Badge>;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="fas fa-bell text-blue-600"></i>
          إعدادات التذكير
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Browser Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">إشعارات المتصفح</Label>
              <p className="text-sm text-gray-600">
                تلقي إشعارات على سطح المكتب قبل بدء المحاضرات
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getPermissionStatus()}
              <Switch
                checked={localPrefs.browserNotifications}
                onCheckedChange={handleBrowserNotificationToggle}
                disabled={permission === 'denied'}
              />
            </div>
          </div>
          
          {permission === 'denied' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">
                تم رفض إذن الإشعارات. يمكنك تفعيلها من إعدادات المتصفح.
              </p>
            </div>
          )}
        </div>

        {/* Email Notifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">إشعارات البريد الإلكتروني</Label>
              <p className="text-sm text-gray-600">
                إرسال تذكيرات عبر البريد الإلكتروني (قريباً)
              </p>
            </div>
            <Switch
              checked={localPrefs.emailNotifications}
              onCheckedChange={(enabled) => 
                setLocalPrefs(prev => ({ ...prev, emailNotifications: enabled }))
              }
              disabled={true} // معطل مؤقتاً
            />
          </div>
        </div>

        {/* Reminder Times */}
        <div className="space-y-4">
          <div>
            <Label className="text-base font-semibold">أوقات التذكير</Label>
            <p className="text-sm text-gray-600">
              اختر متى تريد تلقي التذكيرات قبل بدء المحاضرة
            </p>
          </div>
          
          <div className="space-y-3">
            {localPrefs.reminderMinutes.map((minutes, index) => (
              <div key={index} className="flex items-center gap-3">
                <Label className="min-w-[80px] text-sm">تذكير {index + 1}:</Label>
                <Select 
                  value={String(minutes)} 
                  onValueChange={(value) => handleReminderTimeChange(index, value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">دقيقة واحدة</SelectItem>
                    <SelectItem value="5">5 دقائق</SelectItem>
                    <SelectItem value="10">10 دقائق</SelectItem>
                    <SelectItem value="15">15 دقيقة</SelectItem>
                    <SelectItem value="30">30 دقيقة</SelectItem>
                    <SelectItem value="60">ساعة واحدة</SelectItem>
                    <SelectItem value="120">ساعتان</SelectItem>
                    <SelectItem value="1440">يوم واحد</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">قبل البدء</span>
                {localPrefs.reminderMinutes.length > 1 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeReminderTime(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          {localPrefs.reminderMinutes.length < 5 && (
            <Button
              variant="outline"
              size="sm"
              onClick={addReminderTime}
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <i className="fas fa-plus ml-2"></i>
              إضافة تذكير آخر
            </Button>
          )}
        </div>

        {/* Test Notification */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-md">
          <Label className="text-base font-semibold">اختبار الإشعارات</Label>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (localPrefs.browserNotifications && permission === 'granted') {
                  const notification = new Notification("إشعار تجريبي", {
                    body: "هذا إشعار تجريبي للتأكد من عمل النظام",
                    icon: '/logo.png',
                    tag: 'test-notification'
                  });
                  
                  // تشغيل صوت تنبيه
                  try {
                    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                    
                    oscillator.start();
                    oscillator.stop(audioContext.currentTime + 0.3);
                  } catch (error) {
                    // تجاهل أخطاء الصوت
                  }
                  
                  setTimeout(() => notification.close(), 3000);
                }
              }}
              disabled={!localPrefs.browserNotifications || permission !== 'granted'}
            >
              <i className="fas fa-bell ml-2"></i>
              اختبار إشعار المتصفح
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                toast({
                  title: "إشعار تجريبي",
                  description: "هذا إشعار تجريبي داخل التطبيق",
                  duration: 5000,
                });
              }}
            >
              <i className="fas fa-info-circle ml-2"></i>
              اختبار إشعار التطبيق
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button onClick={saveSettings} className="flex-1">
            <i className="fas fa-save ml-2"></i>
            حفظ الإعدادات
          </Button>
          
          <Button variant="outline" onClick={resetToDefaults}>
            <i className="fas fa-undo ml-2"></i>
            الإعدادات الافتراضية
          </Button>
          
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          )}
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
            <i className="fas fa-lightbulb"></i>
            نصائح للحصول على أفضل تجربة
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• اسمح للمتصفح بإرسال الإشعارات للحصول على تذكيرات على سطح المكتب</li>
            <li>• اضبط تذكيراً قبل 15 دقيقة للاستعداد للمحاضرة</li>
            <li>• اضبط تذكيراً قبل دقيقة واحدة لتجنب التأخير</li>
            <li>• تأكد من أن صوت الإشعارات مفعل في إعدادات النظام</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}