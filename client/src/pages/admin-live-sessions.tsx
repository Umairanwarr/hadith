import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Schema for live session creation
const createLiveSessionSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
  instructor: z.string().min(3, "اسم المدرس مطلوب"),
  courseTitle: z.string().min(3, "عنوان المادة مطلوب"),
  scheduledTime: z.string().min(1, "التوقيت مطلوب"),
  duration: z.number().min(15, "المدة يجب أن تكون 15 دقيقة على الأقل"),
  meetingLink: z.string().url("رابط صحيح مطلوب").optional(),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  level: z.enum(["مبتدئ", "متوسط", "متقدم"]),
  platform: z.enum(["google-meet", "zoom", "teams"]),
});

type CreateLiveSession = z.infer<typeof createLiveSessionSchema>;

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
  platform: string;
}

// Mock data - in real app this would come from API
const mockSessions: LiveSession[] = [
  {
    id: 1,
    title: "مقدمة في علم الحديث - المحاضرة الأولى",
    instructor: "الشيخ أحمد محمد الزهري",
    courseTitle: "أصول علم الحديث",
    scheduledTime: "2025-01-20T19:00:00Z",
    duration: 90,
    isLive: true,
    meetingLink: "https://meet.google.com/abc-defg-hij",
    description: "مقدمة شاملة في علم الحديث وتاريخه وأهميته في العلوم الشرعية",
    level: "مبتدئ",
    platform: "google-meet"
  },
  {
    id: 2,
    title: "ورشة عملية في تخريج الأحاديث",
    instructor: "الدكتور أحمد الفقيه",
    courseTitle: "تخريج الأحاديث",
    scheduledTime: "2025-01-22T19:30:00Z",
    duration: 120,
    isLive: false,
    meetingLink: "https://zoom.us/j/123456789",
    description: "ورشة عملية تطبيقية لتعلم طرق تخريج الأحاديث من المصادر الأصلية",
    level: "متقدم",
    platform: "zoom"
  }
];

export function AdminLiveSessionsPage() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<LiveSession[]>(mockSessions);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const form = useForm<CreateLiveSession>({
    resolver: zodResolver(createLiveSessionSchema),
    defaultValues: {
      title: "",
      instructor: "",
      courseTitle: "",
      scheduledTime: "",
      duration: 60,
      meetingLink: "",
      description: "",
      level: "مبتدئ",
      platform: "google-meet",
    },
  });

  const onSubmit = (data: CreateLiveSession) => {
    const newSession: LiveSession = {
      id: Date.now(),
      ...data,
      isLive: false,
    };
    
    setSessions(prev => [...prev, newSession]);
    setIsCreateOpen(false);
    form.reset();
    
    toast({
      title: "تم إنشاء الجلسة بنجاح",
      description: "تم إضافة الجلسة الجديدة لجدول البث المباشر",
    });
  };

  const toggleLiveStatus = (sessionId: number) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, isLive: !session.isLive }
        : session
    ));
    
    const session = sessions.find(s => s.id === sessionId);
    toast({
      title: session?.isLive ? "تم إيقاف البث" : "تم بدء البث",
      description: session?.isLive ? "الجلسة متوقفة الآن" : "الجلسة مباشرة الآن",
    });
  };

  const deleteSession = (sessionId: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الجلسة؟")) {
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast({
        title: "تم حذف الجلسة",
        description: "تم حذف الجلسة من الجدول",
      });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "google-meet": return "fab fa-google";
      case "zoom": return "fas fa-video";
      case "teams": return "fab fa-microsoft";
      default: return "fas fa-video";
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case "google-meet": return "bg-green-100 text-green-800";
      case "zoom": return "bg-blue-100 text-blue-800";
      case "teams": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const generateMeetingLink = (platform: string) => {
    switch (platform) {
      case "google-meet":
        const meetId = Math.random().toString(36).substring(2, 5) + "-" + 
                      Math.random().toString(36).substring(2, 6) + "-" + 
                      Math.random().toString(36).substring(2, 5);
        return `https://meet.google.com/${meetId}`;
      case "zoom":
        const meetingId = Math.floor(Math.random() * 900000000) + 100000000;
        return `https://zoom.us/j/${meetingId}`;
      case "teams":
        return "https://teams.microsoft.com/l/meetup-join/...";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-red-600 to-red-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-broadcast-tower text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                    إدارة البث المباشر
                  </h1>
                  <p className="text-red-100 mt-2">
                    إنشاء وإدارة الجلسات المباشرة والمجدولة
                  </p>
                </div>
              </div>
              
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                    <i className="fas fa-plus ml-2"></i>
                    إنشاء جلسة مباشرة
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إنشاء جلسة مباشرة جديدة</DialogTitle>
                    <DialogDescription>
                      أضف جلسة مباشرة جديدة للطلاب مع رابط الاجتماع
                    </DialogDescription>
                  </DialogHeader>
                  
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان الجلسة</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="مثال: شرح الحديث الأول من الأربعين النووية" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="instructor"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>اسم المدرس</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="الشيخ محمد أحمد" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="courseTitle"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المادة الدراسية</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="أصول علم الحديث" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="scheduledTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>التاريخ والوقت</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="datetime-local"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="duration"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المدة (دقيقة)</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number"
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="level"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>المستوى</FormLabel>
                              <Select value={field.value} onValueChange={field.onChange}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                                  <SelectItem value="متوسط">متوسط</SelectItem>
                                  <SelectItem value="متقدم">متقدم</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="platform"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>منصة البث</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Auto-generate meeting link based on platform
                                const link = generateMeetingLink(value);
                                form.setValue("meetingLink", link);
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="google-meet">
                                  <div className="flex items-center gap-2">
                                    <i className="fab fa-google"></i>
                                    Google Meet
                                  </div>
                                </SelectItem>
                                <SelectItem value="zoom">
                                  <div className="flex items-center gap-2">
                                    <i className="fas fa-video"></i>
                                    Zoom
                                  </div>
                                </SelectItem>
                                <SelectItem value="teams">
                                  <div className="flex items-center gap-2">
                                    <i className="fab fa-microsoft"></i>
                                    Microsoft Teams
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="meetingLink"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رابط الاجتماع</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="سيتم إنشاؤه تلقائياً أو أدخل رابطاً مخصصاً"
                                dir="ltr"
                              />
                            </FormControl>
                            <div className="text-xs text-gray-500">
                              سيتم إنشاء الرابط تلقائياً حسب المنصة المختارة
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>وصف الجلسة</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field} 
                                placeholder="وصف تفصيلي لمحتوى الجلسة..."
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex gap-3 pt-4">
                        <Button type="submit" className="flex-1">
                          <i className="fas fa-plus ml-2"></i>
                          إنشاء الجلسة
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCreateOpen(false)}
                        >
                          إلغاء
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Sessions Management */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="all">جميع الجلسات</TabsTrigger>
            <TabsTrigger value="live">المباشرة</TabsTrigger>
            <TabsTrigger value="scheduled">المجدولة</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="grid grid-cols-1 gap-6">
              {sessions.map((session) => (
                <Card key={session.id} className={session.isLive ? 'border-red-200 bg-red-50' : 'border-gray-200'}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 mb-2">
                          {session.title}
                          {session.isLive && (
                            <Badge className="bg-red-100 text-red-800 animate-pulse">
                              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping ml-1"></div>
                              مباشر
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span><i className="fas fa-user ml-1"></i>{session.instructor}</span>
                          <span><i className="fas fa-book ml-1"></i>{session.courseTitle}</span>
                          <span><i className="fas fa-clock ml-1"></i>{session.duration} دقيقة</span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge className={`${getPlatformColor(session.platform)}`}>
                            <i className={`${getPlatformIcon(session.platform)} ml-1`}></i>
                            {session.platform === 'google-meet' ? 'Google Meet' : 
                             session.platform === 'zoom' ? 'Zoom' : 'Teams'}
                          </Badge>
                          <Badge variant="outline">
                            {session.level}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={session.isLive ? "destructive" : "default"}
                          onClick={() => toggleLiveStatus(session.id)}
                          className={session.isLive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                        >
                          {session.isLive ? (
                            <>
                              <i className="fas fa-stop ml-1"></i>
                              إيقاف البث
                            </>
                          ) : (
                            <>
                              <i className="fas fa-play ml-1"></i>
                              بدء البث
                            </>
                          )}
                        </Button>
                        
                        {session.meetingLink && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(session.meetingLink, '_blank')}
                          >
                            <i className="fas fa-external-link-alt"></i>
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteSession(session.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">{session.description}</p>
                    <div className="text-sm text-gray-500">
                      <i className="fas fa-calendar ml-1"></i>
                      {new Date(session.scheduledTime).toLocaleString('ar-EG')}
                    </div>
                    
                    {session.meetingLink && (
                      <div className="mt-3 p-2 bg-gray-100 rounded text-sm">
                        <span className="font-semibold">رابط الاجتماع: </span>
                        <a 
                          href={session.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                          dir="ltr"
                        >
                          {session.meetingLink}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="live">
            <div className="grid grid-cols-1 gap-6">
              {sessions.filter(s => s.isLive).map((session) => (
                <Card key={session.id} className="border-red-200 bg-red-50">
                  {/* Same content as above but filtered */}
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{session.title}</h3>
                    <p className="text-gray-600">{session.description}</p>
                  </CardContent>
                </Card>
              ))}
              {sessions.filter(s => s.isLive).length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <i className="fas fa-broadcast-tower text-4xl text-gray-400 mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">
                      لا توجد جلسات مباشرة حالياً
                    </h3>
                    <p className="text-gray-500">
                      اضغط "بدء البث" على أي جلسة لجعلها مباشرة
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="scheduled">
            <div className="grid grid-cols-1 gap-6">
              {sessions.filter(s => !s.isLive).map((session) => (
                <Card key={session.id} className="border-blue-200 bg-blue-50">
                  {/* Same content as above but filtered */}
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-2">{session.title}</h3>
                    <p className="text-gray-600">{session.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}