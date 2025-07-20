import { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

interface TestSession {
  id: number;
  title: string;
  instructor: string;
  scheduledTime: string;
  duration: number;
  isLive: boolean;
  description: string;
  level: string;
}

export function TestRemindersPage() {
  const { toast } = useToast();
  const { setReminder, formatTimeRemaining } = useNotifications();
  
  // جلسات تجريبية مع توقيتات قريبة للاختبار
  const [testSessions, setTestSessions] = useState<TestSession[]>([
    {
      id: 101,
      title: "جلسة تجريبية - تذكير بعد 30 ثانية",
      instructor: "المدرس التجريبي",
      scheduledTime: new Date(Date.now() + 30 * 1000).toISOString(), // 30 seconds
      duration: 60,
      isLive: false,
      description: "جلسة لاختبار التذكير بعد 30 ثانية",
      level: "تجريبي"
    },
    {
      id: 102,
      title: "جلسة تجريبية - تذكير بعد دقيقتين",
      instructor: "المدرس التجريبي",
      scheduledTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(), // 2 minutes
      duration: 90,
      isLive: false,
      description: "جلسة لاختبار التذكير بعد دقيقتين",
      level: "تجريبي"
    },
    {
      id: 103,
      title: "جلسة تجريبية - تذكير بعد 5 دقائق",
      instructor: "المدرس التجريبي",
      scheduledTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      duration: 45,
      isLive: false,
      description: "جلسة لاختبار التذكير بعد 5 دقائق",
      level: "تجريبي"
    }
  ]);

  const quickTestReminder = () => {
    // تذكير فوري للاختبار
    setTimeout(() => {
      toast({
        title: "🔔 تذكير تجريبي فوري!",
        description: "هذا إشعار تجريبي للتأكد من عمل النظام",
        duration: 10000,
      });
    }, 2000); // 2 seconds

    toast({
      title: "تم تشغيل التذكير التجريبي",
      description: "ستتلقى تذكيراً خلال ثانيتين",
    });
  };

  const testBrowserNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const notification = new Notification('إشعار تجريبي', {
          body: 'هذا إشعار تجريبي من المتصفح',
          icon: '/logo.png',
          requireInteraction: false
        });

        // تشغيل صوت
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
          console.log('Audio not supported');
        }

        setTimeout(() => notification.close(), 5000);
        
        toast({
          title: "تم إرسال إشعار المتصفح",
          description: "تحقق من الإشعارات في الزاوية العلوية",
        });
      } else {
        toast({
          title: "تم رفض الإذن",
          description: "يرجى السماح بالإشعارات في إعدادات المتصفح",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="bg-gradient-to-l from-blue-600 to-blue-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-vial text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                  اختبار نظام التذكير
                </h1>
                <p className="text-blue-100 mt-2">
                  جرب واختبر جميع أنواع الإشعارات والتذكيرات
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Tests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">اختبار سريع - إشعار التطبيق</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-4">
                اختبر إشعارات التطبيق الداخلية (ستظهر خلال ثانيتين)
              </p>
              <Button onClick={quickTestReminder} className="bg-green-600 hover:bg-green-700">
                <i className="fas fa-play ml-2"></i>
                اختبر الآن
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="text-purple-800">اختبار إشعار المتصفح</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-purple-700 mb-4">
                اختبر إشعارات سطح المكتب مع الصوت
              </p>
              <Button onClick={testBrowserNotification} className="bg-purple-600 hover:bg-purple-700">
                <i className="fas fa-desktop ml-2"></i>
                اختبر إشعار المتصفح
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Test Sessions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>جلسات تجريبية للاختبار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {testSessions.map((session) => {
                const timeRemaining = session.scheduledTime ? new Date(session.scheduledTime).getTime() - Date.now() : 0;
                const isExpired = timeRemaining <= 0;
                
                return (
                  <Card key={session.id} className={`${isExpired ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-sm font-bold mb-2">{session.title}</CardTitle>
                          <div className="text-xs text-gray-600 mb-1">
                            <i className="fas fa-user ml-1"></i>
                            {session.instructor}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-xs text-gray-600 mb-3">{session.description}</p>
                      
                      <div className="text-xs text-gray-500 mb-3">
                        {isExpired ? (
                          <span className="text-red-600 font-semibold">انتهت</span>
                        ) : (
                          <span className="text-blue-600 font-semibold">
                            متبقي: {Math.floor(timeRemaining / 1000)} ثانية
                          </span>
                        )}
                      </div>
                      
                      <Button 
                        size="sm"
                        onClick={() => setReminder(session)}
                        disabled={isExpired}
                        className={`w-full ${isExpired ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        <i className="fas fa-bell ml-2"></i>
                        {isExpired ? 'انتهت' : 'فعّل التذكير'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <h3 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">
              <i className="fas fa-info-circle"></i>
              تعليمات الاختبار
            </h3>
            
            <div className="space-y-3 text-yellow-700">
              <div className="flex items-start gap-3">
                <span className="bg-yellow-200 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <p className="font-semibold">اختبار إشعارات التطبيق:</p>
                  <p className="text-sm">اضغط "اختبر الآن" وانتظر ثانيتين لرؤية إشعار داخل التطبيق</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="bg-yellow-200 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <p className="font-semibold">اختبار إشعارات المتصفح:</p>
                  <p className="text-sm">اضغط "اختبر إشعار المتصفح" واسمح بالإشعارات عند الطلب</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="bg-yellow-200 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <p className="font-semibold">اختبار تذكيرات الجلسات:</p>
                  <p className="text-sm">اضغط "فعّل التذكير" على أي جلسة وانتظر الوقت المحدد</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}