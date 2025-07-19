import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Link } from "wouter";
import logo_2 from "@assets/logo better_1752953272174.png";

interface DiplomaSample {
  id: string;
  title: string;
  level: string;
  description: string;
  hours: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

const diplomaSamples: DiplomaSample[] = [
  {
    id: 'preparatory',
    title: 'الديبلوم التحضيري في علوم الحديث',
    level: 'المستوى الأول',
    description: 'الأساسات والمبادئ الأولى في علم الحديث النبوي الشريف',
    hours: 120,
    color: 'text-blue-800',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
    borderColor: 'border-blue-300'
  },
  {
    id: 'intermediate',
    title: 'الديبلوم المتوسط في علوم الحديث',
    level: 'المستوى الثاني',
    description: 'التعمق في دراسة الأسانيد والمتون والرجال',
    hours: 180,
    color: 'text-green-800',
    bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
    borderColor: 'border-green-300'
  },
  {
    id: 'certificate',
    title: 'شهادة في علوم الحديث',
    level: 'المستوى الثالث',
    description: 'الدراسات المتقدمة في علل الحديث والجرح والتعديل',
    hours: 240,
    color: 'text-purple-800',
    bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
    borderColor: 'border-purple-300'
  },
  {
    id: 'bachelor',
    title: 'بكالوريوس في علم الحديث',
    level: 'المستوى الرابع',
    description: 'الدراسة الشاملة للحديث النبوي وعلومه المختلفة',
    hours: 300,
    color: 'text-yellow-800',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    borderColor: 'border-yellow-300'
  },
  {
    id: 'master',
    title: 'ماجستير العالمية في الحديث',
    level: 'المستوى الخامس',
    description: 'البحث والتحقيق في المخطوطات والدراسات المتخصصة',
    hours: 360,
    color: 'text-red-800',
    bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
    borderColor: 'border-red-300'
  },
  {
    id: 'doctorate',
    title: 'دكتوراه في دراسات الحديث',
    level: 'المستوى السادس',
    description: 'أعلى المراتب العلمية في التخصص والبحث الأكاديمي',
    hours: 480,
    color: 'text-gray-800',
    bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
    borderColor: 'border-gray-300'
  }
];

export default function DiplomaSamples() {
  return (
    <div className="min-h-screen bg-green-50">
      <Header />
      
      <div className="container mx-auto px-4 py-6 mt-20 mb-20">
        {/* Page Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-6 gap-2">
              <i className="fas fa-arrow-right"></i>
              العودة للرئيسية
            </Button>
          </Link>
          
          <h1 className="font-amiri font-bold text-3xl text-green-800 mb-4">
            نماذج الديبلومات الجامعية
          </h1>
          <p className="text-green-700 text-lg max-w-3xl mx-auto leading-relaxed">
            نماذج شهادات جامعة الإمام الزُّهري للعلوم الشرعية - تخصص علوم الحديث النبوي الشريف
          </p>
        </div>

        {/* University Logo Section */}
        <div className="text-center mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md mx-auto">
            <img 
              src={logo_2} 
              alt="شعار جامعة الإمام الزُّهري" 
              className="h-32 w-32 object-contain mx-auto mb-4"
            />
            <h2 className="font-amiri font-bold text-xl text-gray-800 mb-2">
              جامعة الإمام الزُّهري
            </h2>
            <p className="text-gray-600 text-sm">
              للعلوم الشرعية وعلوم الحديث النبوي
            </p>
          </div>
        </div>

        {/* Diploma Samples Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {diplomaSamples.map((diploma) => (
            <Card key={diploma.id} className={`${diploma.bgColor} ${diploma.borderColor} border-2 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden`}>
              <CardContent className="p-0">
                {/* Diploma Header */}
                <div className="bg-white bg-opacity-80 p-6 border-b-2 border-yellow-300">
                  <div className="flex items-center justify-between mb-4">
                    <img 
                      src={logo_2} 
                      alt="شعار الجامعة" 
                      className="h-16 w-16 object-contain"
                    />
                    <div className="text-right">
                      <h3 className="font-amiri font-bold text-sm text-gray-600 mb-1">
                        جامعة الإمام الزُّهري
                      </h3>
                      <p className="text-xs text-gray-500">
                        للعلوم الشرعية وعلوم الحديث
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h2 className="font-amiri font-bold text-xl mb-2 text-gray-800">
                      شـهـادة
                    </h2>
                    <div className="w-24 h-0.5 bg-yellow-400 mx-auto"></div>
                  </div>
                </div>

                {/* Diploma Content */}
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${diploma.color} bg-white bg-opacity-70 mb-3`}>
                      {diploma.level}
                    </div>
                    <h3 className="font-amiri font-bold text-lg mb-2 text-gray-800 leading-relaxed">
                      {diploma.title}
                    </h3>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">
                      {diploma.description}
                    </p>
                  </div>

                  {/* Certificate Text */}
                  <div className="bg-white bg-opacity-60 rounded-lg p-4 mb-4 text-center">
                    <p className="text-gray-700 text-sm leading-relaxed font-amiri">
                      تشهد جامعة الإمام الزُّهري للعلوم الشرعية بأن الطالب/ة
                    </p>
                    <div className="border-b-2 border-dotted border-gray-400 my-3 mx-8"></div>
                    <p className="text-gray-700 text-sm leading-relaxed font-amiri">
                      قد أتم/ت بنجاح متطلبات الحصول على هذه الشهادة
                      <br />
                      بعدد ساعات تدريبية: <span className="font-bold">{diploma.hours} ساعة</span>
                    </p>
                  </div>

                  {/* Signature Section */}
                  <div className="flex justify-between items-end text-xs text-gray-600">
                    <div className="text-center">
                      <div className="border-b border-gray-400 w-20 mb-1"></div>
                      <p>التوقيع</p>
                    </div>
                    <div className="text-center">
                      <div className="border-b border-gray-400 w-20 mb-1"></div>
                      <p>التاريخ</p>
                    </div>
                  </div>
                </div>

                {/* Diploma Footer */}
                <div className="bg-white bg-opacity-80 p-3 text-center border-t-2 border-yellow-300">
                  <p className="text-xs text-gray-600 font-amiri">
                    صادرة من جامعة الإمام الزُّهري للعلوم الشرعية - تخصص علوم الحديث النبوي الشريف
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Information */}
        <Card className="mt-12 max-w-4xl mx-auto bg-white shadow-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="font-amiri font-bold text-xl text-gray-800 mb-4">
                مميزات شهادات جامعة الإمام الزُّهري
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-certificate text-green-600 text-2xl"></i>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">معتمدة أكاديمياً</h4>
                  <p className="text-gray-600 text-sm">شهادات معترف بها من الجهات العلمية المختصة</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-mosque text-blue-600 text-2xl"></i>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">منهج أصيل</h4>
                  <p className="text-gray-600 text-sm">مناهج دراسية متخصصة في علوم الحديث الشريف</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-award text-yellow-600 text-2xl"></i>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">جودة عالية</h4>
                  <p className="text-gray-600 text-sm">معايير تعليمية عالية ومتابعة دقيقة للطلاب</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}