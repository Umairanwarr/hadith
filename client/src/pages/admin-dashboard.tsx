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
      await apiRequest("/admin/initialize-courses", { method: "POST" });
    },
    onSuccess: () => {
      toast({
        title: "تم بنجاح",
        description: "تم تحديث المواد الدراسية وفقاً لبرنامج الجامعة الأصيل",
      });
      queryClient.invalidateQueries({ queryKey: ["/courses"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
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
          window.location.href = "/login";
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
    queryKey: ["admin", "dashboard"],
    retry: false,
  });

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    retry: false,
  });

  const { data: exams, isLoading: examsLoading } = useQuery({
    queryKey: ["exams"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ type, id }: { type: "course" | "exam"; id: string }) => {
      await apiRequest("DELETE", `/api/admin/${type}s/${id}`);
    },
    onSuccess: (_, { type }) => {
      toast({
        title: "تم الحذف بنجاح",
        description: type === "course" ? "تم حذف المادة بنجاح" : "تم حذف الاختبار بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
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

  const handleDelete = (type: "course" | "exam", id: string, title: string) => {
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">قوالب الديبلوم</CardTitle>
              <i className="fas fa-certificate h-4 w-4 text-muted-foreground"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDiplomaTemplates || 0}</div>
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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">إدارة المواد</TabsTrigger>
            <TabsTrigger value="exams">إدارة الاختبارات</TabsTrigger>
            <TabsTrigger value="diplomas">إدارة الديبلومات</TabsTrigger>
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
                <Link href="/course-management">
                  <Button>
                    <i className="fas fa-cogs ml-2"></i>
                    إدارة المواد
                  </Button>
                </Link>
                <Link href="/admin/create-course">
                  <Button variant="outline">
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

          <TabsContent value="diplomas" className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-bold">إدارة قوالب الديبلومات</h2>
              <div className="flex gap-2 flex-wrap">
                <Link href="/admin/diploma-management">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    <i className="fas fa-certificate ml-2"></i>
                    إدارة قوالب الديبلومات
                  </Button>
                </Link>
                <Link href="/certificate-generator">
                  <Button variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100">
                    <i className="fas fa-file-image ml-2"></i>
                    إنتاج الشهادات
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-certificate text-amber-600 text-lg"></i>
                    </div>
                    <div>
                      <CardTitle className="text-lg text-amber-800">قوالب الديبلومات</CardTitle>
                      <CardDescription className="text-amber-600">إنشاء وتخصيص قوالب الشهادات</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-amber-700 mb-4">
                    إنشاء قوالب مخصصة للديبلومات والشهادات بتصاميم متنوعة ومرونة في الألوان والخطوط
                  </p>
                  <Link href="/admin/diploma-management">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                      <i className="fas fa-plus ml-2"></i>
                      إدارة القوالب
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-file-image text-blue-600 text-lg"></i>
                    </div>
                    <div>
                      <CardTitle className="text-lg text-blue-800">إنتاج الشهادات</CardTitle>
                      <CardDescription className="text-blue-600">إنتاج شهادات بتصاميم احترافية</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-700 mb-4">
                    إنتاج شهادات عالية الجودة للطلاب المتفوقين باستخدام القوالب المصممة
                  </p>
                  <Link href="/certificate-generator">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <i className="fas fa-magic ml-2"></i>
                      إنتاج شهادة
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-images text-green-600 text-lg"></i>
                    </div>
                    <div>
                      <CardTitle className="text-lg text-green-800">عينات الشهادات</CardTitle>
                      <CardDescription className="text-green-600">استعراض نماذج الشهادات</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 mb-4">
                    استعراض عينات من الشهادات والديبلومات بتصاميم مختلفة للمستويات المتنوعة
                  </p>
                  <Link href="/sample-certificates">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      <i className="fas fa-eye ml-2"></i>
                      عرض العينات
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats for Diploma Management */}
            <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 border border-amber-200">
              <h3 className="text-lg font-semibold text-amber-800 mb-4">إحصائيات سريعة - إدارة الديبلومات</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats?.totalDiplomaTemplates || 0}</div>
                  <div className="text-sm text-amber-700">قوالب الديبلومات</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats?.activeDiplomaTemplates || 0}</div>
                  <div className="text-sm text-amber-700">القوالب النشطة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats?.totalCertificates || 0}</div>
                  <div className="text-sm text-amber-700">الشهادات المُصدرة</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats?.certificatesThisMonth || 0}</div>
                  <div className="text-sm text-amber-700">شهادات هذا الشهر</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}