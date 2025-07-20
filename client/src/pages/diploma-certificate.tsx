import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function DiplomaCertificatePage() {
  const subjects = [
    { id: 1, title: "حفظ 20 حزب من القرآن", icon: "fas fa-quran", hours: 30 },
    { id: 2, title: "حفظ 200 حديث", icon: "fas fa-bookmark", hours: 25 },
    { id: 3, title: "التاريخ الإسلامي", icon: "fas fa-mosque", hours: 20 },
    { id: 4, title: "التفسير لـ 20 حزب", icon: "fas fa-book-open", hours: 30 },
    { id: 5, title: "الذكاء الاصطناعي", icon: "fas fa-robot", hours: 15 },
    { id: 6, title: "المهارات التطبيقية", icon: "fas fa-tools", hours: 15 },
    { id: 7, title: "مناهج المفسرين", icon: "fas fa-users-cog", hours: 18 },
    { id: 8, title: "علم العلل", icon: "fas fa-search", hours: 22 },
    { id: 9, title: "علم التخريج", icon: "fas fa-filter", hours: 20 },
    { id: 10, title: "أصول التفسير وقواعده", icon: "fas fa-cogs", hours: 18 },
    { id: 11, title: "القواعد الفقهية", icon: "fas fa-gavel", hours: 17 }
  ];

  const totalHours = subjects.reduce((sum, subject) => sum + subject.hours, 0);

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
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className={`${subject.icon} text-blue-600`}></i>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <h3 className="font-amiri font-bold text-gray-800 text-sm">
                          {subject.title}
                        </h3>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-600">
                        <span>{subject.hours} ساعة</span>
                        <span className="text-blue-600">يتطلب إنهاء المستوى الثاني</span>
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
          <Link href="/dashboard" className="flex-1">
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