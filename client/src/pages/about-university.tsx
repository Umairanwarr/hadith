import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";

const pillars = [
  {
    number: 1,
    title: "الحفظ",
    description: "حفظ القرآن والمتون والأحاديث بأعلى درجات الإتقان",
    icon: "🧠",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700"
  },
  {
    number: 2,
    title: "الشرح", 
    description: "فهم النصوص بعمق عبر شروح مؤصلة ومبسطة",
    icon: "📖",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    number: 3,
    title: "التطبيق العملي",
    description: "تخريج، عرض، سماع، إجازة، مشاريع علمية",
    icon: "🎯",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700"
  },
  {
    number: 4,
    title: "علوم الآلة",
    description: "التمكين من الأدوات الأساسية مثل النحو والمصطلح وأصول الفقه",
    icon: "⚙️",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700"
  },
  {
    number: 5,
    title: "المراجعة",
    description: "خطط متابعة دورية تضمن رسوخ العلم وثبات المحفوظ",
    icon: "🔄",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700"
  },
  {
    number: 6,
    title: "المجالسة والتزكية",
    description: "مجالس علمية مع مشايخ مسندين، تُبني فيها الشخصية والسلوك",
    icon: "👥",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    textColor: "text-rose-700"
  },
  {
    number: 7,
    title: "المطالعة والتكوين الذاتي",
    description: "برنامج قراءة منتظم يُنمي استقلالية الطالب العلمية",
    icon: "📚",
    bgColor: "bg-cyan-50",
    borderColor: "border-cyan-200",
    textColor: "text-cyan-700"
  },
  {
    number: 8,
    title: "الاختبار والتقييم",
    description: "آليات دقيقة لقياس التقدم من خلال الامتحانات والالتزام والانضباط",
    icon: "🏆",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-700"
  }
];

export default function AboutUniversity() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden p-8">
            <h1 className="font-amiri font-bold text-gray-800 pl-[4px] pr-[4px] pt-[28px] pb-[28px] mt-[12px] mb-[12px] text-[30px]">جامعة الإمام الزُهري
             لإعداد علماء الحديث والمحدثين</h1>
            
            {/* University Info Cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-6 text-right">
                  <div className="flex items-center justify-end gap-3 mb-4">
                    <h3 className="text-lg font-bold text-emerald-800">🌟 تميزنا العالمي</h3>
                  </div>
                  <p className="text-emerald-700 leading-relaxed">
                    جامعة الإمام الزُّهري هي الجامعة الوحيدة في العالم المتخصصة بالكامل في علوم الحديث النبوي الشريف، 
                    تجمع تحت سقفها أفضل علماء الحديث والمحدثين المسندين من جميع أنحاء العالم الإسلامي.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6 text-right">
                  <div className="flex items-center justify-end gap-3 mb-4">
                    <h3 className="text-lg font-bold text-blue-800">🎯 رسالتنا</h3>
                  </div>
                  <p className="text-blue-700 leading-relaxed">
                    نسعى لإعداد جيل جديد من علماء الحديث المتخصصين على منهج الأئمة المحدثين الأوائل، 
                    بأحدث الوسائل التعليمية وأعمق المناهج العلمية المؤصلة.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Partnership */}
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <h3 className="text-xl font-bold text-green-800 mb-3">
                🤝 شراكة أكاديمية مميزة
              </h3>
              <p className="text-green-700 text-lg">
                بالتعاون مع <strong>الرابطة العالمية للمحدثين المسندين</strong>
              </p>
              <p className="text-green-600 mt-2">
                لضمان أعلى معايير الجودة الأكاديمية والإسناد العلمي
              </p>
            </div>
          </div>
        </section>

        {/* Eight Pillars */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-amiri font-bold text-gray-800 mb-4">
              الأركان الثمانية لبرنامجنا التعليمي
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              منهجية تعليمية شاملة ومتكاملة، تعتمد على ثمانية أركان أساسية لتكوين الطالب تكويناً علمياً وتربوياً متميزاً
            </p>
          </div>

          <div className="grid md:grid-cols-4 lg:grid-cols-8 gap-3">
            {pillars.map((pillar) => (
              <Card key={pillar.number} className={`${pillar.borderColor} ${pillar.bgColor} hover-scale`}>
                <CardContent className="p-3 text-center">
                  <div className="text-2xl mb-2">{pillar.icon}</div>
                  <div className="mb-2">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full bg-white ${pillar.textColor} font-bold text-sm mb-2`}>
                      {pillar.number}
                    </span>
                  </div>
                  <h3 className={`text-sm font-amiri font-bold ${pillar.textColor} mb-2`}>
                    {pillar.title}
                  </h3>
                  <p className={`${pillar.textColor} opacity-80 text-xs leading-relaxed`}>
                    {pillar.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Educational Philosophy */}
        <section className="mb-12">
          <Card className="border-gray-200 bg-white shadow-lg">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-amiri font-bold text-gray-800 mb-6">
                فلسفة التعليم المرن والمتدرج
              </h3>
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <p className="text-lg text-green-800 leading-relaxed">
                  كل مستوى يُمثّل مرحلة تربوية متكاملة، ينتقل فيها الطالب حسب اجتهاده وحضوره واجتيازه، 
                  دون تقييد زمني، لينال في ختام كل مرحلة ديبلوماً علمياً مركباً
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section>
          <Card className="bg-gradient-to-r from-green-600 to-green-800 border-none">
            <CardContent className="p-8 text-center text-white">
              <h3 className="text-2xl font-amiri font-bold mb-4">انضم إلى رحلة العلم</h3>
              <p className="text-lg mb-6 opacity-90">
                كن جزءاً من النهضة العلمية الحديثية المعاصرة
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => window.location.href = '/'}
                  className="bg-white text-green-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  استكشف الدبلومات
                </button>
                <button 
                  onClick={() => window.location.href = '/api/login'}
                  className="border-2 border-white text-white hover:bg-white hover:text-green-700 font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  ابدأ التعلم الآن
                </button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
      <Footer />
    </div>
  );
}