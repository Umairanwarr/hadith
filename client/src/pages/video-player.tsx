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
  id: string;
  title: string;
  instructor: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: number;
  order: number;
  courseId: string;
  videoUrl?: string | null;
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

export default function VideoPlayer() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytIntervalRef = useRef<number | null>(null);

  // We avoid destroying the YT player between lessons to prevent DOM errors.
  // Instead we keep a single instance and call loadVideoById when lesson changes.

  const courseIdStr = courseId!;
  const lessonIdStr = lessonId!;

  const { data: course } = useQuery<Course>({
    queryKey: ["api", "courses", courseIdStr],
    retry: false,
  });

  const { data: lessons } = useQuery<Lesson[]>({
    queryKey: ["api", "courses", courseIdStr, "lessons"],
    retry: false,
  });

  const { data: courseProgress } = useQuery<CourseProgress>({
    queryKey: ["api", "courses", courseIdStr, "progress"],
    retry: false,
  });

  const currentLesson = lessons?.find(l => l.id === lessonIdStr);
  const currentProgress = courseProgress?.lessonProgress.find(p => p.lessonId === lessonIdStr);

  const updateProgressMutation = useMutation({
    mutationFn: async ({ watchedDuration, isCompleted }: { watchedDuration: number; isCompleted: boolean }) => {
      await apiRequest('POST', `/api/lessons/${lessonIdStr}/progress`, {
        watchedDuration,
        isCompleted,
        courseId: courseIdStr,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "courses", courseIdStr, "progress"] });
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
      // Reset any existing timers so new lesson tracking can attach cleanly
      if (ytIntervalRef.current) {
        window.clearInterval(ytIntervalRef.current);
        ytIntervalRef.current = null;
      }
    }
  }, [currentLesson, currentProgress]);

  // Auto-save progress every 10 seconds (native <video> only)
  useEffect(() => {
    const video = videoElRef.current;
    if (!video) return;
    const handler = setInterval(() => {
      const watched = Math.floor(video.currentTime || 0);
      const total = Math.floor(video.duration || duration || currentLesson?.duration || 0);
      const isCompleted = total > 0 && watched >= total * 0.9;
      setCurrentTime(watched);
      setDuration(total);
      updateProgressMutation.mutate({ watchedDuration: watched, isCompleted });
    }, 10000);
    return () => clearInterval(handler);
  }, [updateProgressMutation, duration, currentLesson]);

  // YouTube embed tracking (requires enablejsapi=1). Keep a single player instance.
  useEffect(() => {
    if (!currentLesson?.videoUrl || !/(youtube\.com|youtu\.be)/.test(currentLesson.videoUrl)) {
      return;
    }

    // Load YT API once
    const loadYouTubeApi = () =>
      new Promise<void>((resolve) => {
        const existing = document.getElementById("youtube-iframe-api");
        if (existing) return resolve();
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        (window as any).onYouTubeIframeAPIReady = () => resolve();
        document.body.appendChild(tag);
      });

    let cancelled = false;
    void (async () => {
      await loadYouTubeApi();
      if (cancelled) return;
      const YT = (window as any).YT;
      if (!YT || !YT.Player) return;
      const videoId = getYouTubeId(currentLesson.videoUrl);
      if (!videoId) return;
      const container = document.getElementById("yt-player");
      if (!container) return;

      if (ytPlayerRef.current) {
        // Reuse existing player
        try {
          ytPlayerRef.current.loadVideoById(videoId);
        } catch {}
      } else {
        ytPlayerRef.current = new YT.Player("yt-player", {
          videoId,
          events: {
            onStateChange: (event: any) => {
              // Start/stop interval when playing/paused
              if (event.data === YT.PlayerState.PLAYING) {
                if (ytIntervalRef.current) window.clearInterval(ytIntervalRef.current);
                ytIntervalRef.current = window.setInterval(() => {
                  const watched = Math.floor(ytPlayerRef.current?.getCurrentTime() || 0);
                  const total = Math.floor(ytPlayerRef.current?.getDuration() || 0);
                  const isCompleted = total > 0 && watched >= total * 0.9;
                  setCurrentTime(watched);
                  setDuration(total || duration);
                  updateProgressMutation.mutate({ watchedDuration: watched, isCompleted });
                }, 5000);
              } else {
                if (ytIntervalRef.current) {
                  window.clearInterval(ytIntervalRef.current);
                  ytIntervalRef.current = null;
                }
                if (event.data === YT.PlayerState.ENDED) {
                  const watched = Math.floor(ytPlayerRef.current?.getDuration() || 0);
                  const total = Math.floor(ytPlayerRef.current?.getDuration() || 0);
                  setCurrentTime(watched);
                  setDuration(total || duration);
                  updateProgressMutation.mutate({ watchedDuration: watched, isCompleted: true });
                }
              }
            },
          },
        });
      }
    })();

    return () => {
      cancelled = true;
      if (ytIntervalRef.current) {
        window.clearInterval(ytIntervalRef.current);
        ytIntervalRef.current = null;
      }
    };
  }, [currentLesson?.videoUrl, updateProgressMutation, duration]);

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
    const video = videoElRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
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
    return (currentProgress?.isCompleted ?? false) || currentTime >= duration * 0.9;
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
                    <Link href={`/course/${courseIdStr}`}>
                <Button>العودة للمادة</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const isYouTubeUrl = (url?: string | null) => !!url && /(youtube\.com|youtu\.be)/.test(url);
  const isVimeoUrl = (url?: string | null) => !!url && /vimeo\.com/.test(url);
  const getYouTubeId = (url?: string | null) => {
    if (!url) return null;
    // Robust extraction: supports various formats
    const short = url.match(/youtu\.be\/([^?&#/]+)/);
    if (short?.[1]) return short[1];
    const long = url.match(/[?&]v=([^?&#/]+)/);
    if (long?.[1]) return long[1];
    const embed = url.match(/embed\/([^?&#/]+)/);
    if (embed?.[1]) return embed[1];
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Video Player */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-black aspect-video relative flex items-center justify-center">
            {currentLesson.videoUrl ? (
              isYouTubeUrl(currentLesson.videoUrl) ? (
                <div id="yt-player" className="w-full h-full" />
              ) : isVimeoUrl(currentLesson.videoUrl) ? (
                <iframe
                  key={`vim-${lessonIdStr}`}
                  src={currentLesson.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                  title={currentLesson.title}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoElRef}
                  key={`native-${lessonIdStr}`}
                  className="w-full h-full"
                  src={currentLesson.videoUrl}
                  controls
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedMetadata={(e) => setDuration(Math.floor((e.target as HTMLVideoElement).duration))}
                />
              )
            ) : (
              <div className="text-white text-center">
                <i className="fas fa-play-circle text-6xl mb-4"></i>
                <p className="text-lg">{currentLesson.title}</p>
                <p className="text-sm text-gray-300 mt-2">
                  {course?.instructor} - {course?.title}
                </p>
              </div>
            )}
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
                    <Link href={`/course/${courseIdStr}/lessons/${getPrevLesson()!.id}`}>
                      <Button variant="outline">
                        <i className="fas fa-chevron-right ml-2"></i>
                        المحاضرة السابقة
                      </Button>
                    </Link>
                  )}
                  
                  {getNextLesson() && isLessonCompleted() && (
                    <Link href={`/course/${courseIdStr}/lessons/${getNextLesson()!.id}`}>
                      <Button className="btn-primary">
                        المحاضرة التالية
                        <i className="fas fa-chevron-left mr-2"></i>
                      </Button>
                    </Link>
                  )}

                  {!getNextLesson() && isLessonCompleted() && (
                    <Link href={`/course/${courseIdStr}/exam`}>
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
                    const lessonProgress = courseProgress?.lessonProgress.find(p => p.lessonId === lesson.id);
                    const isCompleted = lessonProgress?.isCompleted || false;
                    const isCurrent = lesson.id === lessonIdStr;
                    
                    return (
                      <Link 
                        key={lesson.id} 
                        href={`/course/${courseId}/lessons/${lesson.id}`}
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
