import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { QuickLessonForm } from "@/components/quick-lesson-form";
import { QuickExamForm } from "@/components/quick-exam-form";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function QuickAddPage() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-green-600 to-green-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-plus-circle text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                  إضافة سريعة للمحتوى
                </h1>
                <p className="text-green-100 mt-2">
                  أضف درساً تعليمياً جديداً بخطوات بسيطة
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/admin">
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <i className="fas fa-arrow-right ml-2"></i>
                  العودة للوحة الإدارة
                </Button>
              </Link>
              <Link href="/teacher-guide">
                <Button variant="outline" className="bg-white/20 border-white/30 text-white hover:bg-white/30">
                  <i className="fas fa-question-circle ml-2"></i>
                  دليل المعلم
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Add Forms */}
        <Tabs defaultValue="lesson" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="lesson" className="flex items-center gap-2">
              <i className="fas fa-video"></i>
              إضافة درس
            </TabsTrigger>
            <TabsTrigger value="exam" className="flex items-center gap-2">
              <i className="fas fa-clipboard-list"></i>
              إنشاء امتحان
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="lesson">
            <QuickLessonForm />
          </TabsContent>
          
          <TabsContent value="exam">
            <QuickExamForm />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
}