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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Dashboard Hero */}
        <section className="mb-12">
          <div className="bg-gradient-to-l from-green-600 to-green-700 rounded-3xl text-white p-8 mb-8 shadow-xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-amiri font-bold mb-4">
                  أهلاً وسهلاً بك في رحلتك العلمية
                </h2>
                <p className="text-lg mb-6 text-green-100">
                  ادرس علوم الحديث الشريف مع نخبة من العلماء المختصين واحصل على شهادات معتمدة
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                    <div className="text-2xl font-bold">{stats?.completedCourses || 0}</div>
                    <div className="text-sm">مادة مكتملة</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                    <div className="text-2xl font-bold">{stats?.certificates || 0}</div>
                    <div className="text-sm">شهادة حاصل عليها</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center border border-white/30">
                    <div className="text-2xl font-bold">{stats?.totalHours || 0}</div>
                    <div className="text-sm">ساعة دراسية</div>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-center text-6xl text-white/30">
                  <i className="fas fa-quran mb-4"></i>
                  <div className="text-lg font-amiri">علم الحديث النبوي الشريف</div>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="hover-scale overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-green-500 to-green-600 flex flex-col items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 text-center">
                      <i className="fas fa-quran text-5xl mb-3"></i>
                      <h4 className="font-amiri text-lg font-bold opacity-95">
                        {enrollment.course.title}
                      </h4>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h4 className="font-amiri font-bold text-lg mb-2">
                      {enrollment.course.title}
                    </h4>
                    <p className="text-gray-600 mb-4">{enrollment.course.instructor}</p>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>التقدم</span>
                        <span>{Math.round(Number(enrollment.progress))}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Number(enrollment.progress)}%` }}
                        ></div>
                      </div>
                    </div>
                    <Link href={`/courses/${enrollment.courseId}`}>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        متابعة التعلم
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Available Courses */}
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => (
                <Card key={course.id} className="hover-scale overflow-hidden">
                  <div className="h-48 bg-gradient-to-br from-green-400 to-green-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 text-center">
                      <i className="fas fa-book-quran text-5xl mb-3"></i>
                      <h4 className="font-amiri text-lg font-bold opacity-95 px-4">
                        {course.title}
                      </h4>
                      <p className="text-sm opacity-80 mt-1">{course.instructor}</p>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-amiri font-bold text-lg">{course.title}</h4>
                      <Badge className={getLevelColor(course.level)}>
                        {course.level}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mb-2">{course.instructor}</p>
                    <p className="text-sm text-gray-500 mb-4">{course.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                      <span>
                        <i className="fas fa-clock ml-1"></i> 
                        {Math.round(course.duration / 60)} ساعة
                      </span>
                      <span>
                        <i className="fas fa-video ml-1"></i> 
                        {course.totalLessons} محاضرة
                      </span>
                    </div>
                    <Button 
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollMutation.isPending}
                      className="w-full bg-white text-green-700 hover:bg-gray-50 border border-green-700"
                    >
                      {enrollMutation.isPending ? "جاري التسجيل..." : "التسجيل في المادة"}
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
