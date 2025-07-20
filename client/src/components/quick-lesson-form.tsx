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
import { createLessonSchema, type CreateLesson } from "@shared/schema";

interface QuickLessonFormProps {
  courseId?: number;
  onSuccess?: () => void;
}

export function QuickLessonForm({ courseId, onSuccess }: QuickLessonFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<number | undefined>(courseId);

  const form = useForm<CreateLesson>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      title: "",
      description: "",
      videoUrl: "",
      duration: 0,
      courseId: courseId || 0,
    },
  });

  const createLessonMutation = useMutation({
    mutationFn: async (data: CreateLesson) => {
      return await apiRequest("/api/admin/lessons", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: () => {
      toast({
        title: "تم إضافة الدرس بنجاح",
        description: "تم إضافة الدرس الجديد للمادة",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: () => {
      toast({
        title: "خطأ في إضافة الدرس",
        description: "فشل في إضافة الدرس. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateLesson) => {
    const finalData = { ...data, courseId: selectedCourse || data.courseId };
    createLessonMutation.mutate(finalData);
  };

  const getYouTubeVideoId = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[7].length === 11 ? match[7] : null;
  };

  const generateThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }
    return null;
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <i className="fas fa-plus-circle text-green-600"></i>
          إضافة درس تعليمي جديد
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
                      value={String(selectedCourse || "")} 
                      onValueChange={(value) => {
                        setSelectedCourse(Number(value));
                        field.onChange(Number(value));
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المادة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">أصول علم الحديث</SelectItem>
                        <SelectItem value="2">علم الرجال والأسانيد</SelectItem>
                        <SelectItem value="3">فقه الحديث</SelectItem>
                        <SelectItem value="4">تخريج الأحاديث</SelectItem>
                        <SelectItem value="5">شرح الأربعين النووية</SelectItem>
                        <SelectItem value="6">التفسير وعلوم القرآن</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Lesson Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان الدرس</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="مثال: مقدمة في علم الحديث" 
                      {...field} 
                      className="text-right"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Video URL */}
            <FormField
              control={form.control}
              name="videoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رابط الفيديو</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://www.youtube.com/watch?v=..." 
                      {...field}
                      className="text-left"
                      dir="ltr"
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 mt-1">
                    يدعم النظام: YouTube, Vimeo, والروابط المباشرة
                  </div>
                  {field.value && generateThumbnail(field.value) && (
                    <div className="mt-2">
                      <img 
                        src={generateThumbnail(field.value)!} 
                        alt="معاينة الفيديو" 
                        className="w-32 h-20 object-cover rounded border"
                      />
                    </div>
                  )}
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
                  <FormLabel>مدة الفيديو (بالدقائق)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="30" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <div className="text-xs text-gray-500 mt-1">
                    مهم لتتبع تقدم الطلاب بدقة
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف الدرس (اختياري)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="وصف مختصر عن محتوى الدرس وما سيتعلمه الطلاب..."
                      className="text-right min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={createLessonMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {createLessonMutation.isPending ? (
                  <>
                    <i className="fas fa-spinner fa-spin ml-2"></i>
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus ml-2"></i>
                    إضافة الدرس
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
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-800 mb-2 flex items-center gap-2">
            <i className="fas fa-lightbulb"></i>
            نصائح للمعلمين
          </h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• استخدم عناوين واضحة ومفيدة للدروس</li>
            <li>• تأكد من أن رابط الفيديو يعمل ومتاح للعرض</li>
            <li>• اضبط مدة الفيديو بدقة لتتبع صحيح للتقدم</li>
            <li>• اكتب وصفاً مفيداً يساعد الطلاب على فهم محتوى الدرس</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}