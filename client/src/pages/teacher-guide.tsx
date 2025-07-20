import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function TeacherGuidePage() {
  const quickActions = [
    {
      title: "إضافة مادة جديدة",
      description: "أنشئ مادة دراسية جديدة للطلاب",
      icon: "fas fa-plus-circle",
      link: "/admin/create-course",
      color: "green"
    },
    {
      title: "إدارة المواد الموجودة",
      description: "عدل المواد وأضف فيديوهات ودروس",
      icon: "fas fa-edit",
      link: "/admin",
      color: "blue"
    },
    {
      title: "إنشاء امتحان",
      description: "أضف امتحانات وأسئلة تقييمية",
      icon: "fas fa-clipboard-list",
      link: "/admin/create-exam",
      color: "purple"
    },
    {
      title: "مراجعة الطلاب",
      description: "تابع تقدم الطلاب والإحصائيات",
      icon: "fas fa-chart-line",
      link: "/admin",
      color: "orange"
    }
  ];

  const videoGuide = [
    {
      step: "1",
      title: "تحديد المادة",
      description: "اختر المادة التي تريد إضافة فيديو لها من لوحة الإدارة"
    },
    {
      step: "2", 
      title: "إضافة درس جديد",
      description: "اضغط 'إضافة درس جديد' وأدخل عنوان الدرس ووصفه"
    },
    {
      step: "3",
      title: "إضافة رابط الفيديو",
      description: "أدخل رابط YouTube أو Vimeo أو أي رابط فيديو مباشر"
    },
    {
      step: "4",
      title: "تحديد المدة",
      description: "أدخل مدة الفيديو بالدقائق لتتبع تقدم الطلاب بدقة"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-indigo-600 to-indigo-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-chalkboard-teacher text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                  دليل المعلم
                </h1>
                <p className="text-indigo-100 mt-2">
                  دليل شامل لإدارة المحتوى التعليمي بسهولة
                </p>
              </div>
            </div>
            <p className="text-indigo-100 text-sm md:text-base">
              تعلم كيفية إضافة وإدارة المواد الدراسية والفيديوهات والامتحانات في نظام الجامعة
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="mb-12">
          <h2 className="text-xl font-amiri font-bold text-gray-800 mb-6">
            الإجراءات السريعة
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.link}>
                <Card className="hover-scale overflow-hidden cursor-pointer h-full">
                  <div className={`h-16 bg-gradient-to-br from-${action.color}-400 to-${action.color}-500 flex items-center justify-center text-white relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10">
                      <i className={`${action.icon} text-2xl`}></i>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-amiri font-bold text-sm mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-xs">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Video Upload Guide */}
        <section className="mb-12">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-amiri font-bold text-gray-800 mb-6 flex items-center gap-2">
                <i className="fas fa-video text-red-600"></i>
                كيفية إضافة فيديوهات تعليمية
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {videoGuide.map((step, index) => (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-indigo-700">{step.step}</span>
                      </div>
                      <div>
                        <h4 className="font-amiri font-bold text-sm text-gray-800 mb-1">
                          {step.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < videoGuide.length - 1 && (
                      <div className="hidden lg:block absolute top-4 left-[-10px] w-8 h-0.5 bg-indigo-200"></div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Platform Features */}
        <section className="mb-12">
          <h2 className="text-xl font-amiri font-bold text-gray-800 mb-6">
            ميزات النظام
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-amiri font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-graduation-cap text-green-600"></i>
                  إدارة المواد الدراسية
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500 text-xs"></i>
                    إضافة مواد جديدة بسهولة
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500 text-xs"></i>
                    تعديل المحتوى في أي وقت
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500 text-xs"></i>
                    تنظيم الدروس بترتيب منطقي
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-500 text-xs"></i>
                    دعم الفيديوهات من مصادر متعددة
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-amiri font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <i className="fas fa-chart-bar text-blue-600"></i>
                  التقارير والإحصائيات
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-blue-500 text-xs"></i>
                    متابعة تقدم الطلاب
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-blue-500 text-xs"></i>
                    إحصائيات التسجيل والإكمال
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-blue-500 text-xs"></i>
                    تقارير الامتحانات والدرجات
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-blue-500 text-xs"></i>
                    تحليل أداء المواد
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Support and Help */}
        <section className="mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-question-circle text-blue-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="font-amiri font-bold text-lg text-blue-800">
                    هل تحتاج مساعدة؟
                  </h3>
                  <p className="text-blue-600 text-sm">
                    نحن هنا لمساعدتك في استخدام النظام بفعالية
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/admin">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                    <i className="fas fa-tachometer-alt ml-2"></i>
                    لوحة الإدارة
                  </Button>
                </Link>
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  <i className="fas fa-book ml-2"></i>
                  الدليل الكامل
                </Button>
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  <i className="fas fa-envelope ml-2"></i>
                  تواصل معنا
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
}