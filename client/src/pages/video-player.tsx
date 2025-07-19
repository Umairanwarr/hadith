import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface Course {
  id: number;
  title: string;
  instructor: string;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: number;
  order: number;
  courseId: number;
}

interface LessonProgress {
  id: number;
  lessonId: number;
  isCompleted: boolean;
  watchedDuration: number;
}

export default function VideoPlayer() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  const courseIdNum = parseInt(courseId!);
  const lessonIdNum = parseInt(lessonId!);

  const { data: course } = useQuery<Course>({
    queryKey: ["/api/courses", courseIdNum],
    retry: false,
  });

  const { data: lessons } = useQuery<Lesson[]>({
    queryKey: ["/api/courses", courseIdNum, "lessons"],
    retry: false,
  });

  const { data: progress } = useQuery<LessonProgress[]>({
    queryKey: ["/api/courses", courseIdNum, "progress"],
    retry: false,
  });

  const currentLesson = lessons?.find(l => l.id === lessonIdNum);
  const currentProgress = progress?.find(p => p.lessonId === lessonIdNum);

  const updateProgressMutation = useMutation({
    mutationFn: async ({ watchedDuration, isCompleted }: { watchedDuration: number; isCompleted: boolean }) => {
      await apiRequest('POST', `/api/lessons/${lessonIdNum}/progress`, {
        watchedDuration,
        isCompleted,
        courseId: courseIdNum,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/courses", courseIdNum, "progress"] });
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
      console.error("Error updating progress:", error);
    },
  });

  // Initialize video state
  useEffect(() => {
    if (currentLesson) {
      setDuration(currentLesson.duration);
      setCurrentTime(currentProgress?.watchedDuration || 0);
    }
  }, [currentLesson, currentProgress]);

  // Auto-save progress every 10 seconds
  useEffect(() => {
    if (isPlaying && currentLesson) {
      const interval = setInterval(() => {
        const isCompleted = currentTime >= currentLesson.duration * 0.9; // 90% completion
        updateProgressMutation.mutate({
          watchedDuration: currentTime,
          isCompleted,
        });
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, currentTime, currentLesson, updateProgressMutation]);

  // Video playback simulation
  useEffect(() => {
    if (isPlaying && currentTime < duration) {
      intervalRef.current = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;
          if (newTime >= duration) {
            setIsPlaying(false);
            // Mark as completed when video ends
            updateProgressMutation.mutate({
              watchedDuration: duration,
              isCompleted: true,
            });
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentTime, duration, updateProgressMutation]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  const isLessonCompleted = () => {
    return currentProgress?.isCompleted || currentTime >= duration * 0.9;
  };

  const getNextLesson = () => {
    if (!lessons || !currentLesson) return null;
    return lessons.find(l => l.order === currentLesson.order + 1);
  };

  const getPrevLesson = () => {
    if (!lessons || !currentLesson) return null;
    return lessons.find(l => l.order === currentLesson.order - 1);
  };

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <h2 className="text-xl font-bold text-gray-900 mb-2">المحاضرة غير موجودة</h2>
              <p className="text-gray-600 mb-4">لم يتم العثور على المحاضرة المطلوبة</p>
              <Link href={`/courses/${courseId}`}>
                <Button>العودة للمادة</Button>
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
        {/* Video Player */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-black aspect-video relative">
            {/* Video placeholder */}
            <div className="absolute inset-0 flex items-center justify-center text-white">
              <div className="text-center">
                <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}-circle text-6xl mb-4 cursor-pointer`} 
                   onClick={togglePlayPause}></i>
                <p className="text-lg">{currentLesson.title}</p>
                <p className="text-sm text-gray-300 mt-2">
                  {course?.instructor} - {course?.title}
                </p>
              </div>
            </div>
            
            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="flex items-center gap-4 text-white">
                <button onClick={togglePlayPause} className="hover:text-[hsl(45,76%,58%)]">
                  <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`}></i>
                </button>
                <div className="flex-1">
                  <div 
                    className="bg-white/30 h-1 rounded-full cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const newTime = (clickX / rect.width) * duration;
                      handleSeek(Math.floor(newTime));
                    }}
                  >
                    <div 
                      className="bg-[hsl(45,76%,58%)] h-1 rounded-full transition-all duration-200" 
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>
                <button className="hover:text-[hsl(45,76%,58%)]">
                  <i className="fas fa-expand"></i>
                </button>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h1 className="font-amiri font-bold text-2xl mb-3">{currentLesson.title}</h1>
                <p className="text-gray-600 mb-4">{course?.instructor}</p>
                <p className="text-gray-700 leading-relaxed mb-4">{currentLesson.description}</p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">متطلبات إتمام المحاضرة:</h4>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <i className={`fas fa-check-circle ${getProgressPercentage() > 90 ? 'text-green-600' : 'text-gray-400'}`}></i>
                      مشاهدة المحاضرة كاملة (90% على الأقل)
                    </li>
                    <li className="flex items-center gap-2">
                      <i className={`fas fa-check-circle ${isLessonCompleted() ? 'text-green-600' : 'text-gray-400'}`}></i>
                      إتمام المحاضرة بنجاح
                    </li>
                  </ul>
                </div>
                
                <div className="flex gap-3">
                  {getPrevLesson() && (
                    <Link href={`/courses/${courseId}/lessons/${getPrevLesson()!.id}`}>
                      <Button variant="outline">
                        <i className="fas fa-chevron-right ml-2"></i>
                        المحاضرة السابقة
                      </Button>
                    </Link>
                  )}
                  
                  {getNextLesson() && isLessonCompleted() && (
                    <Link href={`/courses/${courseId}/lessons/${getNextLesson()!.id}`}>
                      <Button className="btn-primary">
                        المحاضرة التالية
                        <i className="fas fa-chevron-left mr-2"></i>
                      </Button>
                    </Link>
                  )}

                  {!getNextLesson() && isLessonCompleted() && (
                    <Link href={`/courses/${courseId}/exam`}>
                      <Button className="btn-secondary">
                        <i className="fas fa-clipboard-list ml-2"></i>
                        الانتقال للاختبار
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
              
              {/* Course Navigation */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-4">محتويات المادة</h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {lessons?.map((lesson) => {
                    const lessonProgress = progress?.find(p => p.lessonId === lesson.id);
                    const isCompleted = lessonProgress?.isCompleted || false;
                    const isCurrent = lesson.id === lessonIdNum;
                    
                    return (
                      <Link 
                        key={lesson.id} 
                        href={`/courses/${courseId}/lessons/${lesson.id}`}
                      >
                        <div className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-colors ${
                          isCurrent 
                            ? 'bg-green-100 border border-green-200' 
                            : 'hover:bg-white'
                        }`}>
                          <div className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center ${
                            isCompleted 
                              ? 'bg-[hsl(158,40%,34%)]' 
                              : isCurrent 
                                ? 'bg-[hsl(45,76%,58%)]' 
                                : 'bg-gray-300'
                          }`}>
                            {isCompleted ? (
                              <i className="fas fa-check"></i>
                            ) : isCurrent ? (
                              <i className="fas fa-play"></i>
                            ) : (
                              <i className="fas fa-lock"></i>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{lesson.title}</div>
                            <div className="text-xs text-gray-500">{formatTime(lesson.duration)}</div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
