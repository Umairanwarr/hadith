import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Trophy } from "lucide-react";
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
  id: string;
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
  questionsWithAnswers?: Array<{
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
    order: number;
    points: number;
  }>;
}

interface CompletedAttempt {
  id: string;
  score: string;
  passed: boolean;
  completedAt: string;
}

export default function ExamPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const courseIdStr = courseId!;
  
  const [examStarted, setExamStarted] = useState(() => {
    // Check if there's an active exam session in localStorage
    const activeExam = localStorage.getItem(`activeExam_${courseIdStr}`);
    return activeExam ? JSON.parse(activeExam).isActive : false;
  });
  
  // Debug examStarted state changes
  useEffect(() => {
    console.log('examStarted changed to:', examStarted);
  }, [examStarted]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examAttempt, setExamAttempt] = useState<ExamAttempt | null>(null);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState<Record<number, string>>({});
  
  // Get examId from URL parameters if provided
  const urlParams = new URLSearchParams(window.location.search);
  const examId = urlParams.get('examId');

  const { data: examData, isLoading: examLoading, error: examError } = useQuery<ExamData>({
    queryKey: examId ? ["api", "exams", examId, "details"] : ["api", "courses", courseIdStr, "exam"],
    retry: false,
    enabled: true, // Always enable to allow data loading for active sessions
  });
  
  // Restore exam session on component mount
  useEffect(() => {
    const activeExam = localStorage.getItem(`activeExam_${courseIdStr}`);
    if (activeExam && examData) {
      const examSession = JSON.parse(activeExam);
      if (examSession.isActive && examSession.examId === examData.exam.id) {
        setExamAttempt({
          id: examSession.attemptId,
          startedAt: examSession.startedAt
        });
        setExamStarted(true);
        
        // Calculate remaining time based on start time
        const startTime = new Date(examSession.startedAt).getTime();
        const currentTime = new Date().getTime();
        const elapsedMinutes = (currentTime - startTime) / (1000 * 60);
        const remainingTime = Math.max(0, (examData.exam.duration * 60) - (elapsedMinutes * 60));
        setTimeLeft(Math.floor(remainingTime));
      }
    }
  }, [examData, courseIdStr]);

  const startExamMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', `/api/exams/${examData?.exam.id}/start`);
      return response.json();
    },
    onSuccess: (attempt: ExamAttempt) => {
      setExamAttempt(attempt);
      setExamStarted(true);
      setTimeLeft(examData!.exam.duration * 60); // Convert minutes to seconds
      
      // Persist exam session to localStorage
      localStorage.setItem(`activeExam_${courseIdStr}`, JSON.stringify({
        isActive: true,
        attemptId: attempt.id,
        startedAt: attempt.startedAt,
        examId: examData!.exam.id
      }));
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مخول",
          description: "يتم إعادة تسجيل الدخول...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
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
      setExamResult(result);
      setExamSubmitted(true);
      setShowAnswers(true);
      
      // Clear exam session from localStorage
      localStorage.removeItem(`activeExam_${courseIdStr}`);
      
      // Get correct answers from the server response
      if (result.questionsWithAnswers) {
        const correctAnswersMap: Record<number, string> = {};
        result.questionsWithAnswers.forEach((q) => {
          correctAnswersMap[q.id] = q.correctAnswer;
        });
        setCorrectAnswers(correctAnswersMap);
      }
      
      toast({
        title: result.passed ? "تهانينا!" : "للأسف",
        description: result.passed 
          ? `لقد اجتزت الاختبار بدرجة ${result.score}%`
          : `لم تجتز الاختبار. درجتك: ${result.score}%`,
        variant: result.passed ? "default" : "destructive",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/my-certificates"] });
      queryClient.invalidateQueries({ queryKey: ["/dashboard/stats"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مخول",
          description: "يتم إعادة تسجيل الدخول...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
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
            localStorage.removeItem(`activeExam_${courseIdStr}`);
            submitExamMutation.mutate();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted, timeLeft]);

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

  const canSubmitExam = () => {
    return examData && Object.keys(answers).length === examData.questions.length;
  };

  // Handle exam access error
  if (examError && !examStarted) {
    const errorMessage = examError.message;
    const isAccessDenied = errorMessage.includes("must complete all lessons");
    const alreadyCompleted = errorMessage.includes("already completed this exam");
    
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <i className={`fas ${alreadyCompleted ? 'fa-check-circle' : isAccessDenied ? 'fa-lock' : 'fa-exclamation-triangle'} text-4xl ${alreadyCompleted ? 'text-green-500' : 'text-red-500'} mb-4`}></i>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {alreadyCompleted ? "تم إكمال الاختبار بالفعل" : isAccessDenied ? "غير مسموح الوصول للاختبار" : "خطأ في تحميل الاختبار"}
              </h2>
              <p className="text-gray-600 mb-4">
                {alreadyCompleted
                  ? "لقد أكملت هذا الاختبار من قبل ولا يمكنك إعادة تقديمه"
                  : isAccessDenied 
                  ? "يجب إتمام جميع المحاضرات قبل الوصول للاختبار"
                  : "حدث خطأ أثناء تحميل الاختبار"
                }
              </p>
          <Link href={`/course/${courseId}`}>
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
              <div className="h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl"></div>
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded-lg w-1/2"></div>
                  <div className="space-y-3 mt-8">
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">الاختبار غير موجود</h2>
                <p className="text-gray-600 mb-8 text-lg">لم يتم العثور على اختبار لهذه المادة</p>
                <Link href={`/course/${courseId}`}>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 px-8">
                    العودة للمادة
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  // Show exam results screen
  if (examSubmitted && examResult) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8">
              {/* Results Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${examResult.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                  {examResult.passed ? (
                    <Trophy className="w-10 h-10 text-green-600" />
                  ) : (
                    <XCircle className="w-10 h-10 text-red-600" />
                  )}
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  {examResult.passed ? "تهانينا! لقد نجحت" : "للأسف، لم تنجح"}
                </h1>
                <p className="text-gray-600 text-lg">
                  درجتك: {examResult.score}% ({examResult.correctAnswers} من {examResult.totalQuestions})
                </p>
              </div>

              {/* Results Summary */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-blue-900 mb-1">النتيجة النهائية</h3>
                  <p className="text-2xl font-bold text-blue-600">{examResult.score}%</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-green-900 mb-1">الإجابات الصحيحة</h3>
                  <p className="text-2xl font-bold text-green-600">{examResult.correctAnswers}</p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <h3 className="font-semibold text-red-900 mb-1">الإجابات الخاطئة</h3>
                  <p className="text-2xl font-bold text-red-600">{examResult.totalQuestions - examResult.correctAnswers}</p>
                </div>
              </div>

              {/* Review Answers */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">مراجعة الإجابات</h2>
                <div className="space-y-6">
                  {examData?.questions.map((question, index) => {
                    const userAnswer = answers[question.id];
                    const isCorrect = userAnswer === correctAnswers[question.id];
                    
                    return (
                      <div key={question.id} className={`p-4 rounded-lg border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                        <div className="flex items-start gap-3 mb-3">
                          {isCorrect ? (
                            <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 mt-1 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">السؤال {index + 1}: {question.question}</h3>
                            <div className="space-y-2">
                              {question.options.map((option, optIndex) => {
                                const isUserAnswer = userAnswer === option;
                                const isCorrectAnswer = correctAnswers[question.id] === option;
                                
                                let optionClass = "p-2 rounded border ";
                                if (isCorrectAnswer) {
                                  optionClass += "bg-green-100 border-green-300 text-green-800";
                                } else if (isUserAnswer && !isCorrectAnswer) {
                                  optionClass += "bg-red-100 border-red-300 text-red-800";
                                } else {
                                  optionClass += "bg-gray-50 border-gray-200";
                                }
                                
                                return (
                                  <div key={optIndex} className={optionClass}>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span>
                                      <span>{option}</span>
                                      {isCorrectAnswer && (
                                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                                          الإجابة الصحيحة
                                        </Badge>
                                      )}
                                      {isUserAnswer && !isCorrectAnswer && (
                                        <Badge variant="destructive">
                                          اخترت هذا
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-4">
                <Link href={`/course/${courseId}/exams`}>
                  <Button size="lg">
                    العودة لاختبارات المادة
                  </Button>
                </Link>
                {examResult.passed && (
                  <Link href="/certificates">
                    <Button size="lg" className="bg-green-600 hover:bg-green-700">
                      <Trophy className="w-4 h-4 ml-2" />
                      عرض الشهادة
                    </Button>
              </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <div className="text-center text-white">
                  <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                    <i className="fas fa-clipboard-list text-3xl"></i>
                  </div>
                  <h1 className="text-3xl font-bold mb-2">
                  {examData.exam.title}
                </h1>
                  <p className="text-emerald-100 text-lg">{examData.exam.description}</p>
                </div>
              </div>
              
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center ml-3">
                        <i className="fas fa-info-circle text-green-600"></i>
                      </div>
                      <h3 className="font-bold text-lg text-green-800">تفاصيل الاختبار</h3>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <i className="fas fa-question-circle text-green-600 w-5 ml-2"></i>
                        <span className="font-medium">عدد الأسئلة:</span>
                        <span className="mr-auto font-bold text-green-700">{examData.exam.totalQuestions}</span>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-clock text-green-600 w-5 ml-2"></i>
                        <span className="font-medium">المدة المحددة:</span>
                        <span className="mr-auto font-bold text-green-700">{examData.exam.duration} دقيقة</span>
                      </li>
                      <li className="flex items-center">
                        <i className="fas fa-trophy text-green-600 w-5 ml-2"></i>
                        <span className="font-medium">درجة النجاح:</span>
                        <span className="mr-auto font-bold text-green-700">{examData.exam.passingGrade}%</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border border-amber-100">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center ml-3">
                        <i className="fas fa-exclamation-triangle text-amber-600"></i>
                      </div>
                      <h3 className="font-bold text-lg text-amber-800">تعليمات مهمة</h3>
                    </div>
                    <ul className="space-y-3 text-amber-800">
                      <li className="flex items-start">
                        <i className="fas fa-check-circle text-amber-600 w-5 ml-2 mt-0.5"></i>
                        <span>يجب الإجابة على جميع الأسئلة</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-lock text-amber-600 w-5 ml-2 mt-0.5"></i>
                        <span>لا يمكن العودة بعد التسليم</span>
                      </li>
                      <li className="flex items-start">
                        <i className="fas fa-hourglass-half text-amber-600 w-5 ml-2 mt-0.5"></i>
                        <span>سيتم التسليم تلقائياً عند انتهاء الوقت</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="text-center">
                <Button 
                  onClick={() => startExamMutation.mutate()}
                  disabled={startExamMutation.isPending}
                  size="lg"
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-lg px-12 py-4 rounded-2xl shadow-lg transform transition-all duration-200 hover:scale-105"
                  >
                    {startExamMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin ml-2"></i>
                        جاري البدء...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-play ml-2"></i>
                        بدء الاختبار
                      </>
                    )}
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const progressPercentage = (Object.keys(answers).length / examData.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Exam Header Card */}
        <Card className="mb-6 shadow-lg border-0 bg-white/90 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="font-bold text-2xl text-gray-800 mb-1">
                  {examData.exam.title}
              </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <i className="fas fa-question-circle text-emerald-600 ml-1"></i>
                    تم الإجابة على {Object.keys(answers).length} من {examData.questions.length} سؤال
                  </span>
                </div>
              </div>
              <div className="text-left">
                <div className={`flex items-center gap-2 text-lg font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-green-600'}`}>
                  <i className={`fas fa-clock ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-green-600'}`}></i>
                  <span>
                    {formatTime(timeLeft)}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">الوقت المتبقي</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>التقدم</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Questions Card */}
        <Card className="mb-6 shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8">
            
            {/* All Questions */}
            <div className="space-y-12">
              {examData.questions.map((question, questionIndex) => (
                <div key={question.id} className="border-b border-gray-100 pb-8 last:border-b-0">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center ml-4">
                      <span className="text-white font-bold">{questionIndex + 1}</span>
                    </div>
                    <h2 className="font-bold text-xl text-gray-800 leading-relaxed">
                      {question.question}
                    </h2>
                  </div>
                  
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                    className="space-y-4 mr-16"
                  >
                    {question.options.map((option, optionIndex) => {
                      const isSelected = answers[question.id] === option;
                      const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D...
                      
                      return (
                        <div 
                          key={optionIndex} 
                          className={`group relative flex items-center py-4 px-6 border-2 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-[1.01] ${
                            isSelected 
                              ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 shadow-lg ring-1 ring-emerald-200' 
                              : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 hover:shadow-md'
                          }`}
                        >
                          {/* Letter Circle */}
                          <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                            isSelected 
                              ? 'border-emerald-500 bg-emerald-500 text-white shadow-md' 
                              : 'border-gray-300 group-hover:border-emerald-400 bg-white'
                          }`}>
                            {isSelected ? (
                              <i className="fas fa-check text-sm font-bold"></i>
                            ) : (
                              <span className="text-sm font-bold text-gray-600 group-hover:text-emerald-600">{optionLetter}</span>
                            )}
                          </div>
                          
                          {/* Spacer */}
                          <div className="w-4"></div>
                          
                          <RadioGroupItem 
                            value={option} 
                            id={`option-${question.id}-${optionIndex}`}
                            className="sr-only"
                          />
                          
                          {/* Option Text */}
                          <Label 
                            htmlFor={`option-${question.id}-${optionIndex}`} 
                            className="flex-1 cursor-pointer text-gray-800 font-medium leading-relaxed text-lg py-2"
                          >
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                </div>
              ))}
            </div>
            
            {/* Submit Button */}
            <div className="flex justify-center mt-8 pt-6 border-t border-gray-100">
              <Button
                onClick={() => submitExamMutation.mutate()}
                disabled={!canSubmitExam() || submitExamMutation.isPending}
                size="lg"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-12 py-4 font-bold shadow-lg text-lg"
              >
                {submitExamMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin ml-2"></i>
                    جاري التسليم...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane ml-2"></i>
                    تسليم الاختبار
                  </>
                )}
              </Button>
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
