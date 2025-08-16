import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { z } from "zod";

// Schema for live session creation
const createLiveSessionSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
  instructor: z.string().min(3, "اسم المدرس مطلوب"),
  courseTitle: z.string().optional(),
  scheduledTime: z.string().min(1, "التوقيت مطلوب"),
  duration: z.string().min(1, "المدة مطلوبة"),
  platform: z.enum(["google-meet", "zoom", "teams"]).default("google-meet"),
  meetingLink: z.string().url("رابط صحيح مطلوب").optional().or(z.literal("")),
  description: z.string().min(10, "الوصف يجب أن يكون 10 أحرف على الأقل"),
  level: z.enum(["مبتدئ", "متوسط", "متقدم"]),
});

type CreateLiveSession = z.infer<typeof createLiveSessionSchema>;

interface LiveSession {
  id: string;
  title: string;
  instructor: string;
  courseTitle?: string;
  scheduledTime: string;
  duration: number;
  isLive: boolean;
  platform?: string;
  meetingLink?: string;
  description: string;
  level: string;
  createdBy?: string;
}

export function ManageLiveSessionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);

  const form = useForm<CreateLiveSession>({
    resolver: zodResolver(createLiveSessionSchema),
    defaultValues: {
      title: "",
      instructor: "",
      courseTitle: "",
      scheduledTime: "",
      duration: "60",
      platform: "google-meet",
      meetingLink: "",
      description: "",
      level: "مبتدئ",
    },
  });

  // Fetch live sessions
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ["api", "live-sessions"],
  });

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (data: CreateLiveSession) => {
      const sessionData = {
        ...data,
        duration: parseInt(data.duration),
        scheduledTime: new Date(data.scheduledTime).toISOString(),
      };
      return apiRequest("POST", "/api/live-sessions", sessionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "live-sessions"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "تم إنشاء الجلسة بنجاح",
        description: "تم إضافة الجلسة المباشرة الجديدة",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء الجلسة",
        description: error.message || "حدث خطأ أثناء إنشاء الجلسة",
        variant: "destructive",
      });
    },
  });

  // Update session mutation
  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateLiveSession> }) => {
      const sessionData = {
        ...data,
        duration: data.duration ? parseInt(data.duration) : undefined,
        scheduledTime: data.scheduledTime ? new Date(data.scheduledTime).toISOString() : undefined,
      };
      return apiRequest("PUT", `/api/live-sessions/${id}`, sessionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "live-sessions"] });
      setEditingSession(null);
      form.reset();
      toast({
        title: "تم تحديث الجلسة",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث الجلسة",
        variant: "destructive",
      });
    },
  });

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest("DELETE", `/api/live-sessions/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "live-sessions"] });
      toast({
        title: "تم حذف الجلسة",
        description: "تم حذف الجلسة المباشرة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message || "حدث خطأ أثناء حذف الجلسة",
        variant: "destructive",
      });
    },
  });

  // Toggle live status mutation
  const toggleLiveStatusMutation = useMutation({
    mutationFn: async ({ sessionId, isLive }: { sessionId: string; isLive: boolean }) => {
      return apiRequest("PATCH", `/api/live-sessions/${sessionId}/live-status`, { isLive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "live-sessions"] });
      toast({
        title: "تم تحديث حالة البث",
        description: "تم تحديث حالة البث المباشر",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث البث",
        description: error.message || "حدث خطأ أثناء تحديث حالة البث",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateLiveSession) => {
    if (editingSession) {
      updateSessionMutation.mutate({ id: editingSession.id, data });
    } else {
      createSessionMutation.mutate(data);
    }
  };

  const handleEdit = (session: LiveSession) => {
    setEditingSession(session);
    const scheduledDate = new Date(session.scheduledTime);
    const localDateTime = new Date(scheduledDate.getTime() - scheduledDate.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    form.reset({
      title: session.title,
      instructor: session.instructor,
      courseTitle: session.courseTitle || "",
      scheduledTime: localDateTime,
      duration: session.duration.toString(),
      platform: (session.platform as "google-meet" | "zoom" | "teams") || "google-meet",
      meetingLink: session.meetingLink || "",
      description: session.description,
      level: session.level as "مبتدئ" | "متوسط" | "متقدم",
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (sessionId: string) => {
    deleteSessionMutation.mutate(sessionId);
  };

  const toggleLiveStatus = (sessionId: string, currentStatus: boolean) => {
    toggleLiveStatusMutation.mutate({ sessionId, isLive: !currentStatus });
  };

  const generateMeetingLink = (platform: 'google-meet' | 'zoom' | 'teams') => {
    const randomId = Math.random().toString(36).substr(2, 10);
    switch (platform) {
      case 'google-meet':
        return `https://meet.google.com/${randomId}`;
      case 'zoom':
        return `https://zoom.us/j/${Math.floor(Math.random() * 1000000000)}`;
      case 'teams':
        return `https://teams.microsoft.com/meet/${randomId}`;
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-green-600 to-green-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-broadcast-tower text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                    إدارة الجلسات المباشرة
                  </h1>
                  <p className="text-green-100 mt-2">
                    إضافة وإدارة وتحديث الجلسات المباشرة والمحاضرات
                  </p>
                </div>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-white text-green-600 hover:bg-green-50"
                    onClick={() => {
                      setEditingSession(null);
                      form.reset();
                    }}
                  >
                    <i className="fas fa-plus ml-2"></i>
                    إضافة جلسة جديدة
                  </Button>
                </DialogTrigger>
                
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSession ? "تحديث الجلسة المباشرة" : "إضافة جلسة مباشرة جديدة"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingSession ? "تحديث بيانات الجلسة المختارة" : "املأ المعلومات لإنشاء جلسة مباشرة جديدة"}
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان الجلسة</FormLabel>
                            <FormControl>
                              <Input placeholder="مثال: مقدمة في علم الحديث" {...field} />
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
                                <Input placeholder="الشيخ أحمد محمد" {...field} />
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
                              <FormLabel>عنوان المادة (اختياري)</FormLabel>
                              <FormControl>
                                <Input placeholder="أصول علم الحديث" {...field} />
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
                              <FormLabel>موعد الجلسة</FormLabel>
                              <FormControl>
                                <Input type="datetime-local" {...field} />
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
                              <FormLabel>المدة (بالدقائق)</FormLabel>
                              <FormControl>
                                <Input type="number" min="15" max="240" placeholder="60" {...field} />
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
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر المستوى" />
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="platform"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>منصة الاجتماع</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="اختر المنصة" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="google-meet">Google Meet</SelectItem>
                                  <SelectItem value="zoom">Zoom</SelectItem>
                                  <SelectItem value="teams">Microsoft Teams</SelectItem>
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
                                <div className="flex gap-2">
                                  <Input 
                                    placeholder="https://meet.google.com/..." 
                                    {...field} 
                                    className="flex-1"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => form.setValue('meetingLink', generateMeetingLink('google-meet'))}
                                  >
                                    Meet
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => form.setValue('meetingLink', generateMeetingLink('zoom'))}
                                  >
                                    Zoom
                                  </Button>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>



                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>وصف الجلسة</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="وصف مفصل عن موضوع الجلسة والمحتوى المتوقع..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-3 pt-4">
                        <Button
                          type="submit"
                          disabled={createSessionMutation.isPending || updateSessionMutation.isPending}
                          className="flex-1"
                        >
                          {(createSessionMutation.isPending || updateSessionMutation.isPending) ? (
                            <>
                              <i className="fas fa-spinner fa-spin ml-2"></i>
                              {editingSession ? "جاري التحديث..." : "جاري الإنشاء..."}
                            </>
                          ) : (
                            <>
                              <i className={`fas ${editingSession ? 'fa-save' : 'fa-plus'} ml-2`}></i>
                              {editingSession ? "حفظ التغييرات" : "إنشاء الجلسة"}
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsCreateDialogOpen(false);
                            setEditingSession(null);
                            form.reset();
                          }}
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

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>جميع الجلسات المباشرة ({sessions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-gray-400 ml-3"></i>
                <span>جاري تحميل الجلسات...</span>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <i className="fas fa-exclamation-triangle text-4xl mb-4"></i>
                <p className="text-lg">خطأ في تحميل الجلسات</p>
                <p className="text-sm mt-2">{error.message}</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-broadcast-tower text-4xl mb-4 text-gray-300"></i>
                <p className="text-lg">لا توجد جلسات مباشرة حتى الآن</p>
                <p className="text-sm mt-2">اضغط على "إضافة جلسة جديدة" لإنشاء أول جلسة</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead>المدرس</TableHead>
                      <TableHead>الموعد</TableHead>
                      <TableHead>المدة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session: LiveSession) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          <div>
                            <div className="font-semibold">{session.title}</div>
                            {session.courseTitle && (
                              <div className="text-sm text-gray-600">{session.courseTitle}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{session.instructor}</TableCell>
                        <TableCell>
                          {format(new Date(session.scheduledTime), "dd/MM/yyyy HH:mm", { locale: ar })}
                        </TableCell>
                        <TableCell>{session.duration} دقيقة</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={session.isLive ? "destructive" : "secondary"}>
                              {session.isLive ? (
                                <>
                                  <div className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></div>
                                  مباشر الآن
                                </>
                              ) : (
                                "مجدول"
                              )}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleLiveStatus(session.id, session.isLive)}
                              disabled={toggleLiveStatusMutation.isPending}
                            >
                              {session.isLive ? "إيقاف البث" : "بدء البث"}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(session)}
                            >
                              <i className="fas fa-edit"></i>
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
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف هذه الجلسة؟ لا يمكن التراجع عن هذا الإجراء.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(session.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    حذف الجلسة
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}