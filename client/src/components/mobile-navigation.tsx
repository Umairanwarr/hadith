import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Home, BookOpen, Award, User, Settings, LogOut, GraduationCap, FileVideo } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location === path;

  const closeSheet = () => setIsOpen(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="md:hidden fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm shadow-sm"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0 bg-gradient-to-b from-green-50 to-white">
        <SheetHeader className="p-6 bg-green-600 text-white">
          <SheetTitle className="text-right text-xl font-bold">
            جامعة الإمام الزُّهري
          </SheetTitle>
          <p className="text-right text-green-100 text-sm">
            لإعداد علماء الحديث المحدثين
          </p>
        </SheetHeader>
        
        <div className="flex flex-col p-4 space-y-2">
          {/* Main Navigation */}
          <Link href="/" onClick={closeSheet}>
            <Button
              variant={isActive("/") ? "default" : "ghost"}
              className="w-full justify-end gap-3 h-12 text-right bg-green-50 hover:bg-green-100"
            >
              <span>الرئيسية</span>
              <Home className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/courses" onClick={closeSheet}>
            <Button
              variant={isActive("/courses") ? "default" : "ghost"}
              className="w-full justify-end gap-3 h-12 text-right bg-green-50 hover:bg-green-100"
            >
              <span>الدورات التعليمية</span>
              <BookOpen className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/certificates" onClick={closeSheet}>
            <Button
              variant={isActive("/certificates") ? "default" : "ghost"}
              className="w-full justify-end gap-3 h-12 text-right bg-green-50 hover:bg-green-100"
            >
              <span>الشهادات</span>
              <Award className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/profile" onClick={closeSheet}>
            <Button
              variant={isActive("/profile") ? "default" : "ghost"}
              className="w-full justify-end gap-3 h-12 text-right bg-green-50 hover:bg-green-100"
            >
              <span>الملف الشخصي</span>
              <User className="h-5 w-5" />
            </Button>
          </Link>

          {/* Admin Section */}
          {user?.isAdmin && (
            <>
              <div className="border-t pt-4 mt-4">
                <p className="text-sm font-semibold text-gray-600 text-right mb-2">
                  إدارة النظام
                </p>
                
                <Link href="/admin" onClick={closeSheet}>
                  <Button
                    variant={isActive("/admin") ? "default" : "ghost"}
                    className="w-full justify-end gap-3 h-12 text-right bg-blue-50 hover:bg-blue-100"
                  >
                    <span>لوحة الإدارة</span>
                    <Settings className="h-5 w-5" />
                  </Button>
                </Link>

                <Link href="/admin/create-course" onClick={closeSheet}>
                  <Button
                    variant={isActive("/admin/create-course") ? "default" : "ghost"}
                    className="w-full justify-end gap-3 h-12 text-right bg-blue-50 hover:bg-blue-100"
                  >
                    <span>إنشاء دورة</span>
                    <GraduationCap className="h-5 w-5" />
                  </Button>
                </Link>

                <Link href="/admin/video-manager" onClick={closeSheet}>
                  <Button
                    variant="ghost"
                    className="w-full justify-end gap-3 h-12 text-right bg-blue-50 hover:bg-blue-100"
                  >
                    <span>إدارة الفيديوهات</span>
                    <FileVideo className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Logout */}
          <div className="border-t pt-4 mt-4">
            <a href="/api/logout">
              <Button
                variant="ghost"
                className="w-full justify-end gap-3 h-12 text-right text-red-600 hover:bg-red-50"
              >
                <span>تسجيل الخروج</span>
                <LogOut className="h-5 w-5" />
              </Button>
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}