import { MobileNavigation } from "./mobile-navigation";
import logoPath from "@assets/logo (1)_1752944987599.png";

export function MobileHeader() {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b shadow-sm">
      <div className="flex items-center justify-center h-16 px-4 relative">
        {/* Centered Logo */}
        <div className="flex items-center gap-3">
          <img 
            src={logoPath} 
            alt="شعار الجامعة" 
            className="h-10 w-10 object-contain"
          />
          <div className="text-center">
            <h1 className="text-lg font-bold text-green-800 leading-tight">
              جامعة الإمام الزُّهري
            </h1>
            <p className="text-xs text-green-600 leading-none">
              لإعداد علماء الحديث
            </p>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <MobileNavigation />
      </div>
    </header>
  );
}