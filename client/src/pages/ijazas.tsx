import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useState } from 'react';
import Header from '@/components/header';
import Footer from '@/components/footer';

interface IjazaBook {
  id: string;
  title: string;
  author: string;
  description: string;
  category: string;
  importance: 'high' | 'medium';
  centuries: string;
}

interface IjazaCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  books: IjazaBook[];
}

const ijazaCategories: IjazaCategory[] = [
  {
    id: 'listening',
    name: 'إجازات السماع',
    description: 'الإجازات العلمية لسماع كتب الحديث المعتمدة والمشهورة',
    icon: 'fas fa-headphones',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    books: [
      {
        id: 'musannaf-abdurrazzaq',
        title: 'مصنف عبد الرزاق',
        author: 'عبد الرزاق بن همام الصنعاني',
        description: 'من أقدم المصنفات في الحديث النبوي، يحتوي على أحاديث وآثار مرتبة على الأبواب الفقهية',
        category: 'listening',
        importance: 'high',
        centuries: 'القرن الثالث الهجري'
      },
      {
        id: 'muwatta-malik',
        title: 'موطأ مالك',
        author: 'الإمام مالك بن أنس',
        description: 'أول كتاب صنف في الحديث النبوي، معتمد في المذهب المالكي ومقبول عند جميع العلماء',
        category: 'listening',
        importance: 'high',
        centuries: 'القرن الثاني الهجري'
      },
      {
        id: 'sunan-darimi',
        title: 'سنن الدارمي',
        author: 'عبد الله بن عبد الرحمن الدارمي',
        description: 'من السنن المعتبرة، يحتوي على أحاديث صحيحة وحسنة مرتبة على الأبواب',
        category: 'listening',
        importance: 'high',
        centuries: 'القرن الثالث الهجري'
      },
      {
        id: 'musnad-ahmad',
        title: 'مسند أحمد',
        author: 'الإمام أحمد بن حنبل',
        description: 'أكبر مجموعة حديثية مرتبة على أسماء الصحابة، يحتوي على أكثر من 40 ألف حديث',
        category: 'listening',
        importance: 'high',
        centuries: 'القرن الثالث الهجري'
      },
      {
        id: 'bukhari',
        title: 'صحيح البخاري',
        author: 'الإمام محمد بن إسماعيل البخاري',
        description: 'أصح كتاب بعد كتاب الله، يحتوي على أصح الأحاديث النبوية',
        category: 'listening',
        importance: 'high',
        centuries: 'القرن الثالث الهجري'
      },
      {
        id: 'muslim',
        title: 'صحيح مسلم',
        author: 'الإمام مسلم بن الحجاج',
        description: 'ثاني أصح كتب الحديث، مرتب على المعاني والأبواب الفقهية',
        category: 'listening',
        importance: 'high',
        centuries: 'القرن الثالث الهجري'
      },
      {
        id: 'abu-dawud',
        title: 'سنن أبي داود',
        author: 'أبو داود السجستاني',
        description: 'من الكتب الستة، يركز على الأحاديث الفقهية والأحكام العملية',
        category: 'listening',
        importance: 'high',
        centuries: 'القرن الثالث الهجري'
      },
      {
        id: 'ibn-majah',
        title: 'سنن ابن ماجه',
        author: 'محمد بن يزيد ابن ماجه',
        description: 'آخر الكتب الستة، يحتوي على أحاديث في مختلف أبواب الدين',
        category: 'listening',
        importance: 'high',
        centuries: 'القرن الثالث الهجري'
      },
      {
        id: 'tirmidhi',
        title: 'جامع الترمذي',
        author: 'أبو عيسى الترمذي',
        description: 'من الكتب الستة، مشهور ببيان درجات الأحاديث وعلل الحديث',
        category: 'listening',
        importance: 'high',
        centuries: 'القرن الثالث الهجري'
      },
      {
        id: 'nasai',
        title: 'سنن النسائي',
        author: 'أحمد بن شعيب النسائي',
        description: 'من أدق الكتب الستة في انتقاء الأحاديث، قليل الأحاديث الضعيفة',
        category: 'listening',
        importance: 'high',
        centuries: 'القرن الثالث الهجري'
      }
    ]
  },
  {
    id: 'reading',
    name: 'إجازات القراءة',
    description: 'الإجازات العلمية لقراءة كتب المصطلح وعلوم الحديث والعلل وشروحها',
    icon: 'fas fa-book-open',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    books: [
      {
        id: 'umdat-ahkam',
        title: 'عمدة الأحكام',
        author: 'عبد الغني المقدسي',
        description: 'مختصر في الأحاديث الفقهية المتفق عليها بين البخاري ومسلم',
        category: 'reading',
        importance: 'high',
        centuries: 'القرن السابع الهجري'
      },
      {
        id: 'bulugh-maram',
        title: 'بلوغ المرام',
        author: 'الحافظ ابن حجر العسقلاني',
        description: 'جمع أحاديث الأحكام مع بيان درجاتها، من أهم كتب الفقه الحديثي',
        category: 'reading',
        importance: 'high',
        centuries: 'القرن التاسع الهجري'
      },
      {
        id: 'nukhbat-fikar',
        title: 'نخبة الفكر',
        author: 'الحافظ ابن حجر العسقلاني',
        description: 'مختصر بديع في علوم الحديث، أساس لدراسة مصطلح الحديث',
        category: 'reading',
        importance: 'high',
        centuries: 'القرن التاسع الهجري'
      },
      {
        id: 'muqaddimat-ibn-salah',
        title: 'مقدمة ابن الصلاح',
        author: 'عثمان بن عبد الرحمن ابن الصلاح',
        description: 'أول كتاب منهجي شامل في علوم الحديث، أساس لجميع الكتب اللاحقة',
        category: 'reading',
        importance: 'high',
        centuries: 'القرن السابع الهجري'
      },
      {
        id: 'sharh-ilal-tirmidhi',
        title: 'شرح علل الترمذي',
        author: 'ابن رجب الحنبلي',
        description: 'شرح متقن لعلل الترمذي، يبين دقائق علم العلل والحديث',
        category: 'reading',
        importance: 'medium',
        centuries: 'القرن الثامن الهجري'
      },
      {
        id: 'sharh-ilal-daraqutni',
        title: 'شرح علل الدارقطني',
        author: 'علي بن عمر الدارقطني',
        description: 'من أدق كتب العلل، يبين علل الأحاديث بدقة متناهية',
        category: 'reading',
        importance: 'medium',
        centuries: 'القرن الخامس الهجري'
      },
      {
        id: 'tadrib-rawi',
        title: 'تدريب الراوي',
        author: 'جلال الدين السيوطي',
        description: 'شرح وتهذيب لتقريب النواوي، من أهم كتب علوم الحديث',
        category: 'reading',
        importance: 'medium',
        centuries: 'القرن العاشر الهجري'
      },
      {
        id: 'alfiyat-iraqi',
        title: 'ألفية العراقي',
        author: 'زين الدين العراقي',
        description: 'منظومة شاملة في علوم الحديث، نظم فيها علوم الحديث نظماً بديعاً',
        category: 'reading',
        importance: 'medium',
        centuries: 'القرن الثامن الهجري'
      }
    ]
  },
  {
    id: 'memorization',
    name: 'إجازات الحفظ',
    description: 'الإجازات العلمية لحفظ متون الحديث والمنظومات العلمية',
    icon: 'fas fa-brain',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    books: [
      {
        id: 'baiquniyyah',
        title: 'البيقونية',
        author: 'عمر بن محمد البيقوني',
        description: 'منظومة مختصرة في علوم الحديث، سهلة الحفظ ومفيدة للمبتدئين',
        category: 'memorization',
        importance: 'high',
        centuries: 'القرن العاشر الهجري'
      },
      {
        id: 'arbaeen-nawawi',
        title: 'الأربعون النووية',
        author: 'الإمام النووي',
        description: 'أربعون حديثاً جامعة لأصول الدين، من أهم المتون المحفوظة',
        category: 'memorization',
        importance: 'high',
        centuries: 'القرن السابع الهجري'
      },
      {
        id: 'silsilah-dhahabiyyah',
        title: 'السلسلة الذهبية',
        author: 'جمع من العلماء',
        description: 'مجموعة من الأحاديث المختارة بأسانيد عالية وصحيحة',
        category: 'memorization',
        importance: 'high',
        centuries: 'متنوعة'
      },
      {
        id: 'jawami-kalim',
        title: 'جوامع الكلم',
        author: 'مجموعة من المحدثين',
        description: 'أحاديث جامعة المعاني، مختارة لجمعها خير الكلام في قليل من الألفاظ',
        category: 'memorization',
        importance: 'medium',
        centuries: 'متنوعة'
      },
      {
        id: 'mukhtasar-bukhari',
        title: 'مختصر البخاري',
        author: 'اختصار من صحيح البخاري',
        description: 'مختارات من أصح الأحاديث النبوية للحفظ والاستظهار',
        category: 'memorization',
        importance: 'high',
        centuries: 'القرن الثالث الهجري'
      },
      {
        id: 'riyad-salihin',
        title: 'رياض الصالحين',
        author: 'الإمام النووي',
        description: 'مجموعة مختارة من الأحاديث في الأخلاق والآداب والرقائق',
        category: 'memorization',
        importance: 'medium',
        centuries: 'القرن السابع الهجري'
      }
    ]
  }
];

export default function IjazasPage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      <Header />
      
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 mt-20">
        <div className="w-full max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-amiri font-bold text-green-700">
                الإجازات العلمية
              </h1>
              <p className="text-gray-600 mt-2">
                نظام الإجازات المعتمدة في كتب الحديث النبوي وعلومه المختلفة
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

      {/* Introduction */}
      <div className="w-full px-4 py-8">
        <Card className="mb-8 bg-green-50 border-green-200 max-w-7xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-scroll text-green-600 text-lg"></i>
              </div>
              <div>
                <h2 className="font-amiri font-bold text-green-800 text-xl mb-3">
                  نظام الإجازات في التراث الإسلامي
                </h2>
                <p className="text-green-700 leading-relaxed mb-4">
                  الإجازة العلمية هي إذن من العالم للطالب بأن يروي عنه ما تعلمه أو سمعه منه. 
                  وهي من أهم وسائل نقل العلم في التراث الإسلامي، وتضمن سلامة النقل وصحة الإسناد.
                  تنقسم الإجازات إلى ثلاثة أنواع رئيسية: السماع والقراءة والحفظ.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="font-semibold text-green-800">إجازات السماع</div>
                    <div className="text-green-600">للكتب الحديثية الكبرى</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="font-semibold text-green-800">إجازات القراءة</div>
                    <div className="text-green-600">لكتب العلوم والشروح</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <div className="font-semibold text-green-800">إجازات الحفظ</div>
                    <div className="text-green-600">للمتون والمنظومات</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <div className="space-y-6 max-w-7xl mx-auto">
          {ijazaCategories.map((category) => {
            const isExpanded = expandedCategory === category.id;

            return (
              <Card key={category.id} className="overflow-hidden border-2 hover:shadow-lg transition-all duration-300">
                {/* Category Header */}
                <div 
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 ${category.bgColor} rounded-full flex items-center justify-center`}>
                          <i className={`${category.icon} text-xl ${category.color}`}></i>
                        </div>
                        <div>
                          <h3 className="text-xl font-amiri font-bold text-gray-800 mb-1">
                            {category.name}
                          </h3>
                          <p className="text-gray-600 leading-relaxed">
                            {category.description}
                          </p>
                          <Badge className={`${category.bgColor} ${category.color} mt-2`}>
                            {category.books.length} كتاب
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-700">
                            {category.books.filter(book => book.importance === 'high').length}
                          </div>
                          <div className="text-sm text-gray-500">أساسي</div>
                        </div>
                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400`}></i>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {category.books.map((book) => (
                          <Card key={book.id} className="h-full hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <Badge 
                                  variant={book.importance === 'high' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {book.importance === 'high' ? 'أساسي' : 'مكمل'}
                                </Badge>
                                <div className="text-xs text-gray-500">
                                  {book.centuries}
                                </div>
                              </div>
                              <h4 className="font-amiri font-bold text-gray-800 mb-2">
                                {book.title}
                              </h4>
                              <p className="text-sm text-gray-600 mb-3">
                                {book.author}
                              </p>
                              <p className="text-sm text-gray-600 leading-relaxed">
                                {book.description}
                              </p>
                              <div className="mt-4 pt-3 border-t border-gray-200">
                                <Button size="sm" variant="outline" className="w-full">
                                  طلب الإجازة
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* How to Get Ijaza */}
        <Card className="mt-8 bg-blue-50 border-blue-200 max-w-7xl mx-auto">
          <CardContent className="p-6">
            <h3 className="font-amiri font-bold text-blue-800 text-xl mb-4">
              كيفية الحصول على الإجازة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-book-reader text-blue-600"></i>
                </div>
                <h4 className="font-semibold text-blue-800 mb-2">الدراسة والتحضير</h4>
                <p className="text-blue-700 text-sm">دراسة الكتاب والتحضير الجيد للمادة العلمية</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-user-graduate text-blue-600"></i>
                </div>
                <h4 className="font-semibold text-blue-800 mb-2">حضور الدروس</h4>
                <p className="text-blue-700 text-sm">حضور جلسات القراءة أو السماع مع الشيخ المجيز</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-clipboard-check text-blue-600"></i>
                </div>
                <h4 className="font-semibold text-blue-800 mb-2">الاختبار</h4>
                <p className="text-blue-700 text-sm">اجتياز الاختبار النهائي في الكتاب المطلوب</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <i className="fas fa-certificate text-blue-600"></i>
                </div>
                <h4 className="font-semibold text-blue-800 mb-2">منح الإجازة</h4>
                <p className="text-blue-700 text-sm">الحصول على الإجازة العلمية بالسند المتصل</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}