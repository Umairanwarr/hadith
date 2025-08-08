import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration: number;
  totalLessons: number;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: number;
  order: number;
}

interface LessonProgress {
  id: number;
  lessonId: number;
  isCompleted: boolean;
  watchedDuration: number;
}

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const courseId = parseInt(id!);

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/courses", courseId],
    retry: false,
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: ["/courses", courseId, "lessons"],
    retry: false,
  });

  const { data: progress, isLoading: progressLoading } = useQuery<LessonProgress[]>({
    queryKey: ["/courses", courseId, "progress"],
    retry: false,
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'مبتدئ':
        return 'bg-green-100 text-green-800';
      case 'متوسط':
        return 'bg-orange-100 text-orange-800';
      case 'متقدم':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (lessonId: number, duration: number) => {
    const lessonProgress = progress?.find(p => p.lessonId === lessonId);
    if (!lessonProgress) return 0;
    return Math.min((lessonProgress.watchedDuration / duration) * 100, 100);
  };

  const isLessonCompleted = (lessonId: number) => {
    return progress?.find(p => p.lessonId === lessonId)?.isCompleted || false;
  };

  const canAccessExam = () => {
    if (!lessons || !progress) return false;
    const completedLessons = progress.filter(p => p.isCompleted).length;
    return completedLessons === lessons.length;
  };

  if (courseLoading || lessonsLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <h2 className="text-xl font-bold text-gray-900 mb-2">المادة غير موجودة</h2>
              <p className="text-gray-600 mb-4">لم يتم العثور على المادة المطلوبة</p>
              <Link href="/">
                <Button>العودة للصفحة الرئيسية</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-amiri font-bold text-green-700">
                    {course.title}
                  </h1>
                  <Badge className={getLevelColor(course.level)}>
                    {course.level}
                  </Badge>
                </div>
                <p className="text-xl text-gray-600 mb-4">{course.instructor}</p>
                <p className="text-gray-700 leading-relaxed mb-6">{course.description}</p>
                
                <div className="flex gap-6 text-sm text-gray-600 mb-6">
                  <span>
                    <i className="fas fa-clock ml-1"></i>
                    {Math.round(course.duration / 60)} ساعة
                  </span>
                  <span>
                    <i className="fas fa-video ml-1"></i>
                    {course.totalLessons} محاضرة
                  </span>
                </div>

                {canAccessExam() && (
                  <Link href={`/courses/${courseId}/exam`}>
                    <Button className="btn-secondary">
                      <i className="fas fa-clipboard-list ml-2"></i>
                      الانتقال للاختبار
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-8 text-white text-center">
                <i className="fas fa-quran text-6xl mb-4 opacity-50"></i>
                <h3 className="font-amiri text-xl font-bold">علم الحديث النبوي الشريف</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Content */}
        <div className="grid md:grid-cols-4 gap-8">
          {/* Lessons List */}
          <div className="md:col-span-3">
            <h2 className="text-2xl font-amiri font-bold text-green-700 mb-6">
              محتويات المادة
            </h2>
            
            {!lessons || lessons.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <i className="fas fa-video text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    لا توجد محاضرات متاحة
                  </h3>
                  <p className="text-gray-500">
                    لم يتم رفع محاضرات لهذه المادة بعد
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, index) => {
                  const completed = isLessonCompleted(lesson.id);
                  const progressPercent = getProgressPercentage(lesson.id, lesson.duration);
                  
                  return (
                    <Card key={lesson.id} className="hover-scale">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${
                            completed ? 'bg-green-600' : 'bg-gray-400'
                          }`}>
                            <span className="font-bold">{index + 1}</span>
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="font-amiri font-bold text-lg mb-1">
                              {lesson.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {lesson.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>
                                <i className="fas fa-clock ml-1"></i>
                                {formatDuration(lesson.duration)}
                              </span>
                              {progressPercent > 0 && (
                                <span>
                                  التقدم: {Math.round(progressPercent)}%
                                </span>
                              )}
                            </div>
                            
                            {progressPercent > 0 && progressPercent < 100 && (
                              <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                                <div 
                                  className="bg-green-600 h-1 rounded-full transition-all duration-300" 
                                  style={{ width: `${progressPercent}%` }}
                                ></div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {completed && (
                              <i className="fas fa-check-circle text-green-600 text-xl"></i>
                            )}
                            <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                              <Button 
                                variant={completed ? "outline" : "default"}
                                className={completed ? "border-green-600 text-green-600 hover:bg-green-50" : "bg-green-600 hover:bg-green-700 text-white"}
                              >
                                {completed ? "مراجعة" : "مشاهدة"}
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Course Info Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-amiri font-bold text-lg mb-4">
                  معلومات المادة
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المستوى:</span>
                    <Badge className={getLevelColor(course.level)}>
                      {course.level}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">المدة الإجمالية:</span>
                    <span>{Math.round(course.duration / 60)} ساعة</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">عدد المحاضرات:</span>
                    <span>{course.totalLessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">التقدم:</span>
                    <span>
                      {progress?.filter(p => p.isCompleted).length || 0} / {lessons?.length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-amiri font-bold text-lg mb-4">
                  متطلبات الإتمام
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check-circle text-[hsl(158,40%,34%)]"></i>
                    مشاهدة جميع المحاضرات
                  </li>
                  <li className="flex items-center gap-2">
                    <i className={`fas fa-check-circle ${canAccessExam() ? 'text-[hsl(158,40%,34%)]' : 'text-gray-400'}`}></i>
                    اجتياز الاختبار النهائي
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-certificate text-[hsl(45,76%,58%)]"></i>
                    الحصول على الشهادة
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
