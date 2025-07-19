import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  order: number;
  points: number;
}

interface Exam {
  id: number;
  title: string;
  description: string;
  duration: number;
  passingGrade: number;
  totalQuestions: number;
}

interface ExamData {
  exam: Exam;
  questions: ExamQuestion[];
}

interface ExamAttempt {
  id: number;
  startedAt: string;
}

interface ExamResult {
  id: number;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
}

export default function ExamPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examAttempt, setExamAttempt] = useState<ExamAttempt | null>(null);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<number>>(new Set());

  const courseIdNum = parseInt(courseId!);

  const { data: examData, isLoading: examLoading, error: examError } = useQuery<ExamData>({
    queryKey: ["/api/courses", courseIdNum, "exam"],
    retry: false,
    enabled: !examStarted,
  });

  const startExamMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/exams/${examData?.exam.id}/start`);
      return response.json();
    },
    onSuccess: (attempt: ExamAttempt) => {
      setExamAttempt(attempt);
      setExamStarted(true);
      setTimeLeft(examData!.exam.duration * 60); // Convert minutes to seconds
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مخول",
          description: "يتم إعادة تسجيل الدخول...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ في بدء الاختبار",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const submitExamMutation = useMutation({
    mutationFn: async () => {
      if (!examAttempt) throw new Error("No exam attempt found");
      const response = await apiRequest('POST', `/api/exam-attempts/${examAttempt.id}/submit`, {
        answers,
      });
      return response.json();
    },
    onSuccess: (result: ExamResult) => {
      toast({
        title: result.passed ? "تهانينا!" : "للأسف",
        description: result.passed 
          ? `لقد اجتزت الاختبار بدرجة ${result.score}%`
          : `لم تجتز الاختبار. درجتك: ${result.score}%`,
        variant: result.passed ? "default" : "destructive",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/my-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      // Redirect to course details
      setTimeout(() => {
        setLocation(`/courses/${courseId}`);
      }, 2000);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مخول",
          description: "يتم إعادة تسجيل الدخول...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ في تسليم الاختبار",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Timer countdown
  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Auto submit when time is up
            submitExamMutation.mutate();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft, submitExamMutation]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const toggleQuestionFlag = (questionId: number) => {
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const getQuestionStatus = (questionId: number) => {
    if (answers[questionId]) return 'answered';
    if (flaggedQuestions.has(questionId)) return 'flagged';
    return 'unanswered';
  };

  const getStatusColor = (status: string, isCurrent: boolean) => {
    if (isCurrent) return 'bg-[hsl(45,76%,58%)] text-white';
    switch (status) {
      case 'answered':
        return 'bg-[hsl(158,40%,34%)] text-white';
      case 'flagged':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-gray-200 text-gray-700 hover:bg-gray-300';
    }
  };

  const canSubmitExam = () => {
    return examData && Object.keys(answers).length === examData.questions.length;
  };

  // Handle exam access error
  if (examError && !examStarted) {
    const errorMessage = examError.message;
    const isAccessDenied = errorMessage.includes("must complete all lessons");
    
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <i className={`fas ${isAccessDenied ? 'fa-lock' : 'fa-exclamation-triangle'} text-4xl text-red-500 mb-4`}></i>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {isAccessDenied ? "غير مسموح الوصول للاختبار" : "خطأ في تحميل الاختبار"}
              </h2>
              <p className="text-gray-600 mb-4">
                {isAccessDenied 
                  ? "يجب إتمام جميع المحاضرات قبل الوصول للاختبار"
                  : "حدث خطأ أثناء تحميل الاختبار"
                }
              </p>
              <Link href={`/courses/${courseId}`}>
                <Button>العودة للمادة</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (examLoading) {
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

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <h2 className="text-xl font-bold text-gray-900 mb-2">الاختبار غير موجود</h2>
              <p className="text-gray-600 mb-4">لم يتم العثور على اختبار لهذه المادة</p>
              <Link href={`/courses/${courseId}`}>
                <Button>العودة للمادة</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8">
              <div className="text-center max-w-2xl mx-auto">
                <i className="fas fa-clipboard-list text-6xl text-[hsl(158,40%,34%)] mb-6"></i>
                <h1 className="text-3xl font-amiri font-bold text-[hsl(158,40%,34%)] mb-4">
                  {examData.exam.title}
                </h1>
                <p className="text-gray-600 mb-6">{examData.exam.description}</p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">تفاصيل الاختبار</h3>
                    <ul className="text-sm space-y-1">
                      <li>عدد الأسئلة: {examData.exam.totalQuestions}</li>
                      <li>المدة المحددة: {examData.exam.duration} دقيقة</li>
                      <li>الدرجة المطلوبة للنجاح: {examData.exam.passingGrade}%</li>
                    </ul>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">تعليمات مهمة</h3>
                    <ul className="text-sm space-y-1">
                      <li>• يجب الإجابة على جميع الأسئلة</li>
                      <li>• لا يمكن العودة بعد التسليم</li>
                      <li>• سيتم التسليم تلقائياً عند انتهاء الوقت</li>
                    </ul>
                  </div>
                </div>
                
                <Button 
                  onClick={() => startExamMutation.mutate()}
                  disabled={startExamMutation.isPending}
                  size="lg"
                  className="btn-primary text-lg px-8 py-3"
                >
                  {startExamMutation.isPending ? "جاري البدء..." : "بدء الاختبار"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const currentQuestion = examData.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / examData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Exam Header */}
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h1 className="font-amiri font-bold text-xl text-[hsl(158,40%,34%)]">
                اختبار: {examData.exam.title}
              </h1>
              <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
                <span>السؤال {currentQuestionIndex + 1} من {examData.questions.length}</span>
                <div className="flex items-center gap-2">
                  <i className="fas fa-clock text-[hsl(45,76%,58%)]"></i>
                  <span className={`font-bold ${timeLeft < 300 ? 'text-red-600' : ''}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-[hsl(158,40%,34%)] h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Current Question */}
            <div className="mb-8">
              <h2 className="font-semibold text-lg mb-4">
                {currentQuestion.question}
              </h2>
              
              <RadioGroup
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option, index) => {
                  const optionValue = String.fromCharCode(65 + index); // A, B, C, D
                  return (
                    <div key={index} className="flex items-center space-x-reverse space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem 
                        value={optionValue} 
                        id={`option-${index}`}
                        className="text-[hsl(158,40%,34%)]"
                      />
                      <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
              >
                السؤال السابق
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => toggleQuestionFlag(currentQuestion.id)}
                  className={flaggedQuestions.has(currentQuestion.id) ? "bg-orange-100 border-orange-300" : ""}
                >
                  <i className="fas fa-flag ml-1"></i>
                  {flaggedQuestions.has(currentQuestion.id) ? "إزالة العلامة" : "وضع علامة"}
                </Button>
                
                {currentQuestionIndex < examData.questions.length - 1 ? (
                  <Button
                    onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                    className="btn-primary"
                  >
                    السؤال التالي
                  </Button>
                ) : (
                  <Button
                    onClick={() => submitExamMutation.mutate()}
                    disabled={!canSubmitExam() || submitExamMutation.isPending}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {submitExamMutation.isPending ? "جاري التسليم..." : "تسليم الاختبار"}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Question Navigator */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold mb-3">الأسئلة:</h3>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {examData.questions.map((question, index) => {
                  const status = getQuestionStatus(question.id);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => handleQuestionNavigation(index)}
                      className={`w-10 h-10 rounded-lg text-sm font-semibold transition-colors ${getStatusColor(status, isCurrent)}`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              <div className="flex gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-[hsl(158,40%,34%)]"></div>
                  <span>تم الإجابة</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-[hsl(45,76%,58%)]"></div>
                  <span>السؤال الحالي</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-orange-500"></div>
                  <span>معلم بعلامة</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gray-300"></div>
                  <span>لم تتم الإجابة</span>
                </div>
              </div>
            </div>
            
            {!canSubmitExam() && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <i className="fas fa-exclamation-triangle ml-1"></i>
                  يجب الإجابة على جميع الأسئلة قبل التسليم
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
