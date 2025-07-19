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
      <div className="container mx-auto px-4 py-2 pt-[0px] pb-[0px] pl-[14px] pr-[14px] ml-[2px] mr-[2px] mt-[-21px] mb-[-21px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={logoPath} 
              alt="شعار الجامعة" 
              className="h-48 w-48 object-contain ml-[6px] mr-[6px] mt-[-25px] mb-[-25px] pt-[6px] pb-[6px] pl-[-5px] pr-[-5px]" 
            />
          </div>
          
          <nav className="hidden md:flex items-center space-x-reverse space-x-8 text-[12px]">
            <Link href="/" className={`font-semibold transition-colors ${location === '/' ? 'text-green-700' : 'text-gray-500 hover:text-green-600'}`}>
              لوحة التحكم
            </Link>
            <Link href="/certificates" className={`font-semibold transition-colors ${location === '/certificates' ? 'text-green-700' : 'text-gray-500 hover:text-green-600'}`}>
              الشهادات
            </Link>
            <Link href="/profile" className={`font-semibold transition-colors ${location === '/profile' ? 'text-green-700' : 'text-gray-500 hover:text-green-600'}`}>
              الملف الشخصي
            </Link>
            {user.role === 'admin' && (
              <Link href="/admin" className={`font-semibold transition-colors ${location.startsWith('/admin') ? 'text-green-700' : 'text-gray-500 hover:text-green-600'}`}>
                الإدارة
              </Link>
            )}
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
