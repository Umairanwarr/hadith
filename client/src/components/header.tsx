import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import logoPath from "@assets/logo better_1752953272174.png";
import { useState } from "react";

import logo_better from "@assets/logo better.png";

import logo_2 from "@assets/logo 2.png";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSubMenuOpen, setIsSubMenuOpen] = useState<string | null>(null);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <>
      {/* Top Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-lg border-b-2 border-green-500">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Menu button on left */}
            <button 
              className="p-2 text-green-700 hover:text-green-800 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
            
            {/* Logo centered */}
            <div className="flex-1 flex justify-center pl-[-3px] pr-[-3px] ml-[2px] mr-[2px] mt-[-47px] mb-[-47px]">
              <img 
                src={logo_2} 
                alt="شعار الجامعة" 
                className="h-36 w-36 object-contain pl-[-4px] pr-[-4px] ml-[-2px] mr-[-2px] pt-[0px] pb-[0px] mt-[-5px] mb-[-5px]" 
              />
            </div>
            
            {/* Empty space on right for balance */}
            <div className="p-2 w-8"></div>
          </div>
        </div>
      </header>
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300" onClick={e => e.stopPropagation()}>
            {/* Menu Header with Logo */}
            <div className="p-4 border-b border-green-200 bg-[#ffffff]">
              <div className="flex items-center justify-between">
                <img src={logoPath} alt="شعار الجامعة" className="h-24 w-24 object-contain ml-[8px] mr-[8px] pl-[-10px] pr-[-10px] pt-[10px] pb-[10px] mt-[-22px] mb-[-22px]" />
                <button onClick={() => setIsMenuOpen(false)} className="text-green-700 hover:text-green-800">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
            </div>

            {/* Menu Content - Levels and University Info */}
            <div className="p-4">
              {/* Academic Levels Section */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">المستويات الأكاديمية</h3>
                <div className="space-y-2">
                  <button 
                    className="w-full text-right p-2 hover:bg-green-50 rounded-lg text-gray-700 text-sm border border-gray-200"
                    onClick={() => setIsSubMenuOpen(isSubMenuOpen === 'preparatory' ? null : 'preparatory')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-green-700">1</span>
                        </div>
                        <span>المستوى التمهيدي</span>
                      </div>
                      <i className={`fas fa-chevron-${isSubMenuOpen === 'preparatory' ? 'up' : 'down'} text-xs`}></i>
                    </div>
                  </button>
                  {isSubMenuOpen === 'preparatory' && (
                    <div className="bg-gray-50 rounded-lg p-2 mr-8">
                      <p className="text-xs text-gray-600 mb-2">الديبلوم التمهيدي في علوم الحديث</p>
                      <p className="text-xs text-gray-500">120 ساعة دراسية • 24 محاضرة</p>
                    </div>
                  )}

                  <button 
                    className="w-full text-right p-2 hover:bg-green-50 rounded-lg text-gray-700 text-sm border border-gray-200"
                    onClick={() => setIsSubMenuOpen(isSubMenuOpen === 'intermediate' ? null : 'intermediate')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-700">2</span>
                        </div>
                        <span>المستوى المتوسط</span>
                      </div>
                      <i className={`fas fa-chevron-${isSubMenuOpen === 'intermediate' ? 'up' : 'down'} text-xs`}></i>
                    </div>
                  </button>
                  {isSubMenuOpen === 'intermediate' && (
                    <div className="bg-gray-50 rounded-lg p-2 mr-8">
                      <p className="text-xs text-gray-600 mb-2">الدبلوم المتوسط في علوم الحديث</p>
                      <p className="text-xs text-gray-500">180 ساعة دراسية • 36 محاضرة</p>
                    </div>
                  )}

                  <button 
                    className="w-full text-right p-2 hover:bg-green-50 rounded-lg text-gray-700 text-sm border border-gray-200"
                    onClick={() => setIsSubMenuOpen(isSubMenuOpen === 'certificate' ? null : 'certificate')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-700">3</span>
                        </div>
                        <span>مستوى الإجازة</span>
                      </div>
                      <i className={`fas fa-chevron-${isSubMenuOpen === 'certificate' ? 'up' : 'down'} text-xs`}></i>
                    </div>
                  </button>
                  {isSubMenuOpen === 'certificate' && (
                    <div className="bg-gray-50 rounded-lg p-2 mr-8">
                      <p className="text-xs text-gray-600 mb-2">الإجازة في علوم الحديث</p>
                      <p className="text-xs text-gray-500">240 ساعة دراسية • 48 محاضرة</p>
                    </div>
                  )}

                  <button 
                    className="w-full text-right p-2 hover:bg-green-50 rounded-lg text-gray-700 text-sm border border-gray-200"
                    onClick={() => setIsSubMenuOpen(isSubMenuOpen === 'bachelor' ? null : 'bachelor')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-purple-700">4</span>
                        </div>
                        <span>مستوى البكالوريوس</span>
                      </div>
                      <i className={`fas fa-chevron-${isSubMenuOpen === 'bachelor' ? 'up' : 'down'} text-xs`}></i>
                    </div>
                  </button>
                  {isSubMenuOpen === 'bachelor' && (
                    <div className="bg-gray-50 rounded-lg p-2 mr-8">
                      <p className="text-xs text-gray-600 mb-2">بكالوريوس في علم الحديث</p>
                      <p className="text-xs text-gray-500">300 ساعة دراسية • 60 محاضرة</p>
                    </div>
                  )}

                  <button 
                    className="w-full text-right p-2 hover:bg-green-50 rounded-lg text-gray-700 text-sm border border-gray-200"
                    onClick={() => setIsSubMenuOpen(isSubMenuOpen === 'master' ? null : 'master')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-yellow-700">5</span>
                        </div>
                        <span>مستوى الماجستير</span>
                      </div>
                      <i className={`fas fa-chevron-${isSubMenuOpen === 'master' ? 'up' : 'down'} text-xs`}></i>
                    </div>
                  </button>
                  {isSubMenuOpen === 'master' && (
                    <div className="bg-gray-50 rounded-lg p-2 mr-8">
                      <p className="text-xs text-gray-600 mb-2">ماجستير عالم بالحديث</p>
                      <p className="text-xs text-gray-500">360 ساعة دراسية • 72 محاضرة</p>
                    </div>
                  )}

                  <button 
                    className="w-full text-right p-2 hover:bg-green-50 rounded-lg text-gray-700 text-sm border border-gray-200"
                    onClick={() => setIsSubMenuOpen(isSubMenuOpen === 'doctorate' ? null : 'doctorate')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-red-700">6</span>
                        </div>
                        <span>مستوى الدكتوراه</span>
                      </div>
                      <i className={`fas fa-chevron-${isSubMenuOpen === 'doctorate' ? 'up' : 'down'} text-xs`}></i>
                    </div>
                  </button>
                  {isSubMenuOpen === 'doctorate' && (
                    <div className="bg-gray-50 rounded-lg p-2 mr-8">
                      <p className="text-xs text-gray-600 mb-2">دكتور في الدراسات الحديثية</p>
                      <p className="text-xs text-gray-500">480 ساعة دراسية • 96 محاضرة</p>
                    </div>
                  )}
                </div>
              </div>

              {/* University Info Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-200 pb-2">معلومات الجامعة</h3>
                <button className="w-full text-right p-3 hover:bg-green-50 rounded-lg text-gray-700 font-semibold">
                  عن الجامعة
                </button>
                <button 
                  className="w-full text-right p-3 hover:bg-green-50 rounded-lg text-gray-700 font-semibold"
                  onClick={() => {
                    setIsMenuOpen(false);
                    window.open('/assets/university-program.pdf', '_blank');
                  }}
                >
                  برنامج الجامعة
                </button>
                <button className="w-full text-right p-3 hover:bg-green-50 rounded-lg text-gray-700 font-semibold">
                  الديبلومات والإجازات
                </button>
                <button className="w-full text-right p-3 hover:bg-green-50 rounded-lg text-gray-700 font-semibold">
                  نماذج الديبلومات
                </button>
                <button className="w-full text-right p-3 hover:bg-green-50 rounded-lg text-gray-700 font-semibold">
                  المدرسون
                </button>
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
