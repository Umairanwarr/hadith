import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import logoPath from "@assets/logo better_1752953272174.png";

export default function LandingNew() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <img 
                src={logoPath} 
                alt="شعار الجامعة" 
                className="h-20 w-20 object-contain" 
              />
              <div className="mr-4">
                <h1 className="text-2xl font-amiri font-bold text-green-700">
                  جامعة الإمام الزُّهري
                </h1>
                <p className="text-base text-gray-700 font-medium">لإعداد علماء الحديث والمحدثين</p>
              </div>
            </div>
            
            <Button 
              onClick={handleLogin} 
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-semibold"
            >
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-l from-green-600 to-green-700 rounded-3xl text-white p-16 mb-16 shadow-2xl">
            <h2 className="text-5xl font-amiri font-bold mb-8">
              منهج متميز لإعداد علماء الحديث والمحدثين
            </h2>
            <p className="text-xl mb-8 text-green-100 leading-relaxed max-w-4xl mx-auto">
              جامعة الإمام الزُّهري تقدم برنامجاً تعليمياً شاملاً في علوم الحديث النبوي الشريف، 
              يمزج بين أصالة المنهج التراثي وحداثة التقنيات التعليمية
            </p>
            <p className="text-lg mb-10 text-green-200 max-w-3xl mx-auto">
              من الديبلوم التمهيدي إلى درجة الدكتوراه، نؤهل طلابنا ليصبحوا علماء محدثين معتمدين
            </p>
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="bg-yellow-500 text-white hover:bg-yellow-600 text-xl px-12 py-4 font-bold shadow-lg"
            >
              ابدأ رحلتك العلمية الآن
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-green-100">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-graduation-cap text-3xl text-green-600"></i>
                </div>
                <h3 className="font-amiri font-bold text-xl mb-4 text-gray-800">6 مستويات أكاديمية</h3>
                <p className="text-gray-600 leading-relaxed">
                  من الديبلوم التمهيدي إلى الدكتوراه في الدراسات الحديثية
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-green-100">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-video text-3xl text-blue-600"></i>
                </div>
                <h3 className="font-amiri font-bold text-xl mb-4 text-gray-800">محاضرات تفاعلية</h3>
                <p className="text-gray-600 leading-relaxed">
                  محاضرات مرئية عالية الجودة من نخبة علماء الحديث
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-green-100">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-certificate text-3xl text-yellow-600"></i>
                </div>
                <h3 className="font-amiri font-bold text-xl mb-4 text-gray-800">شهادات معتمدة</h3>
                <p className="text-gray-600 leading-relaxed">
                  إجازات وشهادات علمية معتمدة في علوم الحديث
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-green-100">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-users text-3xl text-purple-600"></i>
                </div>
                <h3 className="font-amiri font-bold text-xl mb-4 text-gray-800">مجتمع علمي</h3>
                <p className="text-gray-600 leading-relaxed">
                  انضم لمجتمع من الطلاب والعلماء المتخصصين
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="bg-white rounded-2xl p-12 shadow-xl border border-green-200">
            <h3 className="text-3xl font-amiri font-bold text-green-700 mb-6">
              مستعد لتبدأ رحلتك العلمية؟
            </h3>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              انضم إلى آلاف الطلاب الذين يدرسون في جامعة الإمام الزُّهري
            </p>
            <div className="flex justify-center gap-4">
              <Button 
                onClick={handleLogin}
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 text-lg font-semibold"
              >
                سجل الآن
              </Button>
              <Link href="/about-university">
                <Button 
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50 px-10 py-4 text-lg font-semibold"
                >
                  تعرف على الجامعة
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-amiri">
            جامعة الإمام الزُّهري لإعداد علماء الحديث والمحدثين
          </p>
          <p className="text-gray-400 mt-2">
            منصة تعليمية متخصصة في علوم الحديث النبوي الشريف
          </p>
        </div>
      </footer>
    </div>
  );
}