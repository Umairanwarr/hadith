import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  SkipBack,
  SkipForward,
  RotateCcw,
  Settings
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileVideoPlayerProps {
  src: string;
  title: string;
  onProgress?: (progress: number) => void;
  onComplete?: () => void;
  className?: string;
}

export function MobileVideoPlayer({ 
  src, 
  title, 
  onProgress, 
  onComplete,
  className 
}: MobileVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (onProgress && video.duration) {
        onProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onProgress, onComplete]);

  // Auto-hide controls on mobile
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showControls && isPlaying) {
      timeout = setTimeout(() => setShowControls(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showControls, isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime - 10);
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(duration, video.currentTime + 10);
  };

  const changePlaybackRate = () => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    
    const video = videoRef.current;
    if (video) {
      video.playbackRate = nextRate;
      setPlaybackRate(nextRate);
    }
  };

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!isFullscreen) {
        await video.requestFullscreen();
        setIsFullscreen(true);
        // Lock orientation to landscape on mobile
        if (screen.orientation) {
          screen.orientation.lock('landscape').catch(() => {});
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group touch-manipulation",
        className
      )}
      onClick={() => setShowControls(!showControls)}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        playsInline
        webkit-playsinline
        onClick={(e) => e.stopPropagation()}
      />

      {/* Loading Overlay */}
      {duration === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Title */}
        <div className="absolute top-4 left-4 right-4">
          <h3 className="text-white font-semibold text-sm truncate">
            {title}
          </h3>
        </div>

        {/* Center Play Button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={togglePlay}
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-4">
          {/* Progress Bar */}
          <div className="flex items-center gap-2 text-white text-xs">
            <span>{formatTime(currentTime)}</span>
            <div className="flex-1">
              <Slider
                value={[duration ? (currentTime / duration) * 100 : 0]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full"
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                onClick={skipBackward}
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                onClick={togglePlay}
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </Button>

              <Button
                onClick={skipForward}
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                onClick={changePlaybackRate}
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-white hover:bg-white/20 text-xs"
              >
                {playbackRate}x
              </Button>

              <Button
                onClick={toggleMute}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <Button
                onClick={toggleFullscreen}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}