import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReminderSettings } from "@/components/reminder-settings";
import { useNotifications } from "@/hooks/useNotifications";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface LiveSession {
  id: number;
  title: string;
  instructor: string;
  courseTitle: string;
  scheduledTime: string;
  duration: number;
  isLive: boolean;
  meetingLink?: string;
  description: string;
  level: string;
}

export function LiveSessionsPage() {
  // Fetch live sessions from API
  const { data: allSessions = [], isLoading: isLoadingSessions } = useQuery({
    queryKey: ["/api/live-sessions"],
  });

  // Separate live and upcoming sessions
  const liveSessions = allSessions.filter((session: any) => session.isLive);
  const upcomingSessions = allSessions.filter((session: any) => !session.isLive);
  const [selectedSession, setSelectedSession] = useState<LiveSession | null>(null);
  const [reminderSettingsOpen, setReminderSettingsOpen] = useState(false);
  const { 
    setReminder, 
    cancelReminders, 
    monitorLiveSessions, 
    getTimeUntilSession, 
    formatTimeRemaining,
    permission 
  } = useNotifications();

  const joinLiveSession = (session: LiveSession) => {
    if (session.isLive && session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "EEEE، d MMMM yyyy 'في' h:mm a", { locale: ar });
  };

  const getSessionStatus = (session: LiveSession) => {
    if (session.isLive) {
      return (
        <Badge className="bg-red-100 text-red-800 border-red-200 animate-pulse">
          <div className="w-2 h-2 bg-red-600 rounded-full animate-ping ml-1"></div>
          مباشر الآن
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600">
          <i className="fas fa-clock ml-1"></i>
          مجدول
        </Badge>
      );
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "مبتدئ": return "bg-green-100 text-green-800";
      case "متوسط": return "bg-blue-100 text-blue-800";
      case "متقدم": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Monitor live sessions for immediate notifications - only run once on mount
  useEffect(() => {
    // Only monitor initially, avoid infinite loops
    const allSessions = [...liveSessions, ...upcomingSessions];
    const liveSessionsNow = allSessions.filter(s => s.isLive);
    
    if (liveSessionsNow.length > 0) {
      liveSessionsNow.forEach(session => {
        console.log('Live session detected:', session.title);
      });
    }
  }, []);  // Remove dependencies to prevent loops

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-red-600 to-red-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <div className="relative">
                  <i className="fas fa-broadcast-tower text-2xl"></i>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-ping"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                  البث المباشر
                </h1>
                <p className="text-red-100 mt-2">
                  تابع المحاضرات والدروس المباشرة مع أساتذة الجامعة
                </p>
              </div>
            </div>
            
            {/* Live Stats */}
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span>الآن مباشر: {liveSessions.filter(s => s.isLive).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-calendar-alt"></i>
                <span>المجدولة: {liveSessions.filter(s => !s.isLive).length + upcomingSessions.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings Button */}
        <div className="flex justify-end mb-4">
          <Dialog open={reminderSettingsOpen} onOpenChange={setReminderSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                <i className="fas fa-cog ml-2"></i>
                إعدادات التذكير
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>إعدادات التذكير للمحاضرات</DialogTitle>
                <DialogDescription>
                  تخصيص إعدادات الإشعارات والتذكيرات للمحاضرات المباشرة
                </DialogDescription>
              </DialogHeader>
              <ReminderSettings onClose={() => setReminderSettingsOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Live Sessions Tabs */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
              الجلسات الحالية
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <i className="fas fa-calendar-plus"></i>
              القادمة قريباً
            </TabsTrigger>
          </TabsList>
          
          {/* Current Sessions */}
          <TabsContent value="current">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {liveSessions.map((session) => (
                <Card key={session.id} className={`hover-scale ${session.isLive ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{session.title}</CardTitle>
                        <div className="text-sm text-gray-600 mb-2">
                          <i className="fas fa-user ml-1"></i>
                          {session.instructor}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          <i className="fas fa-book ml-1"></i>
                          {session.courseTitle}
                        </div>
                      </div>
                      {getSessionStatus(session)}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getLevelColor(session.level)} variant="outline">
                        {session.level}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-100">
                        <i className="fas fa-clock ml-1"></i>
                        {session.duration} دقيقة
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{session.description}</p>
                    
                    <div className="text-sm text-gray-500 mb-4">
                      <i className="fas fa-calendar ml-1"></i>
                      {formatTime(session.scheduledTime)}
                    </div>
                    
                    <div className="flex gap-2">
                      {session.isLive ? (
                        <Button 
                          onClick={() => joinLiveSession(session)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                        >
                          <i className="fas fa-video ml-2"></i>
                          انضم للبث المباشر
                        </Button>
                      ) : (
                        <div className="flex gap-2 flex-1">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            disabled
                          >
                            <i className="fas fa-clock ml-2"></i>
                            في انتظار البدء
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setReminder(session)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            title="تفعيل التذكير"
                          >
                            <i className="fas fa-bell"></i>
                          </Button>
                        </div>
                      )}
                      
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSession(session)}
                      >
                        <i className="fas fa-info-circle"></i>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {liveSessions.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <i className="fas fa-broadcast-tower text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    لا توجد جلسات مباشرة حالياً
                  </h3>
                  <p className="text-gray-500">
                    تابع القسم التالي لمعرفة الجلسات المجدولة قريباً
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          {/* Upcoming Sessions */}
          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingSessions.map((session) => (
                <Card key={session.id} className="hover-scale border-blue-200 bg-blue-50">
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{session.title}</CardTitle>
                        <div className="text-sm text-gray-600 mb-2">
                          <i className="fas fa-user ml-1"></i>
                          {session.instructor}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          <i className="fas fa-book ml-1"></i>
                          {session.courseTitle}
                        </div>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                        <i className="fas fa-calendar ml-1"></i>
                        قريباً
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge className={getLevelColor(session.level)} variant="outline">
                        {session.level}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-100">
                        <i className="fas fa-clock ml-1"></i>
                        {session.duration} دقيقة
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4">{session.description}</p>
                    
                    <div className="text-sm text-blue-700 font-semibold mb-4 bg-blue-100 p-2 rounded">
                      <i className="fas fa-calendar ml-1"></i>
                      {formatTime(session.scheduledTime)}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => setReminder(session)}
                      >
                        <i className="fas fa-bell ml-2"></i>
                        تذكيري
                      </Button>
                      
                      <Button 
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSession(session)}
                      >
                        <i className="fas fa-info-circle"></i>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Help Section */}
        <Card className="mt-8 border-green-200 bg-green-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-question-circle text-green-600 text-xl"></i>
              </div>
              <div>
                <h3 className="font-amiri font-bold text-lg text-green-800">
                  كيفية المشاركة في البث المباشر
                </h3>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-green-700 mb-2">الجلسات المباشرة</h4>
                <ul className="text-sm text-green-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    تظهر بعلامة "مباشر الآن"
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-mouse-pointer text-xs"></i>
                    اضغط "انضم للبث المباشر" للدخول
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-external-link-alt text-xs"></i>
                    ستنفتح نافذة جديدة (Google Meet أو Zoom)
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-bold text-blue-700 mb-2">الجلسات المجدولة</h4>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li className="flex items-center gap-2">
                    <i className="fas fa-calendar text-xs"></i>
                    تظهر مع موعد البدء
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-bell text-xs"></i>
                    يمكنك تفعيل التذكير
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-clock text-xs"></i>
                    ستصبح نشطة عند الموعد المحدد
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
      
      {/* Session Details Modal would go here */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{selectedSession.title}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedSession(null)}
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">المدرس</h4>
                  <p className="text-gray-600">{selectedSession.instructor}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">المادة</h4>
                  <p className="text-gray-600">{selectedSession.courseTitle}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">الوصف</h4>
                  <p className="text-gray-600">{selectedSession.description}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">التوقيت</h4>
                  <p className="text-gray-600">{formatTime(selectedSession.scheduledTime)}</p>
                </div>
                
                <div className="flex gap-2 pt-4">
                  {selectedSession.isLive ? (
                    <Button 
                      onClick={() => {
                        joinLiveSession(selectedSession);
                        setSelectedSession(null);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <i className="fas fa-video ml-2"></i>
                      انضم للبث
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      <i className="fas fa-clock ml-2"></i>
                      في انتظار البدء
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}