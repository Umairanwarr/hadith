import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function DiplomaPreparatoryPage() {
  const subjects = [
    { id: 1, title: "حفظ جزء عم و جزء تبارك", icon: "fas fa-quran", hours: 20 },
    { id: 2, title: "إجازة حفظ الأربعين النووية", icon: "fas fa-certificate", hours: 15 },
    { id: 3, title: "دراسة كتاب نخبة الفكر", icon: "fas fa-book", hours: 12 },
    { id: 4, title: "شرح أحاديث الأربعين النووية", icon: "fas fa-comments", hours: 18 },
    { id: 5, title: "دراسة متن الأجرومية", icon: "fas fa-language", hours: 10 },
    { id: 6, title: "السيرة النبوية", icon: "fas fa-user-circle", hours: 15 },
    { id: 7, title: "تفسير القرآن جزء عم و تبارك", icon: "fas fa-book-open", hours: 20 },
    { id: 8, title: "اللغة العربية", icon: "fas fa-font", hours: 8 },
    { id: 9, title: "أهمية دراسة علم الحديث", icon: "fas fa-star", hours: 6 },
    { id: 10, title: "المهارات التطبيقية", icon: "fas fa-tools", hours: 8 },
    { id: 11, title: "آداب طالب العلم", icon: "fas fa-heart", hours: 8 }
  ];

  const totalHours = subjects.reduce((sum, subject) => sum + subject.hours, 0);

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
            المواد الدراسية ({subjects.length} مادة)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject, index) => (
              <Card key={subject.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${subject.icon} text-green-600`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-green-600 text-white text-xs rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h3 className="font-amiri font-bold text-gray-800 text-sm">
                          {subject.title}
                        </h3>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>{subject.hours} ساعة</span>
                        <span className="text-green-600">متاح للتسجيل</span>
                      </div>
                    </div>
                  </div>
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