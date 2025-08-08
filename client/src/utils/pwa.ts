// PWA Utilities
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully:', registration);
      
      // التحقق من التحديثات
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // يوجد تحديث جديد
              // لا نقوم بإجبار إعادة التحميل أثناء التطوير لتفادي إعادة تحميل المدخلات
              if (import.meta.env.PROD) {
                showUpdateAvailableNotification();
              }
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }
};

// إظهار إشعار التحديث
const showUpdateAvailableNotification = () => {
  if (confirm('يوجد تحديث جديد للتطبيق. هل تريد تحديثه الآن؟')) {
    window.location.reload();
  }
};

// طلب إذن الإشعارات
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else {
      console.log('Notification permission denied');
      return false;
    }
  }
  return false;
};

// إرسال إشعار
export const showNotification = (title: string, options?: NotificationOptions) => {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body: options?.body || 'إشعار من جامعة الإمام الزُّهري',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        dir: 'rtl',
        lang: 'ar',
        tag: 'university-notification',
        ...options
      });
    });
  }
};

// التحقق من إمكانية التثبيت
export const checkInstallPrompt = () => {
  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // إظهار زر التثبيت
    showInstallButton(deferredPrompt);
  });

  return deferredPrompt;
};

// إظهار زر التثبيت
const showInstallButton = (deferredPrompt: any) => {
  const installButton = document.createElement('button');
  installButton.textContent = 'تثبيت التطبيق';
  installButton.className = 'pwa-install-button';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #16a34a;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px 20px;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(22, 163, 74, 0.3);
    z-index: 1000;
  `;

  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      deferredPrompt = null;
      installButton.remove();
    }
  });

  document.body.appendChild(installButton);
};

// التحقق من وضع Standalone
export const isStandalone = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
};

// الحصول على معلومات الاتصال
export const getConnectionInfo = () => {
  const connection = (navigator as any).connection || 
                    (navigator as any).mozConnection || 
                    (navigator as any).webkitConnection;
  
  return {
    online: navigator.onLine,
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 0,
    rtt: connection?.rtt || 0
  };
};