import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Link } from "wouter";

interface Teacher {
  id: string;
  name: string;
  title: string;
  degree: string;
  specialization: string;
  subjects: string[];
  biography: string;
  achievements: string[];
  photo?: string;
  category: 'professor' | 'scholar' | 'narrator';
}

const teachers: Teacher[] = [
  // University Professors and Doctors
  {
    id: 'prof-1',
    name: 'الدكتور محمد بن أحمد الزهري',
    title: 'أستاذ علوم الحديث',
    degree: 'دكتوراه في علوم الحديث',
    specialization: 'علم الجرح والتعديل',
    subjects: ['أصول علم الحديث', 'علم الجرح والتعديل', 'دراسة الأسانيد'],
    biography: 'أستاذ متخصص في علوم الحديث النبوي الشريف، له خبرة تزيد عن 20 عاماً في تدريس علوم الحديث',
    achievements: ['مؤلف كتاب "المنهج الصحيح في دراسة الأسانيد"', 'محقق عدة كتب في علوم الحديث', 'مشارك في عدة مؤتمرات علمية دولية'],
    category: 'professor'
  },
  {
    id: 'prof-2',
    name: 'الدكتور عبدالله بن محمد الحديثي',
    title: 'أستاذ مساعد',
    degree: 'دكتوراه في الحديث وعلومه',
    specialization: 'علل الحديث',
    subjects: ['علل الحديث', 'دراسة المتون', 'مناهج المحدثين'],
    biography: 'متخصص في دراسة علل الحديث والكشف عن الأحاديث المعلولة',
    achievements: ['باحث في معهد الدراسات الإسلامية', 'له عدة أبحاث منشورة في المجلات العلمية المحكمة'],
    category: 'professor'
  },
  {
    id: 'prof-3',
    name: 'الدكتورة فاطمة بنت علي السنية',
    title: 'أستاذة الحديث النبوي',
    degree: 'دكتوراه في الحديث النبوي الشريف',
    specialization: 'أحاديث الأحكام',
    subjects: ['أحاديث الأحكام', 'فقه الحديث', 'دراسات نسائية في السنة'],
    biography: 'أستاذة متميزة في تدريس أحاديث الأحكام والفقه المستنبط من السنة النبوية',
    achievements: ['مؤلفة عدة كتب في أحاديث الأحكام', 'مشرفة على عدة رسائل الماجستير والدكتوراه'],
    category: 'professor'
  },
  
  // Islamic Scholars and Clerics
  {
    id: 'scholar-1',
    name: 'الشيخ إبراهيم بن عبدالرحمن المسند',
    title: 'عالم محدث',
    degree: 'إجازة عالية في الحديث',
    specialization: 'السنن والمسانيد',
    subjects: ['تدريس صحيح البخاري', 'شرح صحيح مسلم', 'دراسة السنن الأربعة'],
    biography: 'عالم محدث له إسناد عالٍ في رواية الحديث، يقوم بتدريس كتب الحديث الأساسية',
    achievements: ['له إجازة في رواية الكتب التسعة', 'درّس في عدة جامعات إسلامية', 'له سلسلة محاضرات في شرح الصحيحين'],
    category: 'scholar'
  },
  {
    id: 'scholar-2',
    name: 'الشيخ أحمد بن محمد القاري',
    title: 'مقرئ ومحدث',
    degree: 'إجازة في القراءات والحديث',
    specialization: 'الحديث والقراءات',
    subjects: ['علوم القرآن والحديث', 'طرق الرواية', 'أدب طالب العلم'],
    biography: 'عالم جمع بين علوم القرآن والحديث، له باع طويل في التدريس والإفتاء',
    achievements: ['حافظ القرآن الكريم بالقراءات العشر', 'له إجازات متعددة في الحديث النبوي'],
    category: 'scholar'
  },

  // Hadith Narrators and Ijaza Granters
  {
    id: 'narrator-1',
    name: 'الشيخ محمد بن يوسف السندي',
    title: 'محدث مسند',
    degree: 'إجازة عالية بالإسناد المتصل',
    specialization: 'إجازات السماع والرواية',
    subjects: ['مجالس سماع صحيح البخاري', 'سماع صحيح مسلم', 'سماع الموطأ'],
    biography: 'محدث مسند له إسناد عالٍ ومتصل إلى النبي صلى الله عليه وسلم، يقيم مجالس السماع',
    achievements: ['له إسناد متصل في جميع الكتب التسعة', 'أجاز المئات من طلبة العلم', 'يقيم مجالس سماع دورية'],
    category: 'narrator'
  },
  {
    id: 'narrator-2',
    name: 'الشيخ عبدالله بن أحمد المسند',
    title: 'راوي الحديث',
    degree: 'إجازة بالسند المتصل',
    specialization: 'إجازات القراءة والحفظ',
    subjects: ['حفظ الأربعين النووية', 'حفظ بلوغ المرام', 'إجازات في المتون'],
    biography: 'راوي معتمد يمنح إجازات الحفظ والقراءة للطلاب المتميزين',
    achievements: ['أجاز أكثر من 500 طالب علم', 'له برامج تحفيظ متخصصة', 'يشرف على دورات الحفظ'],
    category: 'narrator'
  },
  {
    id: 'narrator-3',
    name: 'الشيخ يوسف بن علي الراوي',
    title: 'مجيز في السنة',
    degree: 'إجازة عامة في الحديث',
    specialization: 'التخصص في السنن',
    subjects: ['سماع سنن أبي داود', 'سماع سنن النسائي', 'سماع جامع الترمذي'],
    biography: 'محدث متخصص في السنن الأربعة، يقيم جلسات سماع منتظمة',
    achievements: ['متخصص في تدريس السنن الأربعة', 'له جلسات سماع أسبوعية', 'أجاز العديد من الطلاب'],
    category: 'narrator'
  }
];

const categories = [
  {
    id: 'professor',
    name: 'الأساتذة والدكاترة',
    description: 'أعضاء هيئة التدريس في الجامعة',
    icon: 'fas fa-graduation-cap',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  {
    id: 'scholar',
    name: 'العلماء والمشايخ',
    description: 'علماء متخصصون في الحديث النبوي',
    icon: 'fas fa-mosque',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  {
    id: 'narrator',
    name: 'المحدثون المسندون',
    description: 'رواة الحديث ومانحو الإجازات العلمية',
    icon: 'fas fa-scroll',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  }
];

export default function Teachers() {
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
            هيئة التدريس والمشايخ
          </h1>
          <p className="text-green-700 text-lg max-w-4xl mx-auto leading-relaxed">
            تضم جامعة الإمام الزُّهري نخبة مميزة من الأساتذة المتخصصين والعلماء المحدثين والرواة المسندين
            الذين يقومون بتدريس علوم الحديث النبوي الشريف ومنح الإجازات العلمية
          </p>
        </div>

        {/* Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {categories.map((category) => (
            <Card key={category.id} className={`${category.bgColor} ${category.borderColor} border-2 shadow-lg hover:shadow-xl transition-all duration-300`}>
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 ${category.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <i className={`${category.icon} ${category.color} text-2xl`}></i>
                </div>
                <h3 className={`font-amiri font-bold text-lg ${category.color} mb-2`}>
                  {category.name}
                </h3>
                <p className={`text-sm ${category.color} leading-relaxed`}>
                  {category.description}
                </p>
                <div className={`mt-4 text-2xl font-bold ${category.color}`}>
                  {teachers.filter(t => t.category === category.id).length}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Teachers by Category */}
        {categories.map((category) => (
          <div key={category.id} className="mb-16">
            <h2 className={`font-amiri font-bold text-2xl ${category.color} mb-8 text-center`}>
              {category.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teachers.filter(teacher => teacher.category === category.id).map((teacher) => (
                <Card key={teacher.id} className={`${category.bgColor} ${category.borderColor} border shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <CardContent className="p-6">
                    {/* Teacher Header */}
                    <div className="text-center mb-6">
                      {/* Avatar Placeholder */}
                      <div className={`w-20 h-20 ${category.bgColor} ${category.borderColor} border-4 rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <i className={`${category.icon} ${category.color} text-2xl`}></i>
                      </div>
                      
                      <h3 className="font-amiri font-bold text-lg text-gray-800 mb-1">
                        {teacher.name}
                      </h3>
                      <p className={`text-sm ${category.color} font-semibold mb-1`}>
                        {teacher.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {teacher.degree}
                      </p>
                    </div>

                    {/* Specialization */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <i className="fas fa-star text-yellow-500 text-sm"></i>
                        التخصص
                      </h4>
                      <p className="text-sm text-gray-700 bg-white rounded-lg p-2">
                        {teacher.specialization}
                      </p>
                    </div>

                    {/* Subjects */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <i className="fas fa-book text-blue-500 text-sm"></i>
                        المقررات الدراسية
                      </h4>
                      <div className="space-y-1">
                        {teacher.subjects.map((subject, index) => (
                          <div key={index} className="bg-white rounded-md px-3 py-1 text-xs text-gray-700">
                            • {subject}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Biography */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <i className="fas fa-user text-green-500 text-sm"></i>
                        نبذة تعريفية
                      </h4>
                      <p className="text-xs text-gray-700 leading-relaxed bg-white rounded-lg p-2">
                        {teacher.biography}
                      </p>
                    </div>

                    {/* Achievements */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <i className="fas fa-trophy text-orange-500 text-sm"></i>
                        الإنجازات
                      </h4>
                      <div className="space-y-1">
                        {teacher.achievements.map((achievement, index) => (
                          <div key={index} className="bg-white rounded-md px-3 py-1 text-xs text-gray-700">
                            • {achievement}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact/Schedule Info for Narrators */}
                    {teacher.category === 'narrator' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <Button size="sm" className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                            <i className="fas fa-calendar"></i>
                            جدول مجالس السماع
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Additional Information */}
        <Card className="mt-12 bg-white shadow-xl">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h3 className="font-amiri font-bold text-xl text-gray-800 mb-4">
                معايير اختيار هيئة التدريس
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-medal text-blue-600 text-2xl"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">الكفاءة العلمية</h4>
                <p className="text-gray-600 text-sm">أعضاء هيئة التدريس من أصحاب الدرجات العلمية العالية والتخصص الدقيق</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-link text-green-600 text-2xl"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">الإسناد المتصل</h4>
                <p className="text-gray-600 text-sm">المحدثون المسندون لهم أسانيد متصلة وعالية في رواية الحديث النبوي</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-chalkboard-teacher text-purple-600 text-2xl"></i>
                </div>
                <h4 className="font-semibold text-gray-800 mb-2">الخبرة التدريسية</h4>
                <p className="text-gray-600 text-sm">خبرة عملية طويلة في التدريس والتأليف ومنح الإجازات العلمية</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}