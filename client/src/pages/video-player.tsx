import { Link, useParams } from "wouter";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  // Utility function to extract YouTube video ID from URL
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

  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isYouTubePlayerReady, setIsYouTubePlayerReady] = useState(false);
  const [hasVideoEnded, setHasVideoEnded] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytIntervalRef = useRef<number | null>(null);
  const hasSetInitialPosition = useRef<boolean>(false);

  // We avoid destroying the YT player between lessons to prevent DOM errors.
  // Instead we keep a single instance and call loadVideoById when lesson changes.

  const courseIdStr = courseId!;
  const lessonIdStr = lessonId!;

  const { data: course, isLoading: courseLoading, error: courseError } = useQuery<Course>({
    queryKey: ["api", "courses", courseIdStr],
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: lessons, isLoading: lessonsLoading, error: lessonsError } = useQuery<Lesson[]>({
    queryKey: ["api", "courses", courseIdStr, "lessons"],
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: courseProgress, isLoading: progressLoading, error: progressError } = useQuery<CourseProgress>({
    queryKey: ["api", "courses", courseIdStr, "progress"],
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
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
      // Only invalidate queries if video hasn't ended to prevent reload loops
      if (!hasVideoEnded) {
        queryClient.invalidateQueries({ queryKey: ["api", "courses", courseIdStr, "progress"] });
      }
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
      console.error("Error updating progress:", error);
    },
  });

  // Initialize video state
  useEffect(() => {
    if (currentLesson) {
      setDuration(currentLesson.duration);
      setCurrentTime(currentProgress?.watchedDuration || 0);
      setHasVideoEnded(false); // Reset video ended state when switching lessons
      hasSetInitialPosition.current = false; // Reset initial position flag
      setCurrentVideoId(null); // Reset current video ID
      // Reset any existing timers so new lesson tracking can attach cleanly
      if (ytIntervalRef.current) {
        window.clearInterval(ytIntervalRef.current);
        ytIntervalRef.current = null;
      }
    }
  }, [currentLesson, currentProgress]);

  // Auto-save progress every 30 seconds (native <video> only) - reduced frequency
  useEffect(() => {
    const video = videoElRef.current;
    if (!video || !currentLesson?.videoUrl) return;
    
    const handler = setInterval(() => {
      if (video.paused) return; // Don't update when paused
      const watched = Math.floor(video.currentTime || 0);
      const total = Math.floor(video.duration || currentLesson?.duration || 0);
      const isCompleted = total > 0 && watched >= total * 0.9;
      // Only update if there's a significant change
      if (Math.abs(watched - currentTime) >= 1) {
        setCurrentTime(watched);
      }
      if (total > 0 && total !== duration) {
        setDuration(total);
      }
      updateProgressMutation.mutate({ watchedDuration: watched, isCompleted });
    }, 30000); // Increased to 30 seconds
    
    return () => clearInterval(handler);
  }, [currentLesson?.videoUrl, updateProgressMutation]);

  // Handle native video events
  useEffect(() => {
    const video = videoElRef.current;
    if (!video || !currentLesson?.videoUrl) return;

    const handleTimeUpdate = () => {
      const watched = Math.floor(video.currentTime || 0);
      // Throttle time updates to prevent excessive re-renders
      if (Math.abs(watched - currentTime) >= 1) {
        setCurrentTime(watched);
      }
    };

    const handleLoadedMetadata = () => {
      const total = Math.floor(video.duration || 0);
      if (total > 0) {
        setDuration(total);
      }
      // REMOVED: Don't set currentTime here as it causes restarts
      // if (currentProgress?.watchedDuration && currentProgress.watchedDuration > 0) {
      //   video.currentTime = currentProgress.watchedDuration;
      // }
    };

    const handleEnded = () => {
      const total = Math.floor(video.duration || 0);
      setCurrentTime(total);
      setIsPlaying(false);
      setHasVideoEnded(true); // Mark video as ended
      updateProgressMutation.mutate({
        watchedDuration: total,
        isCompleted: true,
      });
    };

    const handleError = (e: Event) => {
      console.error('Video error:', e);
    };

    // Throttle timeupdate events
    let timeUpdateTimeout: NodeJS.Timeout;
    const throttledTimeUpdate = () => {
      clearTimeout(timeUpdateTimeout);
      timeUpdateTimeout = setTimeout(handleTimeUpdate, 100);
    };

    video.addEventListener('timeupdate', throttledTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      clearTimeout(timeUpdateTimeout);
      video.removeEventListener('timeupdate', throttledTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [currentLesson?.videoUrl]);

  // Set initial video position when video is ready (separate from events to avoid restart)
  useEffect(() => {
    const video = videoElRef.current;
    if (!video || !currentProgress?.watchedDuration || currentProgress.watchedDuration <= 0) return;

    const setInitialPosition = () => {
      if (video.readyState >= 2 && video.duration > 0) { // HAVE_CURRENT_DATA or higher
        video.currentTime = Math.min(currentProgress.watchedDuration, video.duration - 1);
        video.removeEventListener('loadeddata', setInitialPosition);
      }
    };

    if (video.readyState >= 2) {
      setInitialPosition();
    } else {
      video.addEventListener('loadeddata', setInitialPosition);
    }

    return () => {
      video.removeEventListener('loadeddata', setInitialPosition);
    };
  }, [currentProgress?.watchedDuration, currentLesson?.id]);

  // YouTube embed tracking (requires enablejsapi=1). Keep a single player instance.
  useEffect(() => {
    if (!currentLesson?.videoUrl || !/(youtube\.com|youtu\.be)/.test(currentLesson.videoUrl)) {
      return;
    }

    // Don't initialize if video has ended - let it stay paused
    if (hasVideoEnded) {
      return;
    }

    // Load YT API once
    const loadYouTubeApi = () =>
      new Promise<void>((resolve, reject) => {
        // Check if API is already loaded
        if ((window as any).YT && (window as any).YT.Player) {
          return resolve();
        }

        const existing = document.getElementById("youtube-iframe-api");
        if (existing) {
          // Wait for existing script to load
          const checkReady = () => {
            if ((window as any).YT && (window as any).YT.Player) {
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
          return;
        }

        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        tag.onload = () => {
          const checkReady = () => {
            if ((window as any).YT && (window as any).YT.Player) {
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };
          checkReady();
        };
        tag.onerror = () => reject(new Error('Failed to load YouTube API'));
        (window as any).onYouTubeIframeAPIReady = () => resolve();
        document.body.appendChild(tag);
      });

    const initializePlayer = async () => {
      try {
        await loadYouTubeApi();
        
        const YT = (window as any).YT;
        if (!YT || !YT.Player) {
          console.error('YouTube API not available');
          return;
        }

        const videoId = getYouTubeId(currentLesson.videoUrl);
        if (!videoId) {
          console.error('Invalid YouTube URL:', currentLesson.videoUrl);
          return;
        }

        // Wait for DOM element to be available
        const waitForElement = () => {
          const container = document.getElementById("yt-player");
          if (container) {
            return Promise.resolve(container);
          }
          return new Promise<HTMLElement>((resolve) => {
            const observer = new MutationObserver(() => {
              const el = document.getElementById("yt-player");
              if (el) {
                observer.disconnect();
                resolve(el);
              }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            
            // Fallback timeout
            setTimeout(() => {
              observer.disconnect();
              const el = document.getElementById("yt-player");
              if (el) resolve(el);
            }, 5000);
          });
        };

        const container = await waitForElement();
        if (!container) {
          console.error('YouTube player container not found');
          return;
        }

        // If player already exists, don't load here - let the separate effect handle it
        if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
          console.log('Player already exists, skipping duplicate load');
          return;
        }

        // Destroy existing player if it exists
        if (ytPlayerRef.current) {
          try {
            ytPlayerRef.current.destroy();
          } catch (e) {
            console.warn('Error destroying existing YouTube player:', e);
          }
          ytPlayerRef.current = null;
        }

        // Clear the container
        container.innerHTML = '';

        // Create new player
        ytPlayerRef.current = new YT.Player(container, {
          videoId,
          width: '100%',
          height: '100%',
          playerVars: {
            enablejsapi: 1,
            origin: window.location.origin,
            modestbranding: 1,
            rel: 0, // Don't show related videos at the end
            showinfo: 0, // Hide video title and uploader info
            iv_load_policy: 3, // Hide video annotations
            disablekb: 1, // Disable keyboard controls
            fs: 1, // Allow fullscreen
            cc_load_policy: 0, // Don't show captions by default
            autoplay: 0, // Don't autoplay
            controls: 1, // Show player controls
            // Additional parameters to prevent recommendations
            playsinline: 1, // Play inline on mobile
            widget_referrer: window.location.origin, // Set referrer
            // Force embedding mode to reduce recommendations
            host: 'https://www.youtube-nocookie.com'
          },
          events: {
            onReady: (event: any) => {
              console.log('YouTube player ready for video:', videoId);
              setIsYouTubePlayerReady(true);
              setCurrentVideoId(videoId); // Track current video ID
              
              // Add CSS to hide YouTube overlays and recommendations
              const style = document.createElement('style');
              style.textContent = `
                .ytp-endscreen-content,
                .ytp-ce-element,
                .ytp-cards-teaser,
                .ytp-endscreen-previous,
                .ytp-endscreen-next,
                .html5-endscreen,
                .ytp-pause-overlay {
                  display: none !important;
                }
                .ytp-show-cards-title {
                  display: none !important;
                }
              `;
              document.head.appendChild(style);
              
              // Initial position will be set by the separate effect
            },
            onStateChange: (event: any) => {
              // Start/stop interval when playing/paused
              if (event.data === YT.PlayerState.PLAYING) {
                if (ytIntervalRef.current) window.clearInterval(ytIntervalRef.current);
                ytIntervalRef.current = window.setInterval(() => {
                  try {
                    if (hasVideoEnded) return; // Don't update if video has ended
                    const watched = Math.floor(ytPlayerRef.current?.getCurrentTime() || 0);
                    const total = Math.floor(ytPlayerRef.current?.getDuration() || 0);
                    const isCompleted = total > 0 && watched >= total * 0.9;
                    // Throttle state updates
                    if (Math.abs(watched - currentTime) >= 1) {
                      setCurrentTime(watched);
                    }
                    if (total > 0 && total !== duration) {
                      setDuration(total);
                    }
                    updateProgressMutation.mutate({ watchedDuration: watched, isCompleted });
                  } catch (e) {
                    console.warn('Error updating progress:', e);
                  }
                }, 10000); // Update every 10 seconds
              } else {
                if (ytIntervalRef.current) {
                  window.clearInterval(ytIntervalRef.current);
                  ytIntervalRef.current = null;
                }
                if (event.data === YT.PlayerState.ENDED) {
                  try {
                    const watched = Math.floor(ytPlayerRef.current?.getDuration() || 0);
                    const total = Math.floor(ytPlayerRef.current?.getDuration() || 0);
                    setCurrentTime(watched);
                    setDuration(total || duration);
                    setHasVideoEnded(true); // Mark video as ended to prevent reload
                    
                    // Hide any YouTube recommendation overlays
                    setTimeout(() => {
                      const endScreenElements = document.querySelectorAll(
                        '.ytp-endscreen-content, .ytp-ce-element, .ytp-cards-teaser, .html5-endscreen, .ytp-pause-overlay'
                      );
                      endScreenElements.forEach(element => {
                        (element as HTMLElement).style.display = 'none';
                      });
                    }, 100);
                    
                    // Final progress update when video ends
                    updateProgressMutation.mutate({ watchedDuration: watched, isCompleted: true });
                  } catch (e) {
                    console.warn('Error handling video end:', e);
                  }
                }
              }
            },
            onError: (event: any) => {
              console.error('YouTube player error:', event.data);
              // Reset ready state on error
              setIsYouTubePlayerReady(false);
              
              // Show fallback message or retry logic could be added here
              const container = document.getElementById("yt-player");
              if (container) {
                container.innerHTML = `
                  <div class="flex items-center justify-center h-full text-white text-center">
                    <div>
                      <i class="fas fa-exclamation-triangle text-4xl mb-4"></i>
                      <p class="text-lg mb-2">خطأ في تحميل الفيديو</p>
                      <p class="text-sm text-gray-300">يرجى المحاولة مرة أخرى</p>
                    </div>
                  </div>
                `;
              }
            }
          },
        });
      } catch (error) {
        console.error('Error initializing YouTube player:', error);
      }
    };

    let cancelled = false;
    
    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      if (!cancelled) {
        initializePlayer();
      }
    }, 100);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      if (ytIntervalRef.current) {
        window.clearInterval(ytIntervalRef.current);
        ytIntervalRef.current = null;
      }
      // Don't destroy player here - let the cleanup effect handle it
    };
  }, [currentLesson?.videoUrl, currentLesson?.id, updateProgressMutation, hasVideoEnded]);

  // Cleanup effect to destroy YouTube player when component unmounts
  useEffect(() => {
    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying YouTube player on unmount:', e);
        }
        ytPlayerRef.current = null;
      }
      if (ytIntervalRef.current) {
        window.clearInterval(ytIntervalRef.current);
        ytIntervalRef.current = null;
      }
      setIsYouTubePlayerReady(false);
    };
  }, []);

  // Handle lesson changes when YouTube player is already ready
  useEffect(() => {
    if (!currentLesson?.videoUrl || !/(youtube\.com|youtu\.be)/.test(currentLesson.videoUrl)) {
      return;
    }

    // Don't reload video if it has ended - let it stay paused at the end
    if (hasVideoEnded) {
      return;
    }

    const videoId = getYouTubeId(currentLesson.videoUrl);
    if (!videoId) {
      return;
    }

    // Don't reload if it's the same video
    if (currentVideoId === videoId) {
      console.log('Same video already loaded, skipping reload:', videoId);
      return;
    }

    if (isYouTubePlayerReady && ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        console.log('Loading video in ready player:', videoId);
        ytPlayerRef.current.loadVideoById({
          videoId: videoId,
          startSeconds: 0 // Always start from beginning to avoid reload loops
        });
        setCurrentVideoId(videoId); // Update current video ID
      } catch (e) {
        console.warn('Error loading video in ready player:', e);
      }
    }
  }, [currentLesson?.id, currentLesson?.videoUrl, isYouTubePlayerReady, hasVideoEnded, currentVideoId]);

  // Set initial video position for YouTube videos (separate from loading)
  useEffect(() => {
    if (!currentLesson?.videoUrl || !/(youtube\.com|youtu\.be)/.test(currentLesson.videoUrl)) {
      return;
    }

    if (hasVideoEnded || hasSetInitialPosition.current) {
      return; // Don't set position if video has ended or already set
    }

    if (isYouTubePlayerReady && ytPlayerRef.current && currentProgress?.watchedDuration && currentProgress.watchedDuration > 0) {
      try {
        // Small delay to ensure video is loaded
        setTimeout(() => {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function' && !hasSetInitialPosition.current) {
            ytPlayerRef.current.seekTo(currentProgress.watchedDuration, true);
            hasSetInitialPosition.current = true;
          }
        }, 1000);
      } catch (e) {
        console.warn('Error setting initial video position:', e);
      }
    }
  }, [currentLesson?.id, isYouTubePlayerReady, currentProgress?.watchedDuration, hasVideoEnded]);

  // Reset YouTube player state when switching to non-YouTube videos
  useEffect(() => {
    if (currentLesson?.videoUrl && !/(youtube\.com|youtu\.be)/.test(currentLesson.videoUrl)) {
      // Reset YouTube player state when switching to non-YouTube video
      setIsYouTubePlayerReady(false);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying YouTube player when switching to non-YouTube video:', e);
        }
        ytPlayerRef.current = null;
      }
      if (ytIntervalRef.current) {
        window.clearInterval(ytIntervalRef.current);
        ytIntervalRef.current = null;
      }
    }
  }, [currentLesson?.videoUrl]);

  // Determine if we're still in the initial loading state
  const isInitialLoading = courseLoading || lessonsLoading || progressLoading;
  
  // Determine if there's an actual error (not just loading)
  const hasError = (courseError || lessonsError || progressError) && !isInitialLoading;
  
  // Show loading state while data is being fetched
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8 mt-12">
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">جاري تحميل المحاضرة...</h2>
              <p className="text-gray-600">يرجى الانتظار</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  // Show error state if there's a network or server error
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8 mt-12">
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <h2 className="text-xl font-bold text-gray-900 mb-2">خطأ في تحميل البيانات</h2>
              <p className="text-gray-600 mb-4">حدث خطأ أثناء تحميل بيانات المحاضرة. يرجى المحاولة مرة أخرى.</p>
              <Button onClick={() => window.location.reload()} className="btn-primary">
                <i className="fas fa-redo ml-2"></i>
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }





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

  // Only show "lesson not found" if we have lessons data but the specific lesson isn't found
  if (lessons && !currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8 mt-12">
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

  // If we still don't have lessons data, keep showing loading (this handles edge cases)
  if (!lessons) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8 mt-12">
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">جاري تحميل المحاضرة...</h2>
              <p className="text-gray-600">يرجى الانتظار</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const isYouTubeUrl = (url?: string | null) => !!url && /(youtube\.com|youtu\.be)/.test(url);
  const isVimeoUrl = (url?: string | null) => !!url && /vimeo\.com/.test(url);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-12">
        {/* Video Player */}
        <Card className="mb-8 overflow-hidden">
          <div className="bg-black aspect-video relative flex items-center justify-center">
            {currentLesson?.videoUrl ? (
              isYouTubeUrl(currentLesson.videoUrl) ? (
                <div className="relative w-full h-full min-h-[400px]" style={{ aspectRatio: '16/9' }}>
                  <style dangerouslySetInnerHTML={{
                    __html: `
                      .ytp-endscreen-content,
                      .ytp-ce-element,
                      .ytp-cards-teaser,
                      .ytp-endscreen-previous,
                      .ytp-endscreen-next,
                      .html5-endscreen,
                      .ytp-pause-overlay,
                      .ytp-show-cards-title {
                        display: none !important;
                        visibility: hidden !important;
                        opacity: 0 !important;
                      }
                    `
                  }} />
                  <div 
                    id="yt-player" 
                    className="w-full h-full"
                  />
                  {!isYouTubePlayerReady && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="text-center text-white">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                        <p>جاري تحميل الفيديو...</p>
                      </div>
                    </div>
                  )}
                </div>
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
                  preload="metadata"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onError={(e) => {
                    console.error('Video loading error:', e);
                  }}
                />
              )
            ) : (
              <div className="text-white text-center">
                <i className="fas fa-play-circle text-6xl mb-4"></i>
                <p className="text-lg">{currentLesson?.title || 'لا يوجد فيديو'}</p>
                <p className="text-sm text-gray-300 mt-2">
                  {course?.instructor} - {course?.title}
                </p>
              </div>
            )}
          </div>
          
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h1 className="font-amiri font-bold text-2xl mb-3">{currentLesson?.title}</h1>
                <p className="text-gray-600 mb-4">{course?.instructor}</p>
                <p className="text-gray-700 leading-relaxed mb-4">{currentLesson?.description}</p>
                
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
