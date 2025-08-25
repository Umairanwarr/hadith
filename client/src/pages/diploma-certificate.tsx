import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { CourseImageGallery } from "@/components/course-image-gallery";

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

export function DiplomaCertificatePage() {
  // Fetch courses for certificate level
  const { data: courses = [], isLoading } = useQuery<Course[]>({
    queryKey: ["api", "courses"],
  });

  // Filter courses for certificate level
  const certificateCourses = courses.filter(course => course.level === "إجازة");

  // Calculate total hours from courses
  const totalHours = certificateCourses.reduce((sum, course) => sum + Math.ceil((course.duration || 0) / 60), 0);

  // Helper function to get course icon based on title
  const getCourseIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('قرآن') || lowerTitle.includes('حزب')) return 'fas fa-quran';
    if (lowerTitle.includes('حديث')) return 'fas fa-bookmark';
    if (lowerTitle.includes('تاريخ') || lowerTitle.includes('إسلامي')) return 'fas fa-mosque';
    if (lowerTitle.includes('تفسير')) return 'fas fa-book-open';
    if (lowerTitle.includes('ذكاء') || lowerTitle.includes('اصطناعي')) return 'fas fa-robot';
    if (lowerTitle.includes('مهارات') || lowerTitle.includes('تطبيقية')) return 'fas fa-tools';
    if (lowerTitle.includes('مناهج') || lowerTitle.includes('مفسرين')) return 'fas fa-users-cog';
    if (lowerTitle.includes('علل')) return 'fas fa-search';
    if (lowerTitle.includes('تخريج')) return 'fas fa-filter';
    if (lowerTitle.includes('أصول')) return 'fas fa-cogs';
    if (lowerTitle.includes('قواعد') || lowerTitle.includes('فقهية')) return 'fas fa-gavel';
    return 'fas fa-graduation-cap';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-blue-600 to-blue-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">3</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                  الإجازة في علوم الحديث
                </h1>
                <p className="text-blue-100 mt-2">
                  المستوى الثالث - {totalHours} ساعة دراسية
                </p>
              </div>
            </div>
            <p className="text-blue-100 text-sm md:text-base">
              مرحلة متقدمة في دراسة علوم الحديث مع التركيز على التطبيق العملي والمناهج المتخصصة
            </p>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-amiri font-bold text-gray-800 mb-6">
            المواد الدراسية ({certificateCourses.length} مادة)
          </h2>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <i className="fas fa-spinner fa-spin text-2xl text-gray-400 ml-3"></i>
              <span>جاري تحميل المواد...</span>
            </div>
          ) : certificateCourses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-book-open text-3xl text-gray-400"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد مواد بعد</h3>
              <p className="text-gray-500">سيتم إضافة المواد قريباً</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {certificateCourses.map((course) => (
                <Link key={course.id} href={`/course/${course.id}`}>
                  <Card className="hover-scale overflow-hidden cursor-pointer">
                    <CourseImageGallery 
                      course={course}
                      className="h-20 relative"
                    />
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
                          <span>المدرس</span>
                          <span>{course.instructor}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm"
                        className="w-full bg-blue-500 text-white hover:bg-blue-600 text-xs py-1 h-6"
                      >
                        بدء الدراسة
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Requirements & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-amiri font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-list-check text-blue-600"></i>
                متطلبات القبول
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-blue-500 text-xs"></i>
                  إنهاء الدبلوم المتوسط بنجاح
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-blue-500 text-xs"></i>
                  معدل لا يقل عن 80% في المستوى السابق
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-blue-500 text-xs"></i>
                  إتقان علوم الجرح والتعديل
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-amiri font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-graduation-cap text-blue-600"></i>
                مخرجات التعلم
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  إتقان علم العلل والتخريج
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  حفظ 20 حزب من القرآن
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  التأهل لمستوى البكالوريوس
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <i className="fas fa-arrow-right ml-2"></i>
                      العودة للصفحة الرئيسية
                    </Button>
                  </Link>
                  <Link href="/diplomas" className="flex-1">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
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