import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { CheckCircle, Clock, Trophy, PlayCircle, XCircle } from "lucide-react";

interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number;
  passingGrade: string;
  totalQuestions: number;
  isActive: boolean;
  courseId: string;
}

interface ExamAttempt {
  id: string;
  examId: string;
  score: string;
  passed: boolean;
  completedAt: string;
  correctAnswers: number;
  totalQuestions: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
}

export default function CourseExams() {
  const { courseId } = useParams<{ courseId: string }>();
  const { toast } = useToast();

  const { data: course, isLoading: courseLoading } = useQuery<Course>({
    queryKey: ["api", "courses", courseId],
    retry: false,
  });

  const { data: allExams, isLoading: examsLoading } = useQuery<Exam[]>({
    queryKey: ["exams"],
    retry: false,
  });

  const { data: userAttempts, isLoading: attemptsLoading } = useQuery<ExamAttempt[]>({
    queryKey: ["api", "user", "exam-attempts"],
    retry: false,
  });

  // Filter exams for this course
  const courseExams = (allExams || []).filter(exam => exam.courseId === courseId && exam.isActive);

  const getExamStatus = (examId: string) => {
    const attempt = userAttempts?.find(attempt => attempt.examId === examId && attempt.completedAt);
    return attempt;
  };

  const getStatusBadge = (examId: string) => {
    const attempt = getExamStatus(examId);
    if (attempt) {
      return attempt.passed ? (
        <Badge className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 ml-1" />
          مكتمل - {attempt.score}%
        </Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 ml-1" />
          غير ناجح - {attempt.score}%
        </Badge>
      );
    }
    return (
      <Badge variant="outline">
        <Clock className="w-3 h-3 ml-1" />
        لم يتم إجراؤه
      </Badge>
    );
  };

  const getActionButton = (exam: Exam) => {
    const attempt = getExamStatus(exam.id);
    if (attempt) {
      return (
        <Button variant="outline" disabled>
          تم الإكمال
        </Button>
      );
    }
    return (
      <Button 
        className="bg-green-600 hover:bg-green-700"
        onClick={() => {
          // Navigate to specific exam
          window.location.href = `/course/${courseId}/exam?examId=${exam.id}`;
        }}
      >
        <PlayCircle className="w-4 h-4 ml-2" />
        بدء الاختبار
      </Button>
    );
  };

  if (courseLoading || examsLoading || attemptsLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
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
              <h2 className="text-xl font-bold text-gray-900 mb-2">المادة غير موجودة</h2>
              <p className="text-gray-600 mb-4">لم يتم العثور على المادة المطلوبة</p>
              <Link href="/dashboard">
                <Button>العودة للوحة التحكم</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const completedExams = courseExams.filter(exam => getExamStatus(exam.id));
  const availableExams = courseExams.filter(exam => !getExamStatus(exam.id));

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <Link href={`/course/${courseId}`} className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <span className="ml-2">←</span>
            العودة للمادة
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
          <p className="text-gray-600">اختبارات المادة ونتائجك</p>
        </div>

        {/* Completed Exams Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            <Trophy className="inline w-6 h-6 ml-2 text-yellow-600" />
            الاختبارات المكتملة ({completedExams.length})
          </h2>
          
          {completedExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedExams.map((exam) => {
                const attempt = getExamStatus(exam.id)!;
                return (
                  <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{exam.title}</CardTitle>
                          <CardDescription className="line-clamp-2">
                            {exam.description}
                          </CardDescription>
                        </div>
                        {getStatusBadge(exam.id)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">النتيجة:</span>
                            <span className={`font-bold ml-1 ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                              {attempt.score}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">الإجابات الصحيحة:</span>
                            <span className="font-bold ml-1">{attempt.correctAnswers}/{attempt.totalQuestions}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>تاريخ الإكمال: </span>
                          <span>{new Date(attempt.completedAt).toLocaleDateString('ar-SA')}</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="text-sm text-gray-600">
                            المدة: {exam.duration} دقيقة | درجة النجاح: {exam.passingGrade}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">لم تكمل أي اختبارات في هذه المادة بعد</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Available Exams Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            <Clock className="inline w-6 h-6 ml-2 text-blue-600" />
            الاختبارات المتاحة ({availableExams.length})
          </h2>
          
          {availableExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableExams.map((exam) => (
                <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{exam.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {exam.description}
                        </CardDescription>
                      </div>
                      {getStatusBadge(exam.id)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span>المدة: </span>
                          <span className="font-bold">{exam.duration} دقيقة</span>
                        </div>
                        <div>
                          <span>عدد الأسئلة: </span>
                          <span className="font-bold">{exam.totalQuestions}</span>
                        </div>
                        <div className="col-span-2">
                          <span>درجة النجاح: </span>
                          <span className="font-bold">{exam.passingGrade}%</span>
                        </div>
                      </div>
                      <div className="pt-2">
                        {getActionButton(exam)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                <p className="text-gray-600">تهانينا! لقد أكملت جميع الاختبارات المتاحة في هذه المادة</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
