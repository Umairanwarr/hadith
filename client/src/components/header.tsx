import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/logo (1)_1752944987599.png";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="bg-white shadow-lg border-b-2 border-green-500">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-6">
            <img 
              src={logoPath} 
              alt="شعار الجامعة" 
              className="h-32 w-32 object-contain" 
            />
            <div className="mr-4">
              <h1 className="font-amiri font-bold text-green-700 text-[16px]">
                جامعة الإمام الزُّهري
              </h1>
              <p className="text-green-600 text-[12px]">لإعداد علماء الحديث المحدثين</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-reverse space-x-8">
            <Link href="/" className={`font-semibold transition-colors ${location === '/' ? 'text-green-700' : 'text-gray-500 hover:text-green-600'}`}>
              لوحة التحكم
            </Link>
            <Link href="/certificates" className={`font-semibold transition-colors ${location === '/certificates' ? 'text-green-700' : 'text-gray-500 hover:text-green-600'}`}>
              الشهادات
            </Link>
            <Link href="/profile" className={`font-semibold transition-colors ${location === '/profile' ? 'text-green-700' : 'text-gray-500 hover:text-green-600'}`}>
              الملف الشخصي
            </Link>
          </nav>
          
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="flex items-center space-x-reverse space-x-3">
              {user.profileImageUrl && (
                <img 
                  src={user.profileImageUrl} 
                  alt="صورة الطالب" 
                  className="h-8 w-8 rounded-full object-cover" 
                />
              )}
              <span className="text-sm font-semibold">
                {user.firstName && user.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user.email?.split('@')[0] || 'الطالب'
                }
              </span>
            </div>
            
            <button 
              className="md:hidden p-2 text-green-700 hover:text-green-800 transition-colors"
              onClick={() => {
                // Toggle mobile menu
                const nav = document.querySelector('nav');
                nav?.classList.toggle('hidden');
              }}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
