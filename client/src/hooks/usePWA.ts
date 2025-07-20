import { useState, useEffect } from 'react';

interface PWAState {
  isStandalone: boolean;
  canInstall: boolean;
  isOnline: boolean;
  connectionType: string;
}

export const usePWA = (): PWAState => {
  const [pwaState, setPWAState] = useState<PWAState>({
    isStandalone: false,
    canInstall: false,
    isOnline: navigator.onLine,
    connectionType: 'unknown'
  });

  useEffect(() => {
    // التحقق من وضع Standalone
    const checkStandalone = () => {
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      
      setPWAState(prev => ({ ...prev, isStandalone }));
    };

    // التحقق من إمكانية التثبيت
    const handleBeforeInstallPrompt = () => {
      setPWAState(prev => ({ ...prev, canInstall: true }));
    };

    // مراقبة حالة الاتصال
    const handleOnline = () => {
      setPWAState(prev => ({ ...prev, isOnline: true }));
    };

    const handleOffline = () => {
      setPWAState(prev => ({ ...prev, isOnline: false }));
    };

    // الحصول على نوع الاتصال
    const getConnectionType = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;
      
      const type = connection?.effectiveType || 'unknown';
      setPWAState(prev => ({ ...prev, connectionType: type }));
    };

    // تشغيل التحققات الأولية
    checkStandalone();
    getConnectionType();

    // إضافة المستمعين
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return pwaState;
};