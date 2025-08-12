import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function TeacherDashboard() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        setLocation("/auth");
        return;
      }
      if (user && user.role !== "teacher" && user.role !== "admin") {
        setLocation("/");
      }
    }
  }, [isAuthenticated, isLoading, user, setLocation]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="font-amiri text-2xl font-bold mb-6">لوحة المعلم</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>الدروس</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">إدارة الدروس ورفع المواد التعليمية.</p>
              <Button asChild>
                <a href="/course-management">إدارة الدورات</a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>البث المباشر</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">إدارة الجلسات المباشرة.</p>
              <div className="flex gap-2">
                <Button asChild variant="secondary">
                  <a href="/manage-live-sessions">إدارة الجلسات</a>
                </Button>
                <Button asChild>
                  <a href="/quick-add">إضافة درس سريع</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

