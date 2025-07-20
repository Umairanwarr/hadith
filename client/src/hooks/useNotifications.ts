import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPreferences {
  browserNotifications: boolean;
  emailNotifications: boolean;
  reminderMinutes: number[];
}

interface LiveSession {
  id: number;
  title: string;
  scheduledTime: string;
  isLive: boolean;
  instructor: string;
}

export const useNotifications = () => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    browserNotifications: true,
    emailNotifications: false,
    reminderMinutes: [15, 5, 1] // تذكير قبل 15 دقيقة، 5 دقائق، ودقيقة واحدة
  });

  // طلب إذن المتصفح للإشعارات
  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  // إنشاء إشعار متصفح
  const showBrowserNotification = (title: string, options: NotificationOptions = {}) => {
    if (permission === 'granted' && 'Notification' in window) {
      const notification = new Notification(title, {
        icon: '/logo.png',
        badge: '/logo.png',
        dir: 'rtl',
        lang: 'ar',
        requireInteraction: true,
        ...options
      });

      // إغلاق تلقائي بعد 10 ثوانِ
      setTimeout(() => notification.close(), 10000);
      
      return notification;
    }
    return null;
  };

  // حساب الوقت المتبقي للمحاضرة
  const getTimeUntilSession = (scheduledTime: string) => {
    const now = new Date().getTime();
    const sessionTime = new Date(scheduledTime).getTime();
    return sessionTime - now;
  };

  // تحويل الوقت لتنسيق مقروء
  const formatTimeRemaining = (milliseconds: number) => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} ساعة و${minutes % 60} دقيقة`;
    }
    return `${minutes} دقيقة`;
  };

  // تفعيل التذكير لمحاضرة معينة
  const setReminder = (session: LiveSession) => {
    const timeUntilSession = getTimeUntilSession(session.scheduledTime);
    
    // إذا كانت المحاضرة قد بدأت بالفعل أو الوقت سالب
    if (timeUntilSession <= 0) {
      toast({
        title: "المحاضرة بدأت بالفعل!",
        description: `${session.title} مع ${session.instructor}`,
        variant: "destructive",
      });
      return;
    }

    // إضافة تذكير تجريبي فوري للاختبار (بعد 10 ثوانِ)
    setTimeout(() => {
      toast({
        title: "تذكير تجريبي - تعمل التذكيرات!",
        description: `${session.title} - هذا مثال على التذكير`,
        duration: 8000,
      });

      if (preferences.browserNotifications && permission === 'granted') {
        showBrowserNotification(
          "تذكير تجريبي",
          {
            body: `${session.title}\nهذا مثال على التذكير`,
            tag: `test-reminder-${session.id}`,
          }
        );
      }

      playNotificationSound();
    }, 10000); // 10 seconds for testing

    preferences.reminderMinutes.forEach(minutes => {
      const reminderTime = timeUntilSession - (minutes * 60 * 1000);
      
      if (reminderTime > 0) {
        setTimeout(() => {
          // إشعار داخل التطبيق
          toast({
            title: `تذكير: محاضرة خلال ${minutes} دقيقة`,
            description: `${session.title} - ${session.instructor}`,
            duration: 10000,
          });

          // إشعار المتصفح
          if (preferences.browserNotifications) {
            showBrowserNotification(
              `محاضرة خلال ${minutes} دقيقة`,
              {
                body: `${session.title}\nمع ${session.instructor}`,
                tag: `session-${session.id}-${minutes}`,
                data: { sessionId: session.id, minutes }
              }
            );
          }

          // تشغيل صوت تنبيه (اختياري)
          playNotificationSound();
        }, reminderTime);
      }
    });

    // تذكير عند بدء المحاضرة
    setTimeout(() => {
      toast({
        title: "بدأت المحاضرة الآن!",
        description: `${session.title} - انضم الآن`,
        duration: 15000,
      });

      if (preferences.browserNotifications) {
        const notification = showBrowserNotification(
          "بدأت المحاضرة الآن!",
          {
            body: `${session.title}\nاضغط للانضمام`,
            tag: `session-live-${session.id}`,
            data: { sessionId: session.id, action: 'join' }
          }
        );

        // عند النقر على الإشعار، الانتقال للمحاضرة
        if (notification) {
          notification.onclick = () => {
            window.focus();
            window.location.href = '/live-sessions';
            notification.close();
          };
        }
      }
    }, timeUntilSession);

    toast({
      title: "تم تفعيل التذكير",
      description: `سيتم تذكيرك قبل بدء المحاضرة (تذكير تجريبي خلال 10 ثوانِ)`,
    });
  };

  // إلغاء جميع التذكيرات لمحاضرة معينة
  const cancelReminders = (sessionId: number) => {
    // إغلاق الإشعارات المفتوحة
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications({ tag: `session-${sessionId}` })
          .then(notifications => {
            notifications.forEach(notification => notification.close());
          });
      });
    }

    toast({
      title: "تم إلغاء التذكير",
      description: "لن تتلقى تذكيرات لهذه المحاضرة",
    });
  };

  // تشغيل صوت تنبيه
  const playNotificationSound = () => {
    try {
      // إنشاء صوت تنبيه بسيط باستخدام Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // تردد نغمة التنبيه
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      
      // مستوى الصوت
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // تجاهل أخطاء الصوت - ربما المتصفح لا يدعم Web Audio API
    }
  };

  // تحديث إعدادات الإشعارات
  const updatePreferences = (newPrefs: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPrefs }));
    localStorage.setItem('notificationPreferences', JSON.stringify({
      ...preferences,
      ...newPrefs
    }));
  };

  // تحميل الإعدادات المحفوظة
  useEffect(() => {
    const saved = localStorage.getItem('notificationPreferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        // استخدام الإعدادات الافتراضية
      }
    }

    // التحقق من حالة إذن الإشعارات
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // مراقبة المحاضرات المباشرة - يتم استدعاؤها يدوياً عند الحاجة فقط
  const monitorLiveSessions = (sessions: LiveSession[]) => {
    // تجنب الإشعارات المتكررة
    const notifiedSessions = JSON.parse(localStorage.getItem('notifiedSessions') || '[]');
    
    sessions.forEach(session => {
      if (session.isLive && !notifiedSessions.includes(session.id)) {
        // إضافة الجلسة للقائمة المُشعر بها
        notifiedSessions.push(session.id);
        localStorage.setItem('notifiedSessions', JSON.stringify(notifiedSessions));
        
        // إشعار فوري للمحاضرات التي أصبحت مباشرة
        toast({
          title: "محاضرة مباشرة الآن!",
          description: `${session.title} - ${session.instructor}`,
          duration: 10000,
        });

        if (preferences.browserNotifications && permission === 'granted') {
          const notification = showBrowserNotification(
            "محاضرة مباشرة الآن!",
            {
              body: `${session.title}\nاضغط للانضمام`,
              tag: `live-${session.id}`,
              requireInteraction: true
            }
          );

          if (notification) {
            notification.onclick = () => {
              window.focus();
              window.location.href = '/live-sessions';
              notification.close();
            };
          }
        }
      }
    });
  };

  return {
    permission,
    preferences,
    requestPermission,
    setReminder,
    cancelReminders,
    updatePreferences,
    showBrowserNotification,
    monitorLiveSessions,
    getTimeUntilSession,
    formatTimeRemaining
  };
};