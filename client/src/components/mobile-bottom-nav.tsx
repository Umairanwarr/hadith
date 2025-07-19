import { Link, useLocation } from "wouter";
import { Home, BookOpen, Award, User, Settings } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location === path || location.startsWith(path);

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "الرئيسية",
      active: location === "/"
    },
    {
      href: "/courses",
      icon: BookOpen,
      label: "الدورات",
      active: location.startsWith("/courses")
    },
    {
      href: "/certificates",
      icon: Award,
      label: "الشهادات",
      active: location === "/certificates"
    },
    {
      href: "/profile",
      icon: User,
      label: "الملف",
      active: location === "/profile"
    },
  ];

  // Add admin button if user is admin
  if (user?.isAdmin) {
    navItems.push({
      href: "/admin",
      icon: Settings,
      label: "الإدارة",
      active: location.startsWith("/admin")
    });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t shadow-lg">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <button
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors min-w-[60px]",
                  item.active
                    ? "text-green-600 bg-green-50"
                    : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                )}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}