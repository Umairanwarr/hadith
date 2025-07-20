import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function DiplomaMasterPage() {
  const subjects = [
    { id: 1, courseId: 1, title: "حفظ 40 حزب", icon: "fas fa-quran", hours: 45 },
    { id: 2, courseId: 2, title: "حفظ 700 حديث إجمالاً", icon: "fas fa-bookmark", hours: 50 },
    { id: 3, courseId: 3, title: "تفسير 40 حزب من القرآن", icon: "fas fa-book-open", hours: 50 },
    { id: 4, courseId: 4, title: "مناهج التصنيف في السنة", icon: "fas fa-layer-group", hours: 25 },
    { id: 5, courseId: 5, title: "مختلف الحديث", icon: "fas fa-code-branch", hours: 22 },
    { id: 6, courseId: 6, title: "علم الأنساب والقبائل", icon: "fas fa-sitemap", hours: 20 },
    { id: 7, courseId: 1, title: "تاريخ المحدثين المعاصرين وطرقهم إلى الأئمة", icon: "fas fa-users-cog", hours: 28 },
    { id: 8, courseId: 2, title: "فقه الأئمة الأربعة", icon: "fas fa-gavel", hours: 30 },
    { id: 9, courseId: 3, title: "علم الجدل", icon: "fas fa-comments", hours: 18 },
    { id: 10, courseId: 4, title: "مناهج وطرق البحث العلمي", icon: "fas fa-search", hours: 25 },
    { id: 11, courseId: 5, title: "رسالة الماجستير", icon: "fas fa-file-alt", hours: 47 }
  ];

  const totalHours = subjects.reduce((sum, subject) => sum + subject.hours, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-yellow-600 to-yellow-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">5</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                  ماجستير عالم بالحديث
                </h1>
                <p className="text-yellow-100 mt-2">
                  المستوى الخامس - {totalHours} ساعة دراسية
                </p>
              </div>
            </div>
            <p className="text-yellow-100 text-sm md:text-base">
              درجة الماجستير المتقدمة في علوم الحديث مع إعداد رسالة بحثية متخصصة
            </p>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-amiri font-bold text-gray-800 mb-6">
            المواد الدراسية ({subjects.length} مادة)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((subject, index) => (
              <Link key={subject.id} href={`/course/${subject.courseId}`}>
                <Card className="hover-scale overflow-hidden cursor-pointer">
                  <div className="h-20 bg-gradient-to-br from-yellow-400 to-yellow-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10 text-center">
                    <i className={`${subject.icon} text-sm mb-1`}></i>
                    <h4 className="font-amiri text-xs font-bold opacity-95 px-1 leading-tight">
                      {subject.title.length > 25 ? subject.title.substring(0, 25) + '...' : subject.title}
                    </h4>
                  </div>
                </div>
                <CardContent className="p-3">
                  <h4 className="font-amiri font-bold text-sm mb-2 truncate">
                    {subject.title}
                  </h4>
                  <div className="flex justify-between items-center text-xs text-gray-600 mb-3">
                    <span>{subject.hours} ساعة</span>
                    <span>25 محاضرة</span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>التقدم</span>
                      <span>0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-yellow-600 h-1 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="w-full bg-yellow-500 text-white hover:bg-yellow-600 text-xs py-1 h-6"
                  >
                    بدء الدراسة
                  </Button>
                </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Requirements & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-amiri font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-list-check text-yellow-600"></i>
                متطلبات القبول
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-yellow-500 text-xs"></i>
                  إنهاء البكالوريوس في علم الحديث بنجاح
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-yellow-500 text-xs"></i>
                  معدل لا يقل عن 88% في المستوى السابق
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-yellow-500 text-xs"></i>
                  إتقان مناهج المحدثين والبحث العلمي
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-amiri font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-graduation-cap text-yellow-600"></i>
                مخرجات التعلم
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  إعداد رسالة ماجستير متخصصة
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  حفظ 40 حزب من القرآن
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  التأهل لمستوى الدكتوراه
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
            <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
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