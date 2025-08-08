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
import { useAuth } from "@/contexts/AuthContext";


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
  console.log('🚀 Dashboard component rendered at:', new Date().toISOString());
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  console.log('👤 Dashboard user state:', {
    user: user ? { id: user.id, email: user.email, role: user.role } : null,
    token: localStorage.getItem('authToken') ? 'exists' : 'missing',
    timestamp: new Date().toISOString()
  });

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery<Enrollment[]>({
    queryKey: ["/api/my-enrollments"],
    retry: false,
  });

  const { data: courses, isLoading: coursesLoading } = useQuery<Course[]>({
    queryKey: ["/courses"],
    retry: false,
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      await apiRequest('POST', `/courses/${courseId}/enroll`);
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
      queryClient.invalidateQueries({ queryKey: ["/auth/user"] });
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
                {/* Admin Button - Only show for admin users */}
                {user?.role === 'admin' && (
                  <div className="mt-3">
                    <Link href="/admin">
                      <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm">
                        <i className="fas fa-cog ml-2"></i>
                        لوحة الإدارة
                      </Button>
                    </Link>
                  </div>
                )}
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

        {/* Diploma Progress */}
        <section className="mb-12">
          <Card className="bg-white shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-amiri font-bold text-gray-800 mb-2">
                    التقدم في الديبلومات
                  </h3>
                  <p className="text-gray-600 text-sm">
                    مسيرتك التعليمية في الجامعة
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Preparatory Diploma */}
                <Link href="/diploma/preparatory">
                  <div className="border border-green-200 rounded-lg p-4 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-green-700">1</span>
                      </div>
                      <div>
                        <h4 className="font-amiri font-bold text-green-800">الديبلوم التمهيدي</h4>
                        <p className="text-xs text-green-600">120 ساعة دراسية</p>
                      </div>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2 mb-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <p className="text-xs text-green-700">التقدم: 75%</p>
                  </div>
                </Link>

                {/* Intermediate Diploma */}
                <Link href="/diploma/intermediate">
                  <div className="border border-orange-200 rounded-lg p-4 bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-orange-700">2</span>
                      </div>
                      <div>
                        <h4 className="font-amiri font-bold text-orange-800">الدبلوم المتوسط</h4>
                        <p className="text-xs text-orange-600">180 ساعة دراسية</p>
                      </div>
                    </div>
                    <div className="w-full bg-orange-200 rounded-full h-2 mb-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>
                    <p className="text-xs text-orange-700">التقدم: 20%</p>
                  </div>
                </Link>

                {/* Certificate */}
                <Link href="/diploma/certificate">
                  <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-700">3</span>
                      </div>
                      <div>
                        <h4 className="font-amiri font-bold text-blue-800">الإجازة</h4>
                        <p className="text-xs text-blue-600">240 ساعة دراسية</p>
                      </div>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <p className="text-xs text-blue-700">لم يبدأ</p>
                  </div>
                </Link>

                {/* Bachelor */}
                <Link href="/diploma/bachelor">
                  <div className="border border-purple-200 rounded-lg p-4 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-purple-700">4</span>
                      </div>
                      <div>
                        <h4 className="font-amiri font-bold text-purple-800">البكالوريوس</h4>
                        <p className="text-xs text-purple-600">300 ساعة دراسية</p>
                      </div>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2 mb-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <p className="text-xs text-purple-700">لم يبدأ</p>
                  </div>
                </Link>

                {/* Master */}
                <Link href="/diploma/master">
                  <div className="border border-yellow-200 rounded-lg p-4 bg-yellow-50 hover:bg-yellow-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-yellow-700">5</span>
                      </div>
                      <div>
                        <h4 className="font-amiri font-bold text-yellow-800">الماجستير</h4>
                        <p className="text-xs text-yellow-600">360 ساعة دراسية</p>
                      </div>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
                      <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <p className="text-xs text-yellow-700">لم يبدأ</p>
                  </div>
                </Link>

                {/* Doctorate */}
                <Link href="/diploma/doctorate">
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-red-700">6</span>
                      </div>
                      <div>
                        <h4 className="font-amiri font-bold text-red-800">الدكتوراه</h4>
                        <p className="text-xs text-red-600">480 ساعة دراسية</p>
                      </div>
                    </div>
                    <div className="w-full bg-red-200 rounded-full h-2 mb-2">
                      <div className="bg-red-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                    <p className="text-xs text-red-700">لم يبدأ</p>
                  </div>
                </Link>
              </div>
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
                      <Link href={`/course/${enrollment.courseId}`} className="flex-1">
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white text-xs">
                          متابعة
                        </Button>
                      </Link>
                      {Number(enrollment.progress) >= 100 && (
                        <Link href={`/course/${enrollment.courseId}/exam`}>
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




      </main>

      <Footer />
    </div>
  );
}
