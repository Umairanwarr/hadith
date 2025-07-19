import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import type { Course } from '@shared/schema';

interface LevelData {
  id: string;
  name: string;
  title: string;
  description: string;
  hours: number;
  lessons: number;
  color: string;
  bgColor: string;
  icon: string;
  level: string;
}

const levels: LevelData[] = [
  {
    id: 'preparatory',
    name: 'المستوى التمهيدي',
    title: 'الديبلوم التمهيدي في علوم الحديث',
    description: 'مرحلة التأسيس حيث تُبنى القواعد ويأخذ الطالب مفاتيح العلم. يشمل حفظ جزء عمّ وجزء تبارك، والأربعين النووية مع زيادات ابن رجب، والبيقونية في مصطلح الحديث.',
    hours: 120,
    lessons: 24,
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: 'fas fa-seedling',
    level: 'تمهيدي'
  },
  {
    id: 'intermediate',
    name: 'المستوى المتوسط',
    title: 'الدبلوم المتوسط في علوم الحديث',
    description: 'حفظ 15 حزباً من القرآن الكريم مع عمدة الأحكام لعبد الغني المقدسي، والسلسلة الذهبية في الإسناد. دراسة نخبة الفكر لابن حجر والورقات للجويني.',
    hours: 180,
    lessons: 36,
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: 'fas fa-book',
    level: 'متوسط'
  },
  {
    id: 'certificate',
    name: 'مستوى الإجازة',
    title: 'الإجازة في علوم الحديث',
    description: 'حفظ 20 حزباً من القرآن الكريم و200 حديث، مع دراسة التاريخ الإسلامي ومناهج المفسرين. التعمق في علم العلل وعلم التخريج.',
    hours: 240,
    lessons: 48,
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: 'fas fa-graduation-cap',
    level: 'متقدم'
  },
  {
    id: 'bachelor',
    name: 'مستوى البكالوريوس',
    title: 'بكالوريوس في علم الحديث',
    description: 'حفظ 30 حزباً من القرآن الكريم و200 حديث إضافي. التخصص في علم الرجال والتراجم، وعلم التحقيق، ومناهج المحدّثين.',
    hours: 300,
    lessons: 60,
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: 'fas fa-university',
    level: 'بكالوريوس'
  },
  {
    id: 'master',
    name: 'مستوى الماجستير',
    title: 'ماجستير عالم بالحديث',
    description: 'حفظ 40 حزباً من القرآن الكريم مع التخصص المتقدم في مناهج التصنيف ومُختلَف الحديث. دراسة علم الأنساب والقبائل.',
    hours: 360,
    lessons: 72,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-100',
    icon: 'fas fa-scroll',
    level: 'ماجستير'
  },
  {
    id: 'doctorate',
    name: 'مستوى الدكتوراه',
    title: 'دكتور في الدراسات الحديثية',
    description: 'الوصول لحفظ 60 حزباً من القرآن الكريم و1000 حديث شريف. الحصول على إجازات قراءة أو سماع في الكتب التسعة.',
    hours: 480,
    lessons: 96,
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: 'fas fa-crown',
    level: 'دكتوراه'
  }
];

export default function LevelsPage() {
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);

  const { data: courses } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  const toggleLevel = (levelId: string) => {
    setExpandedLevel(expandedLevel === levelId ? null : levelId);
  };

  const getCoursesForLevel = (level: string) => {
    return courses?.filter(course => course.level === level) || [];
  };

  return (
    <div className="min-h-screen bg-gray-50 rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-amiri font-bold text-green-700">
                المستويات الأكاديمية
              </h1>
              <p className="text-gray-600 mt-2">
                نظام التعليم المتدرج في علوم الحديث من المستوى التمهيدي إلى الدكتوراه
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

      {/* Levels Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {levels.map((level, index) => {
            const levelCourses = getCoursesForLevel(level.level);
            const isExpanded = expandedLevel === level.id;

            return (
              <Card key={level.id} className="overflow-hidden border-2 hover:shadow-lg transition-all duration-300">
                {/* Level Header */}
                <div 
                  className="cursor-pointer"
                  onClick={() => toggleLevel(level.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 ${level.bgColor} rounded-full flex items-center justify-center`}>
                          <div className="text-center">
                            <i className={`${level.icon} text-lg ${level.color}`}></i>
                            <div className={`text-sm font-bold ${level.color} mt-1`}>
                              {index + 1}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-amiri font-bold text-gray-800 mb-1">
                            {level.name}
                          </h3>
                          <h4 className="text-lg font-semibold text-gray-700 mb-2">
                            {level.title}
                          </h4>
                          <p className="text-gray-600 leading-relaxed">
                            {level.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {level.hours}
                          </div>
                          <div className="text-sm text-gray-500">ساعة دراسية</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {level.lessons}
                          </div>
                          <div className="text-sm text-gray-500">محاضرة</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {levelCourses.length}
                          </div>
                          <div className="text-sm text-gray-500">مادة</div>
                        </div>
                        <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-gray-400 text-lg`}></i>
                      </div>
                    </div>
                  </CardContent>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <CardContent className="p-6">
                      {levelCourses.length > 0 ? (
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-4">
                            المواد الدراسية المتاحة في هذا المستوى:
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {levelCourses.map((course) => (
                              <Card key={course.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4">
                                  <h6 className="font-amiri font-bold text-gray-800 mb-2 leading-tight">
                                    {course.title.includes(':') ? course.title.split(':')[1].trim() : course.title}
                                  </h6>
                                  <p className="text-sm text-gray-600 mb-3 truncate">
                                    {course.instructor}
                                  </p>
                                  <div className="flex justify-between items-center mb-3">
                                    <Badge className={`${level.bgColor} ${level.color} text-xs`}>
                                      {course.level}
                                    </Badge>
                                    <div className="text-xs text-gray-500">
                                      {Math.round(course.duration / 3600)}س • {course.totalLessons} محاضرة
                                    </div>
                                  </div>
                                  <Link href={`/course/${course.id}`}>
                                    <Button size="sm" className="w-full">
                                      عرض المادة
                                    </Button>
                                  </Link>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <i className="fas fa-graduation-cap text-4xl text-gray-400 mb-4"></i>
                          <h6 className="text-lg font-semibold text-gray-600 mb-2">
                            لا توجد مواد متاحة حالياً
                          </h6>
                          <p className="text-gray-500">
                            سيتم إضافة المواد الدراسية لهذا المستوى قريباً
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Additional Information */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-info-circle text-green-600 text-lg"></i>
              </div>
              <div>
                <h4 className="font-amiri font-bold text-green-800 mb-2">
                  نظام التعليم المتدرج
                </h4>
                <p className="text-green-700 leading-relaxed">
                  يعتمد نظام جامعة الإمام الزُّهري على التدرج العلمي المنهجي، حيث يبدأ الطالب من المستوى التمهيدي 
                  ويتقدم تدريجياً عبر المستويات الستة حتى يصل إلى مرتبة الدكتوراه في الدراسات الحديثية. 
                  كل مستوى يبني على المستوى السابق ويؤهل للمستوى التالي.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}