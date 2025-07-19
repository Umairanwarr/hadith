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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {diplomaSamples.map((diploma) => (
            <div key={diploma.id} className="relative">
              {/* Diploma Frame */}
              <div className="relative bg-white border-8 border-yellow-600 shadow-2xl transform hover:scale-105 transition-transform duration-300" style={{aspectRatio: '8.5/11'}}>
                {/* Decorative Border */}
                <div className="absolute inset-4 border-4 border-double border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50">
                  {/* Corner Decorations */}
                  <div className="absolute top-2 left-2 w-8 h-8 border-l-4 border-t-4 border-yellow-600"></div>
                  <div className="absolute top-2 right-2 w-8 h-8 border-r-4 border-t-4 border-yellow-600"></div>
                  <div className="absolute bottom-2 left-2 w-8 h-8 border-l-4 border-b-4 border-yellow-600"></div>
                  <div className="absolute bottom-2 right-2 w-8 h-8 border-r-4 border-b-4 border-yellow-600"></div>
                  
                  {/* Header Section */}
                  <div className="p-6 text-center border-b-2 border-yellow-400">
                    {/* University Logo */}
                    <div className="mb-4">
                      <img 
                        src={logo_2} 
                        alt="شعار الجامعة" 
                        className="h-20 w-20 object-contain mx-auto"
                      />
                    </div>
                    
                    {/* University Name */}
                    <h2 className="font-amiri font-bold text-lg text-gray-800 mb-1">
                      جامعة الإمام الزُّهري
                    </h2>
                    <p className="text-sm text-gray-600 mb-3">
                      للعلوم الشرعية وعلوم الحديث النبوي الشريف
                    </p>
                    
                    {/* Certificate Title */}
                    <div className="relative">
                      <h1 className="font-amiri font-bold text-2xl text-yellow-700 mb-2">
                        شـهـادة
                      </h1>
                      <div className="w-32 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 mx-auto rounded"></div>
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="p-6 flex-1">
                    {/* Level Badge */}
                    <div className="text-center mb-4">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${diploma.color} bg-yellow-100 border-2 border-yellow-300`}>
                        {diploma.level}
                      </span>
                    </div>

                    {/* Certificate Text */}
                    <div className="text-center mb-6">
                      <p className="font-amiri text-lg text-gray-800 leading-relaxed mb-4">
                        تشهد جامعة الإمام الزُّهري للعلوم الشرعية
                        <br />
                        بأن الطالب/ة
                      </p>
                      
                      {/* Name Field */}
                      <div className="border-b-2 border-dotted border-gray-500 mx-8 py-2 mb-4">
                        <span className="text-gray-400 font-amiri">اسم الطالب</span>
                      </div>
                      
                      <p className="font-amiri text-base text-gray-800 leading-relaxed mb-4">
                        قد أتم/ت بنجاح جميع متطلبات الحصول على
                      </p>
                      
                      {/* Diploma Title */}
                      <h3 className="font-amiri font-bold text-lg text-yellow-700 mb-4 leading-relaxed">
                        {diploma.title}
                      </h3>
                      
                      <p className="font-amiri text-sm text-gray-700 leading-relaxed mb-4">
                        {diploma.description}
                      </p>
                      
                      <p className="font-amiri text-base text-gray-800">
                        بعدد ساعات تدريبية: <span className="font-bold text-yellow-700">{diploma.hours} ساعة</span>
                      </p>
                    </div>
                  </div>

                  {/* Footer Section */}
                  <div className="p-4 border-t-2 border-yellow-400">
                    {/* Signature Section */}
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-center">
                        {/* Official Seal */}
                        <div className="w-16 h-16 rounded-full border-4 border-yellow-600 bg-yellow-100 flex items-center justify-center mb-2 mx-auto">
                          <div className="w-10 h-10 rounded-full bg-yellow-600 flex items-center justify-center">
                            <i className="fas fa-stamp text-white text-sm"></i>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 font-amiri">الختم الرسمي</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="border-b-2 border-gray-500 w-24 mb-2"></div>
                        <p className="text-xs text-gray-600 font-amiri">توقيع العميد</p>
                      </div>
                      
                      <div className="text-center">
                        <div className="border-b-2 border-gray-500 w-20 mb-2"></div>
                        <p className="text-xs text-gray-600 font-amiri">التاريخ</p>
                      </div>
                    </div>
                    
                    {/* Serial Number */}
                    <div className="text-center">
                      <p className="text-xs text-gray-500 font-amiri">
                        رقم الشهادة: {diploma.id.toUpperCase()}-{new Date().getFullYear()}-001
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <img 
                    src={logo_2} 
                    alt="" 
                    className="h-64 w-64 object-contain transform rotate-12"
                  />
                </div>
              </div>
            </div>
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