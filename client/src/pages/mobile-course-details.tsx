import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  Clock, 
  BookOpen, 
  PlayCircle, 
  Award, 
  User,
  CheckCircle,
  Lock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { MobileLayoutWrapper } from "@/components/mobile-layout-wrapper";
import { MobileCourseProgress } from "@/components/mobile-course-progress";
import type { Course, Lesson } from "@shared/schema";

interface LessonProgress {
  id: number;
  lessonId: number;
  isCompleted: boolean;
  watchedDuration: number;
}

export default function MobileCourseDetails() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const courseId = parseInt(id!);

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["/api/courses", courseId],
    retry: false,
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery<Lesson[]>({
    queryKey: ["/api/courses", courseId, "lessons"],
    retry: false,
  });

  const { data: progress } = useQuery<LessonProgress[]>({
    queryKey: ["/api/courses", courseId, "progress"],
    retry: false,
  });

  const enrollMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-enrollments"] });
      toast({
        title: "تم التسجيل بنجاح",
        description: "يمكنك الآن البدء في الدورة",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مخول",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "حدث خطأ",
        description: "فشل في التسجيل في الدورة",
        variant: "destructive",
      });
    },
  });

  if (courseLoading || lessonsLoading) {
    return (
      <MobileLayoutWrapper>
        <div className="container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </MobileLayoutWrapper>
    );
  }

  if (!course) {
    return (
      <MobileLayoutWrapper>
        <div className="container mx-auto px-4 py-6 text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            الدورة غير موجودة
          </h1>
          <Link href="/">
            <Button>العودة للرئيسية</Button>
          </Link>
        </div>
      </MobileLayoutWrapper>
    );
  }

  const completedLessons = progress?.filter(p => p.isCompleted).length || 0;
  const totalLessons = lessons?.length || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const nextLesson = lessons?.find(lesson => {
    const lessonProgress = progress?.find(p => p.lessonId === lesson.id);
    return !lessonProgress?.isCompleted;
  });

  return (
    <MobileLayoutWrapper>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-4 p-0">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Button>
        </Link>

        {/* Course Header */}
        <Card className="bg-gradient-to-br from-green-600 to-green-700 text-white">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl font-amiri mb-2">
                  {course.title}
                </CardTitle>
                <p className="text-green-100 text-sm mb-4">
                  {course.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-white/20 text-white border-white/30">
                    المستوى {course.level}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>{course.duration} ساعة</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <User className="h-4 w-4" />
                    <span>{course.instructor}</span>
                  </div>
                </div>

                {progress && progress.length > 0 ? (
                  <Button 
                    asChild
                    className="bg-white text-green-700 hover:bg-green-50"
                  >
                    <Link href={nextLesson ? `/courses/${courseId}/lessons/${nextLesson.id}` : `/courses/${courseId}/lessons/${lessons![0].id}`}>
                      <PlayCircle className="h-4 w-4 ml-2" />
                      {nextLesson ? "متابعة التعلم" : "البدء من جديد"}
                    </Link>
                  </Button>
                ) : (
                  <Button 
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    className="bg-white text-green-700 hover:bg-green-50"
                  >
                    {enrollMutation.isPending ? "جاري..." : "التسجيل في الدورة"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Card */}
        {progress && progress.length > 0 && (
          <MobileCourseProgress
            courseId={courseId}
            courseTitle={course.title}
            progress={progressPercentage}
            completedLessons={completedLessons}
            totalLessons={totalLessons}
            totalDuration={course.duration * 60}
            nextLessonId={nextLesson?.id}
            canTakeExam={progressPercentage >= 100}
          />
        )}

        {/* Lessons List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-right">
              محتوى الدورة ({totalLessons} درس)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lessons?.map((lesson, index) => {
              const lessonProgress = progress?.find(p => p.lessonId === lesson.id);
              const isCompleted = lessonProgress?.isCompleted || false;
              const isAccessible = index === 0 || (progress && progress.find(p => 
                p.lessonId === lessons[index - 1]?.id
              )?.isCompleted);

              return (
                <div
                  key={lesson.id}
                  className={`p-4 border rounded-lg transition-all ${
                    isCompleted 
                      ? "bg-green-50 border-green-200" 
                      : isAccessible 
                        ? "bg-white border-gray-200 hover:shadow-md" 
                        : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isCompleted 
                            ? "bg-green-600 text-white" 
                            : isAccessible 
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-200 text-gray-500"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : isAccessible ? (
                            index + 1
                          ) : (
                            <Lock className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-right">
                            {lesson.title}
                          </h4>
                          <p className="text-xs text-gray-600 text-right">
                            {lesson.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {lesson.duration} دقيقة
                        </span>
                        {lessonProgress && (
                          <span className="text-green-600">
                            {Math.round((lessonProgress.watchedDuration / (lesson.duration * 60)) * 100)}% مكتمل
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {isAccessible && (
                      <Link href={`/courses/${courseId}/lessons/${lesson.id}`}>
                        <Button 
                          size="sm" 
                          variant={isCompleted ? "outline" : "default"}
                          className={isCompleted ? "border-green-600 text-green-600" : "bg-green-600 text-white"}
                        >
                          {isCompleted ? "مراجعة" : "مشاهدة"}
                        </Button>
                      </Link>
                    )}
                  </div>
                  
                  {lessonProgress && lessonProgress.watchedDuration > 0 && (
                    <div className="mt-3">
                      <Progress 
                        value={(lessonProgress.watchedDuration / (lesson.duration * 60)) * 100}
                        className="h-1"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Exam Section */}
        {progressPercentage >= 100 && (
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6 text-center">
              <Award className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-orange-800 mb-2">
                الاختبار النهائي متاح
              </h3>
              <p className="text-orange-700 text-sm mb-4">
                أكملت جميع الدروس. يمكنك الآن إجراء الاختبار النهائي للحصول على الشهادة
              </p>
              <Link href={`/courses/${courseId}/exam`}>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                  <Award className="h-4 w-4 ml-2" />
                  دخول الاختبار
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </MobileLayoutWrapper>
  );
}