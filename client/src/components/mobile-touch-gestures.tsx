import { useState, useRef, useEffect, ReactNode } from "react";

interface MobileTouchGesturesProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  className?: string;
}

export function MobileTouchGestures({
  children,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onDoubleTap,
  onLongPress,
  className = ""
}: MobileTouchGesturesProps) {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const [lastTap, setLastTap] = useState(0);
  const longPressTimer = useRef<NodeJS.Timeout>();

  // Minimum distance for a swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });

    // Handle long press
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
      }, 500); // 500ms for long press
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    // Clear long press timer on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const onTouchEnd = () => {
    // Clear long press timer
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    if (!touchStart || !touchEnd) return;

    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;
    const isUpSwipe = distanceY > minSwipeDistance;
    const isDownSwipe = distanceY < -minSwipeDistance;

    // Handle swipes
    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }
    if (isUpSwipe && onSwipeUp) {
      onSwipeUp();
    }
    if (isDownSwipe && onSwipeDown) {
      onSwipeDown();
    }

    // Handle double tap
    if (onDoubleTap) {
      const now = Date.now();
      const DOUBLE_PRESS_DELAY = 300;
      if (lastTap && (now - lastTap) < DOUBLE_PRESS_DELAY) {
        onDoubleTap();
      } else {
        setLastTap(now);
      }
    }
  };

  return (
    <div
      className={className}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </div>
  );
}