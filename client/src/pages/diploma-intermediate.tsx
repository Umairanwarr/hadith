import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration?: number;
  totalLessons: number;
  thumbnailUrl?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export function DiplomaIntermediatePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch courses for intermediate level
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["api", "courses"],
  });

  // Fetch user enrollments to check which courses are enrolled
  const { data: enrollments = [] } = useQuery({
    queryKey: ["api", "my-enrollments"],
    enabled: !!user,
  });

  // Get enrolled course IDs
  const enrolledCourseIds = enrollments.map((e: any) => e.courseId) || [];

  // Filter courses for intermediate level
  const intermediateCourses = courses.filter(course => course.level === "متوسط");

  // Enrollment mutation for individual courses
  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      await apiRequest('POST', `/api/courses/${courseId}/enroll`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "my-enrollments"] });
      toast({
        title: "تم التسجيل بنجاح",
        description: "تم تسجيلك في المادة بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التسجيل",
        description: error.message || "حدث خطأ أثناء التسجيل",
        variant: "destructive",
      });
    },
  });

  // Calculate total hours from courses
  const totalHours = intermediateCourses.reduce((sum, course) => sum + Math.ceil((course.duration || 0) / 60), 0);

  // Helper function to get course icon based on title
  const getCourseIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('قرآن') || lowerTitle.includes('أحزاب')) return 'fas fa-quran';
    if (lowerTitle.includes('حديث') || lowerTitle.includes('سلسلة')) return 'fas fa-link';
    if (lowerTitle.includes('أحكام') || lowerTitle.includes('عمدة')) return 'fas fa-gavel';
    if (lowerTitle.includes('شبهات') || lowerTitle.includes('سنة')) return 'fas fa-shield-alt';
    if (lowerTitle.includes('تاريخ') || lowerTitle.includes('صحابة')) return 'fas fa-users';
    if (lowerTitle.includes('تفسير')) return 'fas fa-book-open';
    if (lowerTitle.includes('لغة') || lowerTitle.includes('عربية')) return 'fas fa-font';
    if (lowerTitle.includes('مناعة') || lowerTitle.includes('حضارية')) return 'fas fa-globe';
    if (lowerTitle.includes('مهارات') || lowerTitle.includes('تطبيقية')) return 'fas fa-tools';
    if (lowerTitle.includes('طبقات') || lowerTitle.includes('محدثين')) return 'fas fa-layer-group';
    if (lowerTitle.includes('جرح') || lowerTitle.includes('تعديل')) return 'fas fa-balance-scale';
    return 'fas fa-graduation-cap';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-orange-600 to-orange-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">2</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                  الدبلوم المتوسط في علوم الحديث
                </h1>
                <p className="text-orange-100 mt-2">
                  المستوى الثاني - {totalHours} ساعة دراسية
                </p>
              </div>
            </div>
            <p className="text-orange-100 text-sm md:text-base">
              تطوير مهاراتك في علوم الحديث مع دراسة متقدمة للنصوص والمناهج العلمية المتخصصة
            </p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-amiri font-bold text-gray-800 mb-6">
            المواد الدراسية ({intermediateCourses.length} مادة)
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400 ml-3"></i>
              <span>جاري تحميل المواد...</span>
            </div>
          ) : intermediateCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-book-open text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد مواد بعد</h3>
              <p className="text-gray-500">سيتم إضافة المواد قريباً</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {intermediateCourses.map((course) => {
                const isEnrolled = enrolledCourseIds.includes(course.id);
                const enrolledCourse = enrollments.find((e: any) => e.courseId === course.id);
                const progress = enrolledCourse ? Number(enrolledCourse.progress) : 0;
                
                return (
                  <Card key={course.id} className="hover-scale overflow-hidden">
                    <div className="h-20 bg-gradient-to-br from-orange-400 to-orange-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="relative z-10 text-center">
                        <i className={`${getCourseIcon(course.title)} text-sm mb-1`}></i>
                        <h4 className="font-amiri text-xs font-bold opacity-95 px-1 leading-tight">
                          {course.title.length > 25 ? course.title.substring(0, 25) + '...' : course.title}
                        </h4>
                      </div>
                      {isEnrolled && (
                        <div className="absolute top-2 right-2">
                          <i className="fas fa-check-circle text-white text-sm"></i>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-amiri font-bold text-sm mb-2 truncate">
                        {course.title}
                      </h4>
                      <div className="flex justify-between items-center text-xs text-gray-600 mb-3">
                        <span>{Math.ceil((course.duration || 0) / 60)} ساعة</span>
                        <span>{course.totalLessons} محاضرة</span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>التقدم</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-orange-600 h-1 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                      {isEnrolled ? (
                        <Link href={`/course/${course.id}`}>
                          <Button 
                            size="sm"
                            className="w-full bg-orange-500 text-white hover:bg-orange-600 text-xs py-1 h-6"
                          >
                            متابعة الدراسة
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => enrollMutation.mutate(course.id)}
                          disabled={enrollMutation.isPending}
                          className="w-full bg-orange-600 text-white hover:bg-orange-700 text-xs py-1 h-6"
                        >
                          {enrollMutation.isPending ? "جاري التسجيل..." : "سجل الآن"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Requirements & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-amiri font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-list-check text-orange-600"></i>
                متطلبات القبول
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-orange-500 text-xs"></i>
                  إنهاء الديبلوم التمهيدي بنجاح
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-orange-500 text-xs"></i>
                  معدل لا يقل عن 75% في المستوى السابق
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-orange-500 text-xs"></i>
                  إتقان أساسيات علم الحديث
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-amiri font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-graduation-cap text-orange-600"></i>
                مخرجات التعلم
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  إتقان علوم الجرح والتعديل
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  حفظ أجزاء إضافية من القرآن
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  التأهل لمستوى الإجازة
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/dashboard" className="flex-1">
            <Button variant="outline" className="w-full">
              <i className="fas fa-arrow-right ml-2"></i>
              العودة للصفحة الرئيسية
            </Button>
          </Link>
          <Link href="/diplomas" className="flex-1">
            <Button className="w-full bg-orange-600 hover:bg-orange-700">
              <i className="fas fa-certificate ml-2"></i>
              عرض جميع الديبلومات
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}