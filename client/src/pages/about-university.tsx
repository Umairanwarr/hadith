import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Brain, 
  Users, 
  Target, 
  RefreshCw, 
  UserCheck, 
  FileText, 
  Trophy,
  Globe,
  Star,
  Award,
  GraduationCap
} from "lucide-react";

const pillars = [
  {
    number: 1,
    title: "الحفظ",
    description: "حفظ القرآن والمتون والأحاديث بأعلى درجات الإتقان",
    icon: Brain,
    color: "bg-emerald-100 text-emerald-700"
  },
  {
    number: 2,
    title: "الشرح",
    description: "فهم النصوص بعمق عبر شروح مؤصلة ومبسطة",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-700"
  },
  {
    number: 3,
    title: "التطبيق العملي",
    description: "تخريج، عرض، سماع، إجازة، مشاريع علمية",
    icon: Target,
    color: "bg-purple-100 text-purple-700"
  },
  {
    number: 4,
    title: "علوم الآلة",
    description: "التمكين من الأدوات الأساسية مثل النحو والمصطلح وأصول الفقه",
    icon: FileText,
    color: "bg-amber-100 text-amber-700"
  },
  {
    number: 5,
    title: "المراجعة",
    description: "خطط متابعة دورية تضمن رسوخ العلم وثبات المحفوظ",
    icon: RefreshCw,
    color: "bg-orange-100 text-orange-700"
  },
  {
    number: 6,
    title: "المجالسة والتزكية",
    description: "مجالس علمية مع مشايخ مسندين، تُبني فيها الشخصية والسلوك",
    icon: Users,
    color: "bg-rose-100 text-rose-700"
  },
  {
    number: 7,
    title: "المطالعة والتكوين الذاتي",
    description: "برنامج قراءة منتظم يُنمي استقلالية الطالب العلمية",
    icon: UserCheck,
    color: "bg-cyan-100 text-cyan-700"
  },
  {
    number: 8,
    title: "الاختبار والتقييم",
    description: "آليات دقيقة لقياس التقدم من خلال الامتحانات والالتزام والانضباط",
    icon: Trophy,
    color: "bg-indigo-100 text-indigo-700"
  }
];

export default function AboutUniversity() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center space-x-3 space-x-reverse">
                <img 
                  src="/attached_assets/logo better_1752953272174.png" 
                  alt="شعار الجامعة" 
                  className="h-10 w-auto"
                />
                <div className="text-right">
                  <h1 className="text-lg font-bold text-emerald-800">جامعة الإمام الزُّهري</h1>
                  <p className="text-xs text-emerald-600">للعلوم الحديثية</p>
                </div>
              </div>
            </Link>
            
            <div className="flex items-center space-x-4 space-x-reverse">
              {isAuthenticated ? (
                <>
                  <Link href="/">
                    <Button variant="ghost" className="text-emerald-700 hover:text-emerald-800">
                      الرئيسية
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      الملف الشخصي
                    </Button>
                  </Link>
                </>
              ) : (
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  تسجيل الدخول
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <img 
              src="/attached_assets/logo better_1752953272174.png" 
              alt="شعار الجامعة" 
              className="h-20 w-auto mx-4"
            />
            <div className="text-right">
              <h1 className="text-4xl font-bold text-emerald-900 mb-2">
                عن جامعة الإمام الزُّهري
              </h1>
              <p className="text-xl text-emerald-700">
                للعلوم الحديثية والدراسات الإسلامية
              </p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="flex items-center justify-center mb-6">
              <Globe className="h-8 w-8 text-emerald-600 ml-3" />
              <h2 className="text-2xl font-bold text-emerald-900">جامعة فريدة من نوعها</h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 text-right">
              <div>
                <h3 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center justify-end">
                  <Star className="h-5 w-5 text-amber-500 ml-2" />
                  تميزنا العالمي
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  جامعة الإمام الزُّهري هي الجامعة الوحيدة في العالم المتخصصة بالكامل في علوم الحديث النبوي الشريف، 
                  تجمع تحت سقفها أفضل علماء الحديث والمحدثين المسندين من جميع أنحاء العالم الإسلامي.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center justify-end">
                  <Award className="h-5 w-5 text-emerald-600 ml-2" />
                  رسالتنا
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  نسعى لإعداد جيل جديد من علماء الحديث المتخصصين على منهج الأئمة المحدثين الأوائل، 
                  بأحدث الوسائل التعليمية وأعمق المناهج العلمية المؤصلة.
                </p>
              </div>
            </div>
          </div>

          {/* Partnership */}
          <div className="bg-emerald-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <GraduationCap className="h-6 w-6 text-emerald-700 ml-2" />
              <h3 className="text-xl font-bold text-emerald-900">شراكة أكاديمية مميزة</h3>
            </div>
            <p className="text-emerald-800 text-lg">
              بالتعاون مع <strong>الرابطة العالمية للمحدثين المسندين</strong>
            </p>
            <p className="text-emerald-700 mt-2">
              لضمان أعلى معايير الجودة الأكاديمية والإسناد العلمي
            </p>
          </div>
        </div>

        {/* Eight Pillars */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-emerald-900 mb-4">
              الأركان الثمانية لبرنامجنا التعليمي
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              منهجية تعليمية شاملة ومتكاملة، تعتمد على ثمانية أركان أساسية لتكوين الطالب تكويناً علمياً وتربوياً متميزاً
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar) => (
              <Card key={pillar.number} className="hover:shadow-lg transition-shadow duration-300 border-emerald-100">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 rounded-full ${pillar.color} flex items-center justify-center mx-auto mb-4`}>
                    <pillar.icon className="h-8 w-8" />
                  </div>
                  <Badge variant="secondary" className="w-8 h-8 rounded-full p-0 flex items-center justify-center mx-auto mb-2">
                    {pillar.number}
                  </Badge>
                  <CardTitle className="text-lg font-bold text-emerald-900 text-right">
                    {pillar.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-right text-gray-700 leading-relaxed">
                    {pillar.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Educational Philosophy */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h3 className="text-2xl font-bold text-emerald-900 mb-6 text-center">
            فلسفة التعليم المرن والمتدرج
          </h3>
          <div className="bg-emerald-50 rounded-lg p-6 text-right">
            <p className="text-lg text-emerald-800 leading-relaxed">
              كل مستوى يُمثّل مرحلة تربوية متكاملة، ينتقل فيها الطالب حسب اجتهاده وحضوره واجتيازه، 
              دون تقييد زمني، لينال في ختام كل مرحلة ديبلوماً علمياً مركباً
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-4">انضم إلى رحلة العلم</h3>
            <p className="text-lg mb-6">
              كن جزءاً من النهضة العلمية الحديثية المعاصرة
            </p>
            <div className="flex justify-center space-x-4 space-x-reverse">
              <Link href="/">
                <Button 
                  size="lg" 
                  className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold"
                >
                  استكشف الدبلومات
                </Button>
              </Link>
              {!isAuthenticated && (
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-emerald-700"
                  onClick={() => window.location.href = '/api/login'}
                >
                  ابدأ التعلم الآن
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 px-4 py-2 shadow-lg">
        <div className="flex justify-center space-x-8 space-x-reverse max-w-md mx-auto">
          <Link href="/" className="flex flex-col items-center">
            <div className="p-2 rounded-full text-emerald-600 hover:bg-emerald-50">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xs text-emerald-600 mt-1">الرئيسية</span>
          </Link>
          
          {isAuthenticated && (
            <>
              <Link href="/profile" className="flex flex-col items-center">
                <div className="p-2 rounded-full text-gray-500 hover:bg-gray-50">
                  <Users className="h-5 w-5" />
                </div>
                <span className="text-xs text-gray-500 mt-1">الملف</span>
              </Link>
              
              <Link href="/certificates" className="flex flex-col items-center">
                <div className="p-2 rounded-full text-gray-500 hover:bg-gray-50">
                  <Trophy className="h-5 w-5" />
                </div>
                <span className="text-xs text-gray-500 mt-1">الشهادات</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}