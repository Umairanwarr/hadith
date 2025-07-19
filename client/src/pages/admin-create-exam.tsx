import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { createExamSchema, type CreateExam } from "@shared/schema";
import { ArrowRight, FileText } from "lucide-react";
import { Link } from "wouter";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  level: string;
}

export default function AdminCreateExam() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const form = useForm<CreateExam>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 60,
      passingGrade: 70,
      courseId: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateExam) => {
      const courseId = data.courseId;
      const examData = { ...data };
      delete (examData as any).courseId; // Remove courseId from body as it goes in URL
      
      return await apiRequest(`/api/admin/courses/${courseId}/exams`, {
        method: "POST",
        body: JSON.stringify(examData),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء الاختبار بنجاح",
        description: "تم إضافة الاختبار الجديد إلى النظام",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      setLocation("/admin");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مصرح",
          description: "تم تسجيل خروجك. جاري تسجيل الدخول مرة أخرى...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ في إنشاء الاختبار",
        description: "فشل في إنشاء الاختبار. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateExam) => {
    createMutation.mutate(data);
  };

  if (coursesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى لوحة الإدارة
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">إضافة اختبار جديد</h1>
          </div>
          <p className="text-gray-600">أضف اختبار جديد لإحدى المواد الدراسية</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>معلومات الاختبار</CardTitle>
            <CardDescription>
              املأ جميع الحقول المطلوبة لإنشاء اختبار جديد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>المادة الدراسية *</FormLabel>
                      <Select onValueChange={(value) => field.onChange(Number(value))}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المادة الدراسية" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courses?.map((course: Course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.title} - {course.instructor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان الاختبار *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="مثل: اختبار أصول علم الحديث"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مدة الاختبار (بالدقائق) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="60"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>وصف الاختبار *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="وصف شامل للاختبار ومحتواه وأهدافه..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passingGrade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>درجة النجاح (%) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="70"
                          min="1"
                          max="100"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء الاختبار"}
                  </Button>
                  <Link href="/admin">
                    <Button type="button" variant="outline">
                      إلغاء
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>الخطوات التالية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• بعد إنشاء الاختبار، ستحتاج إلى إضافة الأسئلة</p>
              <p>• تأكد من وضع أسئلة متنوعة تغطي محتوى المادة</p>
              <p>• راجع الأسئلة والإجابات قبل نشر الاختبار</p>
              <p>• يمكنك تعديل الاختبار أو إضافة المزيد من الأسئلة لاحقاً</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}