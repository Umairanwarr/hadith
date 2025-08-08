import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ArrowRight, Video, Plus, Edit, Trash2, Upload, Play, Clock, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createLessonSchema, type CreateLesson } from "@shared/schema";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration: number;
  totalLessons: number;
  isActive: boolean;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  order: number;
  isActive: boolean;
  courseId: number;
}

export default function AdminCourseDetails() {
  const [, params] = useRoute("/admin/courses/:id");
  const courseId = parseInt(params?.id || "0");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["/courses", courseId],
    retry: false,
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ["/courses", courseId, "lessons"],
    retry: false,
  });

  const lessonForm = useForm<CreateLesson>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      duration: 0,
      courseId: courseId,
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (data: CreateLesson) => {
      return await apiRequest("/api/admin/lessons", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة الدرس بنجاح",
        description: "تم إضافة الدرس الجديد إلى المادة",
      });
      queryClient.invalidateQueries({ queryKey: ["/courses", courseId, "lessons"] });
      setIsAddLessonOpen(false);
      lessonForm.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ في إضافة الدرس",
        description: "فشل في إضافة الدرس. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      await apiRequest(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({
        title: "تم حذف الدرس بنجاح",
        description: "تم حذف الدرس من المادة",
      });
      queryClient.invalidateQueries({ queryKey: ["/courses", courseId, "lessons"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ في الحذف",
        description: "فشل في حذف الدرس. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const onSubmitLesson = (data: CreateLesson) => {
    createLessonMutation.mutate({
      ...data,
      courseId: courseId,
    });
  };

  const handleDeleteLesson = (lesson: Lesson) => {
    if (confirm(`هل أنت متأكد من حذف الدرس "${lesson.title}"؟`)) {
      deleteLessonMutation.mutate(lesson.id);
    }
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-24 pb-20" dir="rtl">
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-24 pb-20" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">المادة غير موجودة</h2>
              <p className="text-gray-600 mb-4">لم يتم العثور على المادة المطلوبة</p>
              <Link href="/admin">
                <Button>العودة إلى لوحة الإدارة</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-24 pb-20" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى لوحة الإدارة
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Video className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
          </div>
          <p className="text-gray-600">إدارة محتوى المادة والدروس</p>
        </div>

        {/* Course Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>معلومات المادة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">المدرس</h4>
                <p className="text-gray-600">{course.instructor}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">المستوى</h4>
                <p className="text-gray-600">{course.level}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">المدة الإجمالية</h4>
                <p className="text-gray-600">{Math.floor(course.duration / 60)} ساعة</p>
              </div>
              <div className="md:col-span-3">
                <h4 className="font-semibold text-gray-900 mb-1">الوصف</h4>
                <p className="text-gray-600">{course.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="lessons" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lessons">الدروس</TabsTrigger>
            <TabsTrigger value="exams">الاختبارات</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">دروس المادة</h2>
              <Dialog open={isAddLessonOpen} onOpenChange={setIsAddLessonOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة درس جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]" dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إضافة درس جديد</DialogTitle>
                    <DialogDescription>
                      أضف درساً جديداً إلى المادة مع رابط الفيديو
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...lessonForm}>
                    <form onSubmit={lessonForm.handleSubmit(onSubmitLesson)} className="space-y-4">
                      <FormField
                        control={lessonForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>عنوان الدرس *</FormLabel>
                            <FormControl>
                              <Input placeholder="مثل: مقدمة في علم الحديث" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={lessonForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>وصف الدرس</FormLabel>
                            <FormControl>
                              <Textarea placeholder="وصف مختصر للدرس ومحتواه..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={lessonForm.control}
                        name="videoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>رابط الفيديو *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://youtube.com/watch?v=..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={lessonForm.control}
                        name="duration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>مدة الدرس (بالدقائق) *</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="30"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsAddLessonOpen(false)}
                        >
                          إلغاء
                        </Button>
                        <Button
                          type="submit"
                          disabled={createLessonMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {createLessonMutation.isPending ? "جاري الإضافة..." : "إضافة الدرس"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {lessonsLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))
              ) : lessons && lessons.length > 0 ? (
                lessons.map((lesson: Lesson, index: number) => (
                  <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-green-600">
                              الدرس {index + 1}
                            </span>
                          </div>
                          <CardTitle className="text-lg">{lesson.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {lesson.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {lesson.duration} دقيقة
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="h-4 w-4" />
                            فيديو
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer">
                              <Play className="h-4 w-4 ml-1" />
                              مشاهدة
                            </a>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingLesson(lesson)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteLesson(lesson)}
                            disabled={deleteLessonMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">لا توجد دروس في هذه المادة حتى الآن</p>
                  <Button onClick={() => setIsAddLessonOpen(true)}>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة أول درس
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">اختبارات المادة</h2>
              <Link href={`/admin/create-exam?courseId=${courseId}`}>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة اختبار جديد
                </Button>
              </Link>
            </div>

            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">لا توجد اختبارات لهذه المادة حتى الآن</p>
              <Link href={`/admin/create-exam?courseId=${courseId}`}>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة أول اختبار
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}