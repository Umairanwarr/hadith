import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/logo (1)_1752944342261.png";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <header className="bg-white shadow-lg border-b-4 border-[hsl(45,76%,58%)]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-reverse space-x-4">
            <img 
              src={logoPath} 
              alt="شعار الجامعة" 
              className="h-16 w-16 object-contain" 
            />
            <div className="mr-3">
              <h1 className="text-xl font-amiri font-bold text-[hsl(158,40%,34%)]">
                جامعة الإمام الزُّهري
              </h1>
              <p className="text-sm text-gray-600">لإعداد علماء الحديث المحدثين</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-reverse space-x-8">
            <Link href="/">
              <a className={`font-semibold ${location === '/' ? 'text-[hsl(158,40%,34%)]' : 'text-gray-600 hover:text-[hsl(158,40%,34%)]'}`}>
                لوحة التحكم
              </a>
            </Link>
            <Link href="/certificates">
              <a className={`font-semibold ${location === '/certificates' ? 'text-[hsl(158,40%,34%)]' : 'text-gray-600 hover:text-[hsl(158,40%,34%)]'}`}>
                الشهادات
              </a>
            </Link>
            <Link href="/profile">
              <a className={`font-semibold ${location === '/profile' ? 'text-[hsl(158,40%,34%)]' : 'text-gray-600 hover:text-[hsl(158,40%,34%)]'}`}>
                الملف الشخصي
              </a>
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
              className="md:hidden p-2 text-[hsl(158,40%,34%)]"
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
