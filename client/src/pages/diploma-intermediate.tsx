import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function DiplomaIntermediatePage() {
  const subjects = [
    { id: 1, title: "حفظ عشرة أحزاب من القرآن", icon: "fas fa-quran", hours: 25 },
    { id: 2, title: "حفظ السلسلة الذهبية", icon: "fas fa-link", hours: 15 },
    { id: 3, title: "عمدة الأحكام", icon: "fas fa-gavel", hours: 20 },
    { id: 4, title: "شبهات حول السنة", icon: "fas fa-shield-alt", hours: 12 },
    { id: 5, title: "تاريخ الصحابة والتابعين", icon: "fas fa-users", hours: 18 },
    { id: 6, title: "تفسير عشرة أحزاب", icon: "fas fa-book-open", hours: 25 },
    { id: 7, title: "اللغة العربية", icon: "fas fa-font", hours: 15 },
    { id: 8, title: "علم المناعة الحضارية", icon: "fas fa-globe", hours: 10 },
    { id: 9, title: "المهارات التطبيقية", icon: "fas fa-tools", hours: 12 },
    { id: 10, title: "علم طبقات المحدثين", icon: "fas fa-layer-group", hours: 15 },
    { id: 11, title: "علم الجرح والتعديل", icon: "fas fa-balance-scale", hours: 13 }
  ];

  const totalHours = subjects.reduce((sum, subject) => sum + subject.hours, 0);

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

        {/* Subjects Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-amiri font-bold text-gray-800 mb-6">
            المواد الدراسية ({subjects.length} مادة)
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {subjects.map((subject, index) => (
              <Card key={subject.id} className="hover-scale overflow-hidden cursor-pointer">
                <div className="h-20 bg-gradient-to-br from-orange-400 to-orange-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
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
                    <span>15 محاضرة</span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>التقدم</span>
                      <span>0%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div className="bg-orange-600 h-1 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <Button 
                    size="sm"
                    className="w-full bg-orange-500 text-white hover:bg-orange-600 text-xs py-1 h-6"
                  >
                    بدء الدراسة
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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