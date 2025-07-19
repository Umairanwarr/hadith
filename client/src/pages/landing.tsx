import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import logoPath from "@assets/logo better_1752953272174.png";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-[hsl(45,76%,58%)]">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-4">
              <img 
                src={logoPath} 
                alt="شعار الجامعة" 
                className="h-16 w-16 object-contain" 
              />
              <div className="mr-3">
                <h1 className="text-xl font-amiri font-bold text-[hsl(158,40%,34%)]">
                  جامعة الإمام الزُّهري
                </h1>
                <p className="text-sm text-gray-600">لإعداد علماء الحديث المحدثين</p>
              </div>
            </div>
            
            <Button onClick={handleLogin} className="btn-primary">
              تسجيل الدخول
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-l from-[hsl(158,40%,34%)] to-[hsl(158,46%,47%)] rounded-2xl text-white p-12 mb-12 islamic-pattern">
            <h2 className="text-4xl font-amiri font-bold mb-6">
              منهج غير مسبوق لإعداد علماء الحديث
            </h2>
            <p className="text-lg mb-6 text-green-100 leading-relaxed">
              في زمن باتت فيه العلوم تُتناقل في القاعات دون سند، وتُدرس في النظم الحديثة دون روح، 
              جاءت جامعة الزهري بمنهجٍ غير مسبوق يمزج بين عراقة السند وجدّة المنهج الأكاديمي
            </p>
            <p className="text-base mb-8 text-green-200">
              منهجنا لا يُقلّد، بل يُجدِّد. لا يُشابه الموجود، بل يبني هويةً جديدة لطالب العلم 
              تجمع بين الحفظ والوعي، وبين المهارة والتزكية، وبين الرواية والدراية
            </p>
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="bg-[hsl(45,76%,58%)] text-white hover:bg-yellow-600 text-lg px-8 py-3"
            >
              ابدأ رحلتك التعليمية
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="hover-scale">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[hsl(158,40%,34%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-video text-2xl text-white"></i>
                </div>
                <h3 className="font-amiri font-bold text-lg mb-2">محاضرات مرئية</h3>
                <p className="text-gray-600">
                  شاهد محاضرات تفاعلية عالية الجودة من كبار علماء الحديث
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[hsl(45,76%,58%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-clipboard-list text-2xl text-white"></i>
                </div>
                <h3 className="font-amiri font-bold text-lg mb-2">اختبارات تفاعلية</h3>
                <p className="text-gray-600">
                  قيم مستواك من خلال اختبارات شاملة واحصل على تقييم فوري
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-[hsl(158,46%,47%)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-certificate text-2xl text-white"></i>
                </div>
                <h3 className="font-amiri font-bold text-lg mb-2">شهادات معتمدة</h3>
                <p className="text-gray-600">
                  احصل على شهادات رسمية معتمدة عند إتمام كل مادة بنجاح
                </p>
              </CardContent>
            </Card>
          </div>

          {/* About Section */}
          <Card className="text-right">
            <CardContent className="p-8">
              <h3 className="font-amiri font-bold text-2xl mb-6 text-[hsl(158,40%,34%)]">
                الأركان الثمانية لبرنامجنا التعليمي
              </h3>
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="text-right p-4 border border-green-200 rounded-lg">
                  <h4 className="font-bold text-green-700 mb-2">1. الحفظ</h4>
                  <p className="text-sm text-gray-600">حفظ القرآن والمتون والأحاديث بأعلى درجات الإتقان</p>
                </div>
                <div className="text-right p-4 border border-green-200 rounded-lg">
                  <h4 className="font-bold text-green-700 mb-2">2. الشرح</h4>
                  <p className="text-sm text-gray-600">فهم النصوص بعمق عبر شروح مؤصلة ومبسطة</p>
                </div>
                <div className="text-right p-4 border border-green-200 rounded-lg">
                  <h4 className="font-bold text-green-700 mb-2">3. التطبيق العملي</h4>
                  <p className="text-sm text-gray-600">تخريج، عرض، سماع، إجازة، مشاريع علمية</p>
                </div>
                <div className="text-right p-4 border border-green-200 rounded-lg">
                  <h4 className="font-bold text-green-700 mb-2">4. علوم الآلة</h4>
                  <p className="text-sm text-gray-600">التمكين من الأدوات الأساسية مثل النحو والمصطلح وأصول الفقه</p>
                </div>
                <div className="text-right p-4 border border-green-200 rounded-lg">
                  <h4 className="font-bold text-green-700 mb-2">5. المراجعة</h4>
                  <p className="text-sm text-gray-600">خطط متابعة دورية تضمن رسوخ العلم وثبات المحفوظ</p>
                </div>
                <div className="text-right p-4 border border-green-200 rounded-lg">
                  <h4 className="font-bold text-green-700 mb-2">6. المجالسة والتزكية</h4>
                  <p className="text-sm text-gray-600">مجالس علمية مع مشايخ مسندين، تُبني فيها الشخصية والسلوك</p>
                </div>
                <div className="text-right p-4 border border-green-200 rounded-lg">
                  <h4 className="font-bold text-green-700 mb-2">7. المطالعة والتكوين الذاتي</h4>
                  <p className="text-sm text-gray-600">برنامج قراءة منتظم يُنمي استقلالية الطالب العلمية</p>
                </div>
                <div className="text-right p-4 border border-green-200 rounded-lg">
                  <h4 className="font-bold text-green-700 mb-2">8. الاختبار والتقييم</h4>
                  <p className="text-sm text-gray-600">آليات دقيقة لقياس التقدم من خلال الامتحانات والالتزام والانضباط</p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-center">
                كل مستوى يُمثّل مرحلة تربوية متكاملة، ينتقل فيها الطالب حسب اجتهاده وحضوره واجتيازه، 
                دون تقييد زمني، لينال في ختام كل مرحلة ديبلوماً علمياً مركباً
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[hsl(158,40%,34%)] text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <img 
                src={logoPath} 
                alt="شعار الجامعة" 
                className="h-12 w-12 object-contain" 
              />
              <div>
                <h5 className="font-amiri font-bold">جامعة الإمام الزُّهري</h5>
                <p className="text-sm text-green-200">لإعداد علماء الحديث المحدثين</p>
              </div>
            </div>
            <p className="text-green-200 text-sm">
              © 2024 جامعة الإمام الزُّهري. جميع الحقوق محفوظة.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
