import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface DiplomaLevel {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  hours: number;
  color: string;
  bgColor: string;
  icon: string;
  certificateType: string;
}

const diplomaLevels: DiplomaLevel[] = [
  {
    id: 'preparatory',
    name: 'Preparatory Diploma',
    arabicName: 'الديبلوم التمهيدي في علوم الحديث',
    description: 'مرحلة التأسيس الأولى في علوم الحديث.',
    hours: 120,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'fas fa-seedling',
    certificateType: 'ديبلوم معتمد'
  },
  {
    id: 'intermediate',
    name: 'Intermediate Diploma',
    arabicName: 'الدبلوم المتوسط في علوم الحديث',
    description: 'المرحلة المتوسطة في علوم الحديث.',
    hours: 180,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: 'fas fa-book',
    certificateType: 'ديبلوم معتمد'
  },
  {
    id: 'certificate',
    name: 'Certificate in Hadith Sciences',
    arabicName: 'الإجازة في علوم الحديث',
    description: 'إجازة متخصصة في علوم الحديث.',
    hours: 240,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'fas fa-graduation-cap',
    certificateType: 'إجازة علمية'
  },
  {
    id: 'bachelor',
    name: 'Bachelor in Hadith Science',
    arabicName: 'بكالوريوس في علم الحديث',
    description: 'درجة البكالوريوس في علم الحديث.',
    hours: 300,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'fas fa-university',
    certificateType: 'درجة بكالوريوس'
  },
  {
    id: 'master',
    name: 'Master Scholar in Hadith',
    arabicName: 'ماجستير عالم بالحديث',
    description: 'درجة الماجستير في علوم الحديث.',
    hours: 360,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: 'fas fa-scroll',
    certificateType: 'درجة ماجستير'
  },
  {
    id: 'doctorate',
    name: 'Doctor in Hadith Studies',
    arabicName: 'دكتور في الدراسات الحديثية',
    description: 'أعلى درجة علمية في الدراسات الحديثية.',
    hours: 480,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: 'fas fa-crown',
    certificateType: 'درجة دكتوراه'
  }
];

export default function DiplomasPage() {
  return (
    <div className="min-h-screen bg-gray-50 rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-amiri font-bold text-green-700">
                الديبلومات الجامعية
              </h1>
              <p className="text-gray-600 mt-2">
                نظام الشهادات والديبلومات الجامعية المعتمدة في جامعة الإمام الزُّهري لعلوم الحديث
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="gap-2">
                <i className="fas fa-arrow-right"></i>
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Introduction */}
        <Card className="mb-8 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-certificate text-green-600 text-lg"></i>
              </div>
              <div>
                <h2 className="font-amiri font-bold text-green-800 text-xl mb-3">
                  نظام الشهادات المتدرج
                </h2>
                <p className="text-green-700 leading-relaxed mb-4">
                  تمنح جامعة الإمام الزُّهري شهادات علمية معتمدة في علوم الحديث النبوي الشريف، 
                  بدءاً من الديبلوم التمهيدي وصولاً إلى درجة الدكتوراه. كل مستوى يؤهل الطالب 
                  للمستوى التالي ويبني على المعرفة المكتسبة سابقاً.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="font-semibold text-green-800">إجمالي المستويات</div>
                    <div className="text-2xl font-bold text-green-600">6</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="font-semibold text-green-800">إجمالي الساعات</div>
                    <div className="text-2xl font-bold text-green-600">1680</div>
                  </div>

                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diploma Levels - Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {diplomaLevels.map((diploma, index) => (
            <Card key={diploma.id} className="relative overflow-hidden border-2 hover:shadow-xl transition-all duration-300 group">
              {/* Level Number Badge */}
              <div className={`absolute top-4 left-4 w-10 h-10 ${diploma.bgColor} rounded-full flex items-center justify-center z-10`}>
                <span className={`text-lg font-bold ${diploma.color}`}>
                  {index + 1}
                </span>
              </div>
              
              <CardContent className="p-6 pt-8">
                <div className="text-center mb-6">
                  <div className={`w-16 h-16 ${diploma.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <i className={`${diploma.icon} text-2xl ${diploma.color}`}></i>
                  </div>
                  
                  <h3 className="text-xl font-amiri font-bold text-gray-800 mb-2">
                    {diploma.arabicName}
                  </h3>
                  
                  <Badge className={`${diploma.bgColor} ${diploma.color} mb-3`}>
                    {diploma.certificateType}
                  </Badge>
                  
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {diploma.description}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="text-center py-3 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">
                      {diploma.hours}
                    </div>
                    <div className="text-xs text-gray-500">ساعة دراسية</div>
                  </div>
                  
                  <Link href="/levels">
                    <Button size="sm" className="w-full group-hover:bg-green-600 transition-colors">
                      عرض التفاصيل
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Certification Process */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-amiri font-bold text-blue-800 text-xl mb-4">
              عملية الحصول على الشهادة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-user-graduate text-blue-600"></i>
                </div>
                <h4 className="font-semibold text-blue-800 mb-2">التسجيل</h4>
                <p className="text-blue-700 text-sm">التسجيل في المستوى المناسب حسب المؤهلات</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-book-open text-blue-600"></i>
                </div>
                <h4 className="font-semibold text-blue-800 mb-2">الدراسة</h4>
                <p className="text-blue-700 text-sm">إكمال جميع المواد والمتطلبات الدراسية</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-clipboard-check text-blue-600"></i>
                </div>
                <h4 className="font-semibold text-blue-800 mb-2">الامتحان</h4>
                <p className="text-blue-700 text-sm">اجتياز الامتحانات النهائية بنجاح</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-certificate text-blue-600"></i>
                </div>
                <h4 className="font-semibold text-blue-800 mb-2">الشهادة</h4>
                <p className="text-blue-700 text-sm">الحصول على الشهادة المعتمدة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="font-amiri font-bold text-gray-800 text-xl mb-4">
                للاستفسار عن الشهادات والإجازات
              </h3>
              <p className="text-gray-600 mb-4">
                لمزيد من المعلومات حول متطلبات الحصول على الشهادات أو عملية التسجيل، 
                يرجى التواصل مع إدارة الجامعة
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" className="gap-2">
                  <i className="fas fa-envelope"></i>
                  البريد الإلكتروني
                </Button>
                <Button variant="outline" className="gap-2">
                  <i className="fas fa-phone"></i>
                  الهاتف
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}