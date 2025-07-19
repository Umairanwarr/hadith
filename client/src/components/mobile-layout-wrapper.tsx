import { ReactNode } from "react";
import { MobileHeader } from "./mobile-header";
import { MobileBottomNav } from "./mobile-bottom-nav";

interface MobileLayoutWrapperProps {
  children: ReactNode;
  showBottomNav?: boolean;
  className?: string;
}

export function MobileLayoutWrapper({ 
  children, 
  showBottomNav = true, 
  className = "" 
}: MobileLayoutWrapperProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-white ${className}`}>
      {/* Mobile Header */}
      <MobileHeader />
      
      {/* Main Content with proper spacing */}
      <main className="pt-20 md:pt-8 pb-20 md:pb-8">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      {showBottomNav && <MobileBottomNav />}
    </div>
  );
}