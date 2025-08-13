import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { createCourseSchema, type CreateCourse } from "@shared/schema";
import { ArrowRight, BookOpen } from "lucide-react";
import { Link } from "wouter";

export default function AdminCreateCourse() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const form = useForm<CreateCourse>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      title: "",
      description: "",
      instructor: "",
      level: "مبتدئ",
      duration: 60,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateCourse) => {
      return await apiRequest("/admin/courses", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء المادة بنجاح",
        description: "تم إضافة المادة الجديدة إلى النظام",
      });
          queryClient.invalidateQueries({ queryKey: ["courses"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
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
          window.location.href = "/login";
        }, 500);
        return;
      }
      toast({
        title: "خطأ في إنشاء المادة",
        description: "فشل في إنشاء المادة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCourse) => {
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-24 pb-20" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/admin" className="inline-flex items-center text-green-600 hover:text-green-700 mb-4">
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى لوحة الإدارة
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900">إضافة مادة جديدة</h1>
          </div>
          <p className="text-gray-600">أضف مادة دراسية جديدة إلى النظام</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>معلومات المادة</CardTitle>
            <CardDescription>
              املأ جميع الحقول المطلوبة لإنشاء مادة دراسية جديدة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان المادة *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="مثل: أصول علم الحديث"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="instructor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم المدرس *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="مثل: د. محمد أحمد"
                            {...field}
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
                      <FormLabel>وصف المادة *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="وصف شامل للمادة ومحتواها وأهدافها التعليمية..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مستوى المادة *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر مستوى المادة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                            <SelectItem value="متوسط">متوسط</SelectItem>
                            <SelectItem value="متقدم">متقدم</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>مدة المادة (بالدقائق) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="600"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {createMutation.isPending ? "جاري الإنشاء..." : "إنشاء المادة"}
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
              <p>• بعد إنشاء المادة، يمكنك إضافة الدروس والمحتوى التعليمي</p>
              <p>• أضف اختبارات للمادة لتقييم فهم الطلاب</p>
              <p>• تأكد من مراجعة المحتوى قبل نشره للطلاب</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}