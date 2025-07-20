import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function DiplomaDoctoratePage() {
  const subjects = [
    { id: 1, title: "حفظ القرآن كاملاً", icon: "fas fa-quran", hours: 60 },
    { id: 2, title: "حفظ 1000 حديث إجمالاً", icon: "fas fa-bookmark", hours: 70 },
    { id: 3, title: "تفسير القرآن كاملاً", icon: "fas fa-book-open", hours: 80 },
    { id: 4, title: "إجازات الكتب التسعة", icon: "fas fa-certificate", hours: 60 },
    { id: 5, title: "كتابة رسالة الدكتوراه", icon: "fas fa-file-alt", hours: 110 }
  ];

  const totalHours = subjects.reduce((sum, subject) => sum + subject.hours, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-red-600 to-red-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold">6</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                  دكتور في الدراسات الحديثية
                </h1>
                <p className="text-red-100 mt-2">
                  المستوى السادس - {totalHours} ساعة دراسية
                </p>
              </div>
            </div>
            <p className="text-red-100 text-sm md:text-base">
              أعلى درجة أكاديمية في علوم الحديث مع التركيز على البحث المتقدم والإجازات العلمية
            </p>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-amiri font-bold text-gray-800 mb-6">
            المواد الدراسية ({subjects.length} مواد)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subjects.map((subject, index) => (
              <Card key={subject.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${subject.icon} text-red-600 text-lg`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="w-8 h-8 bg-red-600 text-white text-sm rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h3 className="font-amiri font-bold text-gray-800 text-base">
                          {subject.title}
                        </h3>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <span className="font-medium">{subject.hours} ساعة دراسية</span>
                        <span className="text-red-600 font-medium">متطلب أساسي</span>
                      </div>
                      {subject.id === 5 && (
                        <p className="text-xs text-gray-500 mt-2">
                          تتضمن البحث والكتابة والمناقشة والدفاع عن الرسالة
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Special Requirements */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardContent className="p-6">
            <h3 className="font-amiri font-bold text-lg text-red-800 mb-4 flex items-center gap-2">
              <i className="fas fa-crown text-red-600"></i>
              متطلبات خاصة لمستوى الدكتوراه
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-bold text-red-700 mb-2">متطلبات الحفظ:</h4>
                <ul className="space-y-1 text-sm text-red-600">
                  <li>• حفظ القرآن الكريم كاملاً بالتجويد</li>
                  <li>• حفظ 1000 حديث شريف مع أسانيدها</li>
                  <li>• إتقان المتون الحديثية الأساسية</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-red-700 mb-2">متطلبات البحث:</h4>
                <ul className="space-y-1 text-sm text-red-600">
                  <li>• إعداد رسالة دكتوراه أصيلة</li>
                  <li>• الحصول على إجازات الكتب التسعة</li>
                  <li>• نشر بحوث علمية محكمة</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements & Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-amiri font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-list-check text-red-600"></i>
                متطلبات القبول
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-red-500 text-xs"></i>
                  إنهاء الماجستير بامتياز
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-red-500 text-xs"></i>
                  معدل لا يقل عن 90%
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-red-500 text-xs"></i>
                  موافقة لجنة القبول
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-red-500 text-xs"></i>
                  تحديد موضوع الرسالة
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-amiri font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                <i className="fas fa-graduation-cap text-red-600"></i>
                مخرجات التعلم
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  خبير في علوم الحديث
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  أهلية التدريس الجامعي
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  قدرة على البحث والتأليف
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-star text-yellow-500 text-xs"></i>
                  إجازة في الكتب التسعة
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
            <Button className="w-full bg-red-600 hover:bg-red-700">
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