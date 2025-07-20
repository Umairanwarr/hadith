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
import HeatmapComponent from "@/components/heatmap";

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
  enrolledAt: string;
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

        {/* Scholarly Progress Heatmap */}
        <section className="mb-12">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-amiri font-bold text-gray-800 mb-2">
                    خريطة التقدم العلمي
                  </h3>
                  <p className="text-gray-600 text-sm">
                    نشاطك الدراسي خلال الأشهر الأخيرة
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>أقل</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                    <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
                  </div>
                  <span>أكثر</span>
                </div>
              </div>
              
              <HeatmapComponent enrollments={enrollments || []} />
            </CardContent>
          </Card>
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
              
            </div>
          </section>
        )}

        {/* Available Courses - Organized by Levels */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-amiri font-bold text-green-700">
              المواد الدراسية حسب المستوى
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
            <div className="space-y-6">
              {/* Level 1: Preparatory */}
              {availableCourses.filter(course => course.level === 'تمهيدي').length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-700">1</span>
                    </div>
                    <div>
                      <h4 className="font-amiri font-bold text-lg text-gray-800">المستوى التمهيدي</h4>
                      <p className="text-sm text-gray-600">الديبلوم التمهيدي في علوم الحديث</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableCourses.filter(course => course.level === 'تمهيدي').map((course) => (
                      <Card key={course.id} className="hover-scale overflow-hidden">
                        <div className="h-16 bg-gradient-to-br from-green-400 to-green-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10 text-center">
                            <i className="fas fa-seedling text-sm mb-1"></i>
                            <h4 className="font-amiri text-xs font-bold opacity-95 px-1 leading-tight">
                              {course.title.includes(':') ? course.title.split(':')[1].trim() : course.title}
                            </h4>
                          </div>
                        </div>
                        <CardContent className="p-2">
                          <p className="text-gray-600 mb-1 text-xs truncate">{course.instructor}</p>
                          <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                            <span>{Math.round(course.duration / 3600)}س</span>
                            <span>{course.totalLessons} محاضرة</span>
                          </div>
                          <Button 
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrollMutation.isPending}
                            size="sm"
                            className="w-full bg-green-600 text-white hover:bg-green-700 text-xs py-1 h-6"
                          >
                            {enrollMutation.isPending ? "..." : "تسجيل"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Level 2: Intermediate */}
              {availableCourses.filter(course => course.level === 'متوسط').length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-orange-700">2</span>
                    </div>
                    <div>
                      <h4 className="font-amiri font-bold text-lg text-gray-800">المستوى المتوسط</h4>
                      <p className="text-sm text-gray-600">الدبلوم المتوسط في علوم الحديث</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableCourses.filter(course => course.level === 'متوسط').map((course) => (
                      <Card key={course.id} className="hover-scale overflow-hidden">
                        <div className="h-16 bg-gradient-to-br from-orange-400 to-orange-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10 text-center">
                            <i className="fas fa-book text-sm mb-1"></i>
                            <h4 className="font-amiri text-xs font-bold opacity-95 px-1 leading-tight">
                              {course.title.includes(':') ? course.title.split(':')[1].trim() : course.title}
                            </h4>
                          </div>
                        </div>
                        <CardContent className="p-2">
                          <p className="text-gray-600 mb-1 text-xs truncate">{course.instructor}</p>
                          <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                            <span>{Math.round(course.duration / 3600)}س</span>
                            <span>{course.totalLessons} محاضرة</span>
                          </div>
                          <Button 
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrollMutation.isPending}
                            size="sm"
                            className="w-full bg-orange-500 text-white hover:bg-orange-600 text-xs py-1 h-6"
                          >
                            {enrollMutation.isPending ? "..." : "تسجيل"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Level 3: Advanced */}
              {availableCourses.filter(course => course.level === 'متقدم').length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-700">3</span>
                    </div>
                    <div>
                      <h4 className="font-amiri font-bold text-lg text-gray-800">مستوى الإجازة</h4>
                      <p className="text-sm text-gray-600">الإجازة في علوم الحديث</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableCourses.filter(course => course.level === 'متقدم').map((course) => (
                      <Card key={course.id} className="hover-scale overflow-hidden">
                        <div className="h-16 bg-gradient-to-br from-blue-400 to-blue-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10 text-center">
                            <i className="fas fa-graduation-cap text-sm mb-1"></i>
                            <h4 className="font-amiri text-xs font-bold opacity-95 px-1 leading-tight">
                              {course.title.includes(':') ? course.title.split(':')[1].trim() : course.title}
                            </h4>
                          </div>
                        </div>
                        <CardContent className="p-2">
                          <p className="text-gray-600 mb-1 text-xs truncate">{course.instructor}</p>
                          <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                            <span>{Math.round(course.duration / 3600)}س</span>
                            <span>{course.totalLessons} محاضرة</span>
                          </div>
                          <Button 
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrollMutation.isPending}
                            size="sm"
                            className="w-full bg-blue-500 text-white hover:bg-blue-600 text-xs py-1 h-6"
                          >
                            {enrollMutation.isPending ? "..." : "تسجيل"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Level 4: Bachelor */}
              {availableCourses.filter(course => course.level === 'بكالوريوس').length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-purple-700">4</span>
                    </div>
                    <div>
                      <h4 className="font-amiri font-bold text-lg text-gray-800">مستوى البكالوريوس</h4>
                      <p className="text-sm text-gray-600">بكالوريوس في علم الحديث</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableCourses.filter(course => course.level === 'بكالوريوس').map((course) => (
                      <Card key={course.id} className="hover-scale overflow-hidden">
                        <div className="h-16 bg-gradient-to-br from-purple-400 to-purple-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10 text-center">
                            <i className="fas fa-university text-sm mb-1"></i>
                            <h4 className="font-amiri text-xs font-bold opacity-95 px-1 leading-tight">
                              {course.title.includes(':') ? course.title.split(':')[1].trim() : course.title}
                            </h4>
                          </div>
                        </div>
                        <CardContent className="p-2">
                          <p className="text-gray-600 mb-1 text-xs truncate">{course.instructor}</p>
                          <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                            <span>{Math.round(course.duration / 3600)}س</span>
                            <span>{course.totalLessons} محاضرة</span>
                          </div>
                          <Button 
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrollMutation.isPending}
                            size="sm"
                            className="w-full bg-purple-500 text-white hover:bg-purple-600 text-xs py-1 h-6"
                          >
                            {enrollMutation.isPending ? "..." : "تسجيل"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Level 5: Master */}
              {availableCourses.filter(course => course.level === 'ماجستير').length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-yellow-700">5</span>
                    </div>
                    <div>
                      <h4 className="font-amiri font-bold text-lg text-gray-800">مستوى الماجستير</h4>
                      <p className="text-sm text-gray-600">ماجستير عالم بالحديث</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableCourses.filter(course => course.level === 'ماجستير').map((course) => (
                      <Card key={course.id} className="hover-scale overflow-hidden">
                        <div className="h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10 text-center">
                            <i className="fas fa-scroll text-sm mb-1"></i>
                            <h4 className="font-amiri text-xs font-bold opacity-95 px-1 leading-tight">
                              {course.title.includes(':') ? course.title.split(':')[1].trim() : course.title}
                            </h4>
                          </div>
                        </div>
                        <CardContent className="p-2">
                          <p className="text-gray-600 mb-1 text-xs truncate">{course.instructor}</p>
                          <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                            <span>{Math.round(course.duration / 3600)}س</span>
                            <span>{course.totalLessons} محاضرة</span>
                          </div>
                          <Button 
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrollMutation.isPending}
                            size="sm"
                            className="w-full bg-yellow-500 text-white hover:bg-yellow-600 text-xs py-1 h-6"
                          >
                            {enrollMutation.isPending ? "..." : "تسجيل"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Level 6: Doctorate */}
              {availableCourses.filter(course => course.level === 'دكتوراه').length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-red-700">6</span>
                    </div>
                    <div>
                      <h4 className="font-amiri font-bold text-lg text-gray-800">مستوى الدكتوراه</h4>
                      <p className="text-sm text-gray-600">دكتور في الدراسات الحديثية</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableCourses.filter(course => course.level === 'دكتوراه').map((course) => (
                      <Card key={course.id} className="hover-scale overflow-hidden">
                        <div className="h-16 bg-gradient-to-br from-red-400 to-red-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10 text-center">
                            <i className="fas fa-crown text-sm mb-1"></i>
                            <h4 className="font-amiri text-xs font-bold opacity-95 px-1 leading-tight">
                              {course.title.includes(':') ? course.title.split(':')[1].trim() : course.title}
                            </h4>
                          </div>
                        </div>
                        <CardContent className="p-2">
                          <p className="text-gray-600 mb-1 text-xs truncate">{course.instructor}</p>
                          <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                            <span>{Math.round(course.duration / 3600)}س</span>
                            <span>{course.totalLessons} محاضرة</span>
                          </div>
                          <Button 
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrollMutation.isPending}
                            size="sm"
                            className="w-full bg-red-500 text-white hover:bg-red-600 text-xs py-1 h-6"
                          >
                            {enrollMutation.isPending ? "..." : "تسجيل"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Basic Courses (مبتدئ) */}
              {availableCourses.filter(course => course.level === 'مبتدئ').length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <i className="fas fa-book-open text-sm text-gray-600"></i>
                    </div>
                    <div>
                      <h4 className="font-amiri font-bold text-lg text-gray-800">مواد إضافية</h4>
                      <p className="text-sm text-gray-600">مواد تكميلية في علوم الحديث</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableCourses.filter(course => course.level === 'مبتدئ').map((course) => (
                      <Card key={course.id} className="hover-scale overflow-hidden">
                        <div className="h-16 bg-gradient-to-br from-gray-400 to-gray-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                          <div className="absolute inset-0 bg-black/10"></div>
                          <div className="relative z-10 text-center">
                            <i className="fas fa-book-open text-sm mb-1"></i>
                            <h4 className="font-amiri text-xs font-bold opacity-95 px-1 leading-tight">
                              {course.title.length > 20 ? course.title.substring(0, 20) + '...' : course.title}
                            </h4>
                          </div>
                        </div>
                        <CardContent className="p-2">
                          <p className="text-gray-600 mb-1 text-xs truncate">{course.instructor}</p>
                          <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                            <span>{Math.round(course.duration / 3600)}س</span>
                            <span>{course.totalLessons} محاضرة</span>
                          </div>
                          <Button 
                            onClick={() => handleEnroll(course.id)}
                            disabled={enrollMutation.isPending}
                            size="sm"
                            className="w-full bg-gray-500 text-white hover:bg-gray-600 text-xs py-1 h-6"
                          >
                            {enrollMutation.isPending ? "..." : "تسجيل"}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
