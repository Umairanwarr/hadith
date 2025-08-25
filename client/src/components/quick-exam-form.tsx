import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { createExamSchema, type CreateExam } from "@shared/schema";
import { useGetCourses } from "@/hooks/useCourses";

interface QuickExamFormProps {
  courseId?: string;
  onSuccess?: () => void;
}

export function QuickExamForm({ courseId, onSuccess }: QuickExamFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string | undefined>(courseId);
  const { data: courses, loading: coursesLoading } = useGetCourses();

  const form = useForm<CreateExam>({
    resolver: zodResolver(createExamSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 30,
      passingGrade: 70,
      courseId: courseId || "",
      totalQuestions: 0,
      isActive: true,
    },
  });

  const createExamMutation = useMutation({
    mutationFn: async (data: CreateExam) => {
      // Ensure we have a course id and send payload as the route expects
      const targetCourseId = selectedCourse || data.courseId;
      const { courseId: _omitCourseId, ...body } = data as any;
      return await apiRequest(
        "POST",
        `/api/admin/courses/${targetCourseId}/exams`,
        body,
      );
    },
    onSuccess: () => {
      toast({
        title: "تم إنشاء الامتحان بنجاح",
        description: "تم إنشاء الامتحان الجديد بنجاح. يمكنك الآن إضافة الأسئلة",
      });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["api", "courses"] });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "خطأ في إنشاء الامتحان",
        description: "فشل في إنشاء الامتحان. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateExam) => {
    const finalData: CreateExam = {
      ...data,
      courseId: selectedCourse || data.courseId,
      duration: Number(data.duration),
      passingGrade: Number(data.passingGrade),
      totalQuestions: data.totalQuestions || 0,
      isActive: data.isActive !== false,
    };
    createExamMutation.mutate(finalData);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="fas fa-clipboard-list text-purple-600"></i>
          إنشاء امتحان جديد
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Course Selection (if not specified) */}
            {!courseId && (
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اختر المادة الدراسية</FormLabel>
                    <Select 
                      value={selectedCourse || ""} 
                      onValueChange={(value) => {
                        setSelectedCourse(value);
                        field.onChange(value);
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {coursesLoading && (
                          <SelectItem value="__loading__" disabled>
                            جاري التحميل...
                          </SelectItem>
                        )}
                        {Array.isArray(courses) && courses.length > 0 ? (
                          courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.title}
                            </SelectItem>
                          ))
                        ) : !coursesLoading ? (
                          <SelectItem value="__no_courses__" disabled>
                            لا توجد مواد متاحة
                          </SelectItem>
                        ) : null}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Exam Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الامتحان</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="مثال: امتحان نهائي في أصول علم الحديث" 
                      {...field} 
                      className="text-right"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مدة الامتحان (بالدقائق)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="30" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 mt-1">
                    مدة مقترحة: 30-60 دقيقة حسب عدد الأسئلة
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Passing Grade */}
            <FormField
              control={form.control}
              name="passingGrade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>درجة النجاح المطلوبة (%)</FormLabel>
                  <Select
                    value={String(field.value ?? "")}
                    onValueChange={(value) => field.onChange(Number(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر درجة النجاح" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="50">50% - مقبول</SelectItem>
                      <SelectItem value="60">60% - جيد</SelectItem>
                      <SelectItem value="70">70% - جيد جداً</SelectItem>
                      <SelectItem value="80">80% - ممتاز</SelectItem>
                      <SelectItem value="90">90% - امتياز مع مرتبة الشرف</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description (required by API) */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف الامتحان</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="وصف للامتحان وموضوعاته المشمولة..."
                      className="text-right min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 mt-1">
                    وضح للطلاب ما سيغطيه الامتحان
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={createExamMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {createExamMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin ml-2"></i>
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus ml-2"></i>
                    إنشاء الامتحان
                  </>
                )}
              </Button>
              
              <Button 
                type="button" 
                variant="outline"
                onClick={() => form.reset()}
                className="px-6"
              >
                مسح
              </Button>
            </div>
          </form>
        </Form>

        {/* Tips */}
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
            <i className="fas fa-lightbulb"></i>
            نصائح لإنشاء امتحانات فعالة
          </h4>
          <ul className="text-sm text-purple-700 space-y-1">
            <li>• اختر عنواناً واضحاً يوضح نوع الامتحان ومجاله</li>
            <li>• اضبط الوقت المناسب (دقيقة واحدة لكل سؤال تقريباً)</li>
            <li>• حدد درجة نجاح مناسبة لمستوى المادة</li>
            <li>• بعد إنشاء الامتحان، ستحتاج لإضافة الأسئلة من لوحة الإدارة</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}