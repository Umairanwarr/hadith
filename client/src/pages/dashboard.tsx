import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration: number;
  totalLessons: number;
  thumbnailUrl: string;
}

interface Enrollment {
  id: number;
  courseId: number;
  progress: string;
  course: Course;
}

interface DashboardStats {
  completedCourses: number;
  certificates: number;
  totalHours: number;
  averageGrade: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<Enrollment[]>({
    queryKey: ["/api/my-enrollments"],
    retry: false,
  });

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      await apiRequest('POST', `/api/courses/${courseId}/enroll`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-enrollments"] });
      toast({
        title: "تم التسجيل بنجاح",
        description: "تم تسجيلك في المادة بنجاح",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مخول",
          description: "يتم إعادة تسجيل الدخول...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ في التسجيل",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const enrolledCourseIds = enrollments?.map(e => e.courseId) || [];
  const availableCourses = courses?.filter(course => !enrolledCourseIds.includes(course.id)) || [];

  const handleEnroll = (courseId: number) => {
    enrollMutation.mutate(courseId);
  };

  const promoteToAdminMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/promote-to-admin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "تم الترقية بنجاح",
        description: "تم ترقيتك إلى مدير",
      });
      // Reload page to refresh header with admin link
      setTimeout(() => window.location.reload(), 1000);
    },
    onError: (error) => {
      toast({
        title: "خطأ في الترقية",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'مبتدئ':
        return 'bg-green-100 text-green-800';
      case 'متوسط':
        return 'bg-orange-100 text-orange-800';
      case 'متقدم':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (statsLoading || enrollmentsLoading || coursesLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gray-200 rounded-2xl"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Hero - Compact */}
        <section className="mb-8">
          <div className="bg-gradient-to-l from-green-600 to-green-700 rounded-2xl text-white p-4 mb-6 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                <h2 className="text-sm md:text-base font-amiri font-bold mb-2">
                  أهلاً وسهلاً بك في رحلتك العلمية
                </h2>
                <p className="text-xs md:text-sm mb-3 text-green-100">
                  ادرس علوم الحديث الشريف مع نخبة من العلماء المختصين واحصل على شهادات معتمدة
                </p>
              </div>
              <div className="flex gap-2">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center border border-white/30 min-w-[60px]">
                  <div className="text-lg font-bold">{stats?.completedCourses || 0}</div>
                  <div className="text-xs">مادة مكتملة</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center border border-white/30 min-w-[60px]">
                  <div className="text-lg font-bold">{stats?.certificates || 0}</div>
                  <div className="text-xs">شهادة</div>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 text-center border border-white/30 min-w-[60px]">
                  <div className="text-lg font-bold">{stats?.totalHours || 0}</div>
                  <div className="text-xs">ساعة</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Current Learning */}
        {enrollments && enrollments.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-amiri font-bold text-green-700 mb-6">
              متابعة التعلم
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="hover-scale overflow-hidden">
                  <div className="h-32 bg-gradient-to-br from-green-500 to-green-600 flex flex-col items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 text-center">
                      <i className="fas fa-quran text-3xl mb-2"></i>
                      <h4 className="font-amiri text-sm font-bold opacity-95">
                        {enrollment.course.title}
                      </h4>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-amiri font-bold text-sm mb-2">
                      {enrollment.course.title}
                    </h4>
                    <p className="text-gray-600 mb-3 text-xs">{enrollment.course.instructor}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>التقدم</span>
                        <span>{Math.round(Number(enrollment.progress))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-green-600 h-1 rounded-full transition-all duration-300" 
                          style={{ width: `${Number(enrollment.progress)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Link href={`/courses/${enrollment.courseId}`} className="flex-1">
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white text-xs">
                          متابعة
                        </Button>
                      </Link>
                      {Number(enrollment.progress) >= 100 && (
                        <Link href={`/courses/${enrollment.courseId}/exam`}>
                          <Button variant="outline" size="sm" className="bg-white text-green-700 hover:bg-gray-50 border border-green-700 px-2">
                            <i className="fas fa-clipboard-list text-xs"></i>
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Available Exams */}
        {enrollments && enrollments.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-amiri font-bold text-green-700 mb-6">
              الاختبارات المتاحة
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {enrollments
                .filter(enrollment => Number(enrollment.progress) >= 100)
                .map((enrollment) => (
                <Card key={`exam-${enrollment.id}`} className="hover-scale overflow-hidden">
                  <div className="h-28 bg-gradient-to-br from-orange-500 to-orange-600 flex flex-col items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 text-center">
                      <i className="fas fa-clipboard-list text-2xl mb-1"></i>
                      <h4 className="font-amiri text-xs font-bold opacity-95">
                        اختبار {enrollment.course.title}
                      </h4>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-amiri font-bold text-sm mb-2">
                      اختبار {enrollment.course.title}
                    </h4>
                    <p className="text-gray-600 text-xs mb-3">
                      الاختبار النهائي للمادة
                    </p>
                    <Link href={`/courses/${enrollment.courseId}/exam`}>
                      <Button size="sm" className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs">
                        <i className="fas fa-play text-xs ml-1"></i>
                        بدء الاختبار
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
              {enrollments.filter(enrollment => Number(enrollment.progress) >= 100).length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="p-4 text-center">
                    <i className="fas fa-lock text-2xl text-gray-400 mb-2"></i>
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">
                      لا توجد اختبارات متاحة
                    </h4>
                    <p className="text-gray-500 text-xs">
                      أكمل جميع محاضرات المادة للوصول إلى الاختبار
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        )}

        {/* Available Courses - Small Cards */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-amiri font-bold text-green-700">
              المواد الدراسية المتاحة
            </h3>
          </div>
          
          {availableCourses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <i className="fas fa-graduation-cap text-4xl text-gray-400 mb-4"></i>
                <h4 className="text-xl font-semibold text-gray-600 mb-2">
                  لا توجد مواد متاحة للتسجيل
                </h4>
                <p className="text-gray-500">
                  {enrollments && enrollments.length > 0 
                    ? "لقد سجلت في جميع المواد المتاحة"
                    : "لا توجد مواد دراسية متاحة حالياً"
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {availableCourses.map((course) => (
                <Card key={course.id} className="hover-scale overflow-hidden">
                  <div className="h-20 bg-gradient-to-br from-green-400 to-green-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 text-center">
                      <i className="fas fa-book-quran text-lg mb-1"></i>
                      <h4 className="font-amiri text-xs font-bold opacity-95 px-1 leading-tight">
                        {course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title}
                      </h4>
                    </div>
                  </div>
                  <CardContent className="p-2">
                    <h4 className="font-amiri font-bold text-xs mb-1 leading-tight">
                      {course.title.length > 25 ? course.title.substring(0, 25) + '...' : course.title}
                    </h4>
                    <p className="text-gray-600 mb-1 text-xs truncate">{course.instructor}</p>
                    <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                      <Badge className={`${getLevelColor(course.level)} text-xs px-1 py-0`}>
                        {course.level}
                      </Badge>
                      <span className="text-xs">
                        {Math.round(course.duration / 60)}س
                      </span>
                    </div>
                    <Button 
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollMutation.isPending}
                      size="sm"
                      className="w-full bg-white text-green-700 hover:bg-gray-50 border border-green-700 text-xs py-1 h-6"
                    >
                      {enrollMutation.isPending ? "..." : "تسجيل"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
