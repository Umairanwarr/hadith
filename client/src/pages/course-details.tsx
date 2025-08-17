import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor: string;
  level: string;
  duration: number;
  totalLessons: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  order: number;
}

interface LessonProgressItem {
  lessonId: string;
  lessonTitle: string;
  lessonOrder: number;
  isCompleted: boolean;
  watchedDuration: number;
  completedAt: string | null;
  lastWatchedAt: string | null;
}

interface CourseProgress {
  courseId: string;
  totalLessons: number;
  completedLessons: number;
  progressPercentage: number;
  isCourseCompleted: boolean;
  lessonProgress: LessonProgressItem[];
}

export default function CourseDetails() {
  const { id } = useParams<{ id: string }>();
  const courseId = id!;

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["api", "courses", courseId],
    retry: false,
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: ["api", "courses", courseId, "lessons"],
    retry: false,
  });

  const { data: courseProgress, isLoading: progressLoading } = useQuery<CourseProgress>({
    queryKey: ["api", "courses", courseId, "progress"],
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

  // Some legacy lessons may have duration stored in minutes instead of seconds
  const toMinutes = (value: number) => (value >= 60 ? Math.round(value / 60) : value);

  const getProgressPercentage = (lessonId: string, duration: number) => {
    const lessonProgress = courseProgress?.lessonProgress.find(p => p.lessonId === lessonId);
    if (!lessonProgress) return 0;
    return Math.min((lessonProgress.watchedDuration / duration) * 100, 100);
  };

  const isLessonCompleted = (lessonId: string) => {
    return courseProgress?.lessonProgress.find(p => p.lessonId === lessonId)?.isCompleted || false;
  };

  const canAccessExam = () => {
    if (!lessons || !courseProgress) return false;
    const completedLessons = courseProgress.completedLessons;
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

  // Pre-compute total minutes from lessons (normalize each item: some rows may be stored in minutes, others in seconds)
  const totalMinutes = (lessons || []).reduce((sum, l) => {
    const value = l.duration || 0;
    const minutes = value >= 60 ? Math.round(value / 60) : value; // seconds -> minutes, else already minutes
    return sum + minutes;
  }, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-6">
        {/* Course Header - compact like the screenshot */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-amiri font-bold text-gray-900">{course.title}</h1>
                  <Badge className={getLevelColor(course.level)}>{course.level}</Badge>
                </div>
                <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
                  <span><i className="fas fa-user ml-1"></i>{course.instructor}</span>
                  <span><i className="fas fa-video ml-1"></i>{course.totalLessons} درس</span>
                  <span><i className="fas fa-clock ml-1"></i>{totalMinutes} دقيقة</span>
                </div>
              </div>
              <Link href="/">
                <Button variant="outline" className="text-xs">
                  العودة للوحة التحكم
                  <i className="fas fa-arrow-left mr-2"></i>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Course Content */}
        <div className="grid md:grid-cols-4 gap-8">
          {/* Lessons List - match requested design */}
          <div className="md:col-span-3">
            <h2 className="text-2xl font-amiri font-bold text-gray-900 mb-4">عناوين المادة</h2>
            {!lessons || lessons.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <i className="fas fa-video text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">لا توجد محاضرات متاحة</h3>
                  <p className="text-gray-500">لم يتم رفع محاضرات لهذه المادة بعد</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {lessons
                  .slice()
                  .sort((a, b) => a.order - b.order)
                  .map((lesson, idx) => {
                    const completed = isLessonCompleted(lesson.id);
                    return (
                      <Link key={lesson.id} href={`/course/${courseId}/lessons/${lesson.id}`}>
                        <div className={`flex items-center justify-between rounded-lg border p-4 hover:bg-gray-50 cursor-pointer ${completed ? 'border-green-300' : 'border-gray-200'}`}>
                          <i className="fas fa-chevron-left text-gray-400"></i>
                          <div className="flex-1 mx-4">
                            <div className="font-amiri font-bold text-gray-800">{lesson.title}</div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                              <span><i className="fas fa-video ml-1"></i>فيديو</span>
                              <span><i className="fas fa-clock ml-1"></i>{toMinutes(lesson.duration)} دقيقة</span>
                              {completed && <span className="text-green-600"><i className="fas fa-check ml-1"></i>مكتمل</span>}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 text-sm">{idx + 1}</div>
                        </div>
                      </Link>
                    );
                  })}
              </div>
            )}

            {/* Exams Section */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">اختبارات المادة</h2>
                <Link href={`/course/${courseId}/exams`}>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <i className="fas fa-list ml-2"></i>
                    عرض جميع الاختبارات
                  </Button>
                </Link>
              </div>
              <Card>
                <CardContent className="p-6 text-center">
                  <i className="fas fa-clipboard-check text-4xl text-emerald-600 mb-4"></i>
                  <h3 className="font-bold text-lg mb-2">اختبارات المادة</h3>
                  <p className="text-gray-600 mb-4">
                    اعرض جميع الاختبارات المتاحة لهذه المادة ونتائجك السابقة
                  </p>
                  <Link href={`/course/${courseId}/exams`}>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <i className="fas fa-clipboard-list ml-2"></i>
                      دخول لوحة الاختبارات
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
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
                    <span>{totalHours} ساعة {remainingMinutes} دقيقة</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">عدد المحاضرات:</span>
                    <span>{course.totalLessons}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">التقدم:</span>
                    <span>
                      {courseProgress?.completedLessons || 0} / {lessons?.length || 0}
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
