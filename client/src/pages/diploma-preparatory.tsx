import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { useGetDiplomaCourses } from "@/hooks/useCourses";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function DiplomaPreparatoryPage() {
  console.log('📚 DiplomaPreparatoryPage rendered at:', new Date().toISOString());
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: courses, loading, error, execute: fetchCourses } = useGetDiplomaCourses('تمهيدي');

  // Fetch user enrollments to check which courses are enrolled
  const { data: enrollments = [] } = useQuery({
    queryKey: ["api", "my-enrollments"],
    enabled: !!user,
  });

  // Get enrolled course IDs
  const enrolledCourseIds = enrollments.map((e: any) => e.courseId) || [];
  
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

  useEffect(() => {
    console.log('📚 DiplomaPreparatoryPage useEffect triggered, calling fetchCourses');
    fetchCourses();
  }, []); // Empty dependency array to run only once



  // Calculate total hours from courses
  const totalHours = Array.isArray(courses) && courses.length > 0 ? courses.reduce((sum, course) => sum + (course.duration || 0), 0) : 0;

  // Helper function to get course icon based on title
  const getCourseIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('قرآن') || lowerTitle.includes('جزء')) return 'fas fa-quran';
    if (lowerTitle.includes('حديث') || lowerTitle.includes('أربعين')) return 'fas fa-certificate';
    if (lowerTitle.includes('كتاب') || lowerTitle.includes('نخبة')) return 'fas fa-book';
    if (lowerTitle.includes('شرح') || lowerTitle.includes('أحاديث')) return 'fas fa-comments';
    if (lowerTitle.includes('لغة') || lowerTitle.includes('نحو') || lowerTitle.includes('أجرومية')) return 'fas fa-language';
    if (lowerTitle.includes('سيرة') || lowerTitle.includes('نبوية')) return 'fas fa-user-circle';
    if (lowerTitle.includes('تفسير')) return 'fas fa-book-open';
    if (lowerTitle.includes('عربية')) return 'fas fa-font';
    if (lowerTitle.includes('أهمية') || lowerTitle.includes('علم')) return 'fas fa-star';
    if (lowerTitle.includes('مهارات') || lowerTitle.includes('تطبيقية')) return 'fas fa-tools';
    if (lowerTitle.includes('آداب') || lowerTitle.includes('طالب')) return 'fas fa-heart';
    return 'fas fa-graduation-cap'; // default icon
  };

  // Helper function to get course hours
  const getCourseHours = (course: any) => {
    if (course.duration) {
      return Math.ceil(course.duration / 60); // Convert minutes to hours
    }
    return 10; // Default hours
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">جاري تحميل المواد الدراسية...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  //  const subjects = [
  //   { id: 1, courseId: 1, title: "حفظ جزء عم و جزء تبارك", icon: "fas fa-quran", hours: 20 },
  //   { id: 2, courseId: 2, title: "إجازة حفظ الأربعين النووية", icon: "fas fa-certificate", hours: 15 },
  //   { id: 3, courseId: 3, title: "دراسة كتاب نخبة الفكر", icon: "fas fa-book", hours: 12 },
  //   { id: 4, courseId: 4, title: "شرح أحاديث الأربعين النووية", icon: "fas fa-comments", hours: 18 },
  //   { id: 5, courseId: 5, title: "دراسة متن الأجرومية", icon: "fas fa-language", hours: 10 },
  //   { id: 6, courseId: 6, title: "السيرة النبوية", icon: "fas fa-user-circle", hours: 15 },
  //   { id: 7, courseId: 1, title: "تفسير القرآن جزء عم و تبارك", icon: "fas fa-book-open", hours: 20 },
  //   { id: 8, courseId: 2, title: "اللغة العربية", icon: "fas fa-font", hours: 8 },
  //   { id: 9, courseId: 3, title: "أهمية دراسة علم الحديث", icon: "fas fa-star", hours: 6 },
  //   { id: 10, courseId: 4, title: "المهارات التطبيقية", icon: "fas fa-tools", hours: 8 },
  //   { id: 11, courseId: 5, title: "آداب طالب العلم", icon: "fas fa-heart", hours: 8 }
  // ];

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <p className="text-gray-600 mb-4">حدث خطأ في تحميل المواد الدراسية</p>
              <Button onClick={() => fetchCourses()} className="bg-green-600 hover:bg-green-700">
                إعادة المحاولة
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-green-600 to-green-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">1</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                  الديبلوم التمهيدي في علوم الحديث
                </h1>
                <p className="text-green-100 mt-2">
                  المستوى الأول - {totalHours} ساعة دراسية
                </p>
              </div>
            </div>
            <p className="text-green-100 text-sm md:text-base">
              أول خطوة في رحلتك العلمية لدراسة علوم الحديث الشريف، حيث ستتعلم الأساسيات وتبني قاعدة صلبة للمراحل القادمة
            </p>
          </div>
        </div>


        {/* Subjects Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-amiri font-bold text-gray-800 mb-6">
            المواد الدراسية ({Array.isArray(courses) ? courses.length : 0} مادة)
          </h2>
          
          {Array.isArray(courses) && courses.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {courses.map((course) => {
                const isEnrolled = enrolledCourseIds.includes(course.id);
                const enrolledCourse = enrollments.find((e: any) => e.courseId === course.id);
                const progress = enrolledCourse ? Number(enrolledCourse.progress) : 0;
                
                return (
                  <Card key={course.id} className="hover-scale overflow-hidden">
                    <div className="h-20 bg-gradient-to-br from-green-400 to-green-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
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
                        <span>{getCourseHours(course)} ساعة</span>
                        <span>{course.totalLessons || 12} محاضرة</span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-gray-600 mb-1">
                          <span>التقدم</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1">
                          <div className="bg-green-600 h-1 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                      {isEnrolled ? (
                        <Link href={`/course/${course.id}`}>
                          <Button 
                            size="sm"
                            className="w-full bg-green-600 text-white hover:bg-green-700 text-xs py-1 h-6"
                          >
                            متابعة الدراسة
                          </Button>
                        </Link>
                      ) : (
                        <Button 
                          size="sm"
                          onClick={() => enrollMutation.mutate(course.id)}
                          disabled={enrollMutation.isPending}
                          className="w-full bg-green-600 text-white hover:bg-green-700 text-xs py-1 h-6"
                        >
                          {enrollMutation.isPending ? "جاري التسجيل..." : "سجل الآن"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-4xl mb-4">
                <i className="fas fa-book-open"></i>
              </div>
              <p className="text-gray-600 mb-4">
                {!Array.isArray(courses) ? 'جاري تحميل البيانات...' : 'لا توجد مواد دراسية متاحة حالياً'}
              </p>
              {user?.role === 'admin' && (
                <div className="flex gap-4 justify-center">
                  <Link href="/course-management">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <i className="fas fa-cogs ml-2"></i>
                      إدارة المواد الدراسية
                    </Button>
                  </Link>
                  <Link href="/admin/create-course">
                    <Button variant="outline">
                      <i className="fas fa-plus ml-2"></i>
                      إضافة مادة دراسية
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Requirements & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-amiri font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-list-check text-green-600"></i>
                متطلبات القبول
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-green-500 text-xs"></i>
                  إتقان القراءة والكتابة باللغة العربية
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-green-500 text-xs"></i>
                  الالتزام بحضور المحاضرات
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-green-500 text-xs"></i>
                  أداء الواجبات والاختبارات
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-amiri font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-graduation-cap text-green-600"></i>
                مخرجات التعلم
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  فهم أساسيات علم الحديث
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  حفظ أجزاء من القرآن الكريم
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  التأهل للمستوى المتوسط
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
            <Button className="w-full bg-green-600 hover:bg-green-700">
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