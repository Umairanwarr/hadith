import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/logo (1)_1752944987599.png";
import { useState } from "react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Top Header */}
      <header className="bg-white shadow-lg border-b-2 border-green-500">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo centered */}
            <div className="flex-1 flex justify-center">
              <img 
                src={logoPath} 
                alt="شعار الجامعة" 
                className="h-24 w-24 object-contain" 
              />
            </div>
            
            {/* Menu button on right */}
            <button 
              className="p-2 text-green-700 hover:text-green-800 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300" onClick={e => e.stopPropagation()}>
            {/* Menu Header with Logo */}
            <div className="p-4 bg-green-50 border-b border-green-200">
              <div className="flex items-center justify-between">
                <img src={logoPath} alt="شعار الجامعة" className="h-16 w-16 object-contain" />
                <button onClick={() => setIsMenuOpen(false)} className="text-green-700 hover:text-green-800">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Menu Content */}
            <div className="p-4">
              {/* University Info Section */}
              <div className="mb-6">
                <button 
                  className="w-full flex items-center justify-between p-3 text-right bg-gray-50 hover:bg-gray-100 rounded-lg mb-2"
                  onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
                >
                  <i className={`fas fa-chevron-${isSubMenuOpen ? 'up' : 'down'} text-gray-500`}></i>
                  <span className="font-semibold text-gray-700">معلومات الجامعة</span>
                </button>
                
                {isSubMenuOpen && (
                  <div className="bg-white border border-gray-200 rounded-lg p-2 space-y-2">
                    <button className="w-full text-right p-2 hover:bg-gray-50 rounded text-gray-600">
                      عن الجامعة
                    </button>
                    <button className="w-full text-right p-2 hover:bg-gray-50 rounded text-gray-600">
                      برنامج الجامعة
                    </button>
                    <button className="w-full text-right p-2 hover:bg-gray-50 rounded text-gray-600">
                      الديبلومات والإجازات
                    </button>
                    <button className="w-full text-right p-2 hover:bg-gray-50 rounded text-gray-600">
                      المدرسون
                    </button>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="space-y-2">
                <Link 
                  href="/" 
                  className="w-full flex items-center justify-end p-3 text-right hover:bg-green-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="font-semibold text-gray-700">الصفحة الرئيسية</span>
                </Link>
                
                <Link 
                  href="/certificates" 
                  className="w-full flex items-center justify-end p-3 text-right hover:bg-green-50 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="font-semibold text-gray-700">شهاداتي</span>
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    className="w-full flex items-center justify-end p-3 text-right hover:bg-green-50 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="font-semibold text-gray-700">الإدارة</span>
                  </Link>
                )}
              </div>

              {/* User Info */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-end space-x-reverse space-x-3 mb-4">
                  {user.profileImageUrl && (
                    <img 
                      src={user.profileImageUrl} 
                      alt="صورة الطالب" 
                      className="h-10 w-10 rounded-full object-cover" 
                    />
                  )}
                  <span className="font-semibold text-gray-700">
                    {user.firstName && user.lastName 
                      ? `${user.firstName} ${user.lastName}` 
                      : user.email?.split('@')[0] || 'الطالب'
                    }
                  </span>
                </div>
                
                <button 
                  onClick={() => window.location.href = '/api/logout'}
                  className="w-full p-3 text-right bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-semibold"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex justify-around items-center py-2">
          <Link href="/" className={`flex flex-col items-center p-2 ${location === '/' ? 'text-green-700' : 'text-gray-500'}`}>
            <i className="fas fa-home text-lg mb-1"></i>
            <span className="text-xs">الصفحة الرئيسية</span>
          </Link>
          
          <Link href="/certificates" className={`flex flex-col items-center p-2 ${location === '/certificates' ? 'text-green-700' : 'text-gray-500'}`}>
            <i className="fas fa-certificate text-lg mb-1"></i>
            <span className="text-xs">شهاداتي</span>
          </Link>
          
          <Link href="/profile" className={`flex flex-col items-center p-2 ${location === '/profile' ? 'text-green-700' : 'text-gray-500'}`}>
            <i className="fas fa-user text-lg mb-1"></i>
            <span className="text-xs">الملف الشخصي</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
