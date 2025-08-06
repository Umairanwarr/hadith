import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, FileText, PlusCircle, Edit, Trash2, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useEffect } from "react";

function InitializeCoursesButton() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const initializeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("/api/admin/initialize-courses", { method: "POST" });
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم تحديث المواد الدراسية وفقاً لبرنامج الجامعة الأصيل",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
    },
    onError: (error: any) => {
      if (error.message?.includes("already exist")) {
        toast({
          title: "تنبيه",
          description: "المواد الدراسية موجودة بالفعل",
          variant: "destructive",
        });
        return;
      }
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
        title: "خطأ",
        description: "فشل في تحديث المواد الدراسية",
        variant: "destructive",
      });
    },
  });

  return (
    <Button
      onClick={() => initializeMutation.mutate()}
      disabled={initializeMutation.isPending}
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      <i className="fas fa-university mr-2"></i>
      {initializeMutation.isPending ? "جاري التحديث..." : "تحديث المواد وفقاً للبرنامج الأصيل"}
    </Button>
  );
}

interface AdminStats {
  totalUsers: number;
  totalCourses: number;
  totalExams: number;
  totalEnrollments: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration: number;
  totalLessons: number;
  isActive: boolean;
  createdAt: string;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  duration: number;
  passingGrade: string;
  totalQuestions: number;
  isActive: boolean;
  courseId: number;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated or not admin
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
      toast({
        title: "غير مصرح",
        description: "يجب أن تكون مدير للوصول لهذه الصفحة",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation("/");
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast, setLocation]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    retry: false,
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["/api/exams"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: "course" | "exam"; id: number }) => {
      await apiRequest(`/api/admin/${type}s/${id}`, { method: "DELETE" });
    },
    onSuccess: (_, { type }) => {
      toast({
        title: "تم الحذف بنجاح",
        description: type === "course" ? "تم حذف المادة بنجاح" : "تم حذف الاختبار بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
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
        title: "خطأ",
        description: "فشل في الحذف. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  const handleDelete = (type: "course" | "exam", id: number, title: string) => {
    if (confirm(`هل أنت متأكد من حذف ${type === "course" ? "المادة" : "الاختبار"} "${title}"؟`)) {
      deleteMutation.mutate({ type, id });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-24 pb-20" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة الإدارة</h1>
              <p className="text-gray-600">إدارة المواد والاختبارات والطلاب</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-300">
                <i className="fas fa-arrow-right ml-2"></i>
                العودة للوحة الرئيسية
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المستخدمين</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">المواد</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalCourses || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الاختبارات</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalExams || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">التسجيلات</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEnrollments || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="courses">إدارة المواد</TabsTrigger>
            <TabsTrigger value="exams">إدارة الاختبارات</TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-bold">المواد الدراسية</h2>
              <div className="flex gap-2 flex-wrap">
                <Link href="/quick-add">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <i className="fas fa-plus ml-2"></i>
                    إضافة سريعة
                  </Button>
                </Link>
                <Link href="/teacher-guide">
                  <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                    <i className="fas fa-question-circle ml-2"></i>
                    دليل المعلم
                  </Button>
                </Link>
                <InitializeCoursesButton />
                <Link href="/admin/create-course">
                  <Button>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة مادة جديدة
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coursesLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : courses?.length > 0 ? (
                courses.map((course: Course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{course.title}</CardTitle>
                          <CardDescription>{course.instructor}</CardDescription>
                        </div>
                        <Badge variant={course.isActive ? "default" : "secondary"}>
                          {course.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">المستوى: {course.level}</p>
                        <p className="text-sm text-gray-600">
                          المدة: {Math.floor(course.duration / 60)} ساعة
                        </p>
                        <p className="text-sm text-gray-600">
                          الدروس: {course.totalLessons || 0}
                        </p>
                        <div className="flex gap-2 pt-4">
                          <Link href={`/admin/courses/${course.id}`}>
                            <Button size="sm" variant="outline">
                              إدارة
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete("course", course.id, course.title)}
                            disabled={deleteMutation.isPending}
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
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">لا توجد مواد دراسية حتى الآن</p>
                  <Link href="/admin/create-course">
                    <Button className="mt-4">
                      <PlusCircle className="ml-2 h-4 w-4" />
                      إضافة أول مادة
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="exams" className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-bold">الاختبارات</h2>
              <div className="flex gap-2 flex-wrap">
                <Link href="/admin/live-sessions">
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <i className="fas fa-broadcast-tower ml-2"></i>
                    إدارة البث المباشر
                  </Button>
                </Link>
                <Link href="/admin/create-exam">
                  <Button>
                    <PlusCircle className="ml-2 h-4 w-4" />
                    إضافة اختبار جديد
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {examsLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : exams?.length > 0 ? (
                exams.map((exam: Exam) => (
                  <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{exam.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {exam.description}
                          </CardDescription>
                        </div>
                        <Badge variant={exam.isActive ? "default" : "secondary"}>
                          {exam.isActive ? "نشط" : "غير نشط"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">المدة: {exam.duration} دقيقة</p>
                        <p className="text-sm text-gray-600">
                          درجة النجاح: {exam.passingGrade}%
                        </p>
                        <p className="text-sm text-gray-600">
                          الأسئلة: {exam.totalQuestions || 0}
                        </p>
                        <div className="flex gap-2 pt-4">
                          <Link href={`/admin/edit-exam/${exam.id}`}>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete("exam", exam.id, exam.title)}
                            disabled={deleteMutation.isPending}
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
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-600">لا توجد اختبارات حتى الآن</p>
                  <Link href="/admin/create-exam">
                    <Button className="mt-4">
                      <PlusCircle className="ml-2 h-4 w-4" />
                      إضافة أول اختبار
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}