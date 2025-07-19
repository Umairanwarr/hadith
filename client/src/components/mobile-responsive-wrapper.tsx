import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileResponsiveWrapperProps {
  children: ReactNode;
  className?: string;
  mobilePadding?: boolean;
  centerContent?: boolean;
}

export function MobileResponsiveWrapper({ 
  children, 
  className = "", 
  mobilePadding = true,
  centerContent = false 
}: MobileResponsiveWrapperProps) {
  return (
    <div 
      className={cn(
        "w-full",
        mobilePadding && "px-4 md:px-6 lg:px-8",
        centerContent && "flex flex-col items-center",
        className
      )}
      dir="rtl"
    >
      {children}
    </div>
  );
}

export function MobileSafeArea({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("safe-area-inset", className)}>
      {children}
    </div>
  );
}

export function MobileScrollContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div 
      className={cn(
        "overflow-y-auto scrollbar-hide touch-zone",
        "max-h-screen",
        className
      )}
    >
      {children}
    </div>
  );
}