import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useI18n } from "@/contexts/I18nContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImageUpload } from "@/components/image-upload";
import { FileUpload } from "@/components/file-upload";

// Schema for course creation/editing
const courseSchema = z.object({
  title: z.string().min(5, "عنوان الكورس يجب أن يكون 5 أحرف على الأقل"),
  description: z.string().min(10, "وصف الكورس يجب أن يكون 10 أحرف على الأقل"),
  instructor: z.string().min(3, "اسم المدرس مطلوب"),
  level: z.enum(["مبتدئ", "متوسط", "متقدم", "تمهيدي", "بكالوريوس", "ماجستير", "دكتوراه"]),
  duration: z.number().min(1, "مدة الكورس مطلوبة").optional(),
  thumbnailUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  syllabusUrl: z.string().optional(),
  syllabusFileName: z.string().optional(),
});

type CourseFormData = z.infer<typeof courseSchema>;

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: string;
  duration?: number;
  totalLessons: number;
  thumbnailUrl?: string;
  imageUrl?: string;
  syllabusUrl?: string;
  syllabusFileName?: string;
  isActive: boolean;
  createdAt: string;
}

// Extracted out of parent to avoid re-mounts on each keystroke which cause blinking
function CourseFormDialogComponent({
  open,
  onOpenChange,
  title,
  description,
  form,
  onSubmit,
  isUploadingSyllabus,
  handleSyllabusUpload,
  selectedCourse,
  setSelectedCourse,
  isSaving,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  form: UseFormReturn<CourseFormData>;
  onSubmit: (data: CourseFormData) => void;
  isUploadingSyllabus: boolean;
  handleSyllabusUpload: (file: File) => void | Promise<void>;
  selectedCourse: Course | null;
  setSelectedCourse: (c: Course | null) => void;
  isSaving: boolean;
}) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courseForm.title')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('courseForm.titlePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courseForm.description')}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t('courseForm.descriptionPlaceholder')} rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 notranslate" translate="no" data-no-translate>
              <FormField
                control={form.control}
                name="instructor"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courseForm.instructor')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('courseForm.instructorPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('courseForm.level')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('courseForm.levelPlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                      <SelectItem value="مبتدئ">{t('levels.beginner')}</SelectItem>
                      <SelectItem value="متوسط">{t('levels.intermediate')}</SelectItem>
                      <SelectItem value="متقدم">{t('levels.advanced')}</SelectItem>
                      <SelectItem value="تمهيدي">{t('levels.preparatory')}</SelectItem>
                      <SelectItem value="بكالوريوس">{t('levels.bachelor')}</SelectItem>
                      <SelectItem value="ماجستير">{t('levels.master')}</SelectItem>
                      <SelectItem value="دكتوراه">{t('levels.doctorate')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>مدة الكورس (بالدقائق)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="120"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="thumbnailUrl"
                render={({ field }) => (
                  <FormItem>
                    <ImageUpload
                      label="صورة مصغرة للكورس"
                      currentImage={field.value}
                      onImageUpload={(url) => {
                        field.onChange(url);
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <ImageUpload
                      label="صورة إضافية للكورس"
                      currentImage={field.value}
                      onImageUpload={(url) => {
                        field.onChange(url);
                      }}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Syllabus File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">مقرر المادة (ملف PDF/Word)</label>
              <FileUpload
                onFileSelect={handleSyllabusUpload}
                accept=".pdf,.doc,.docx"
                maxSize={10}
                buttonText="رفع مقرر المادة"
                currentFileName={form.watch('syllabusFileName')}
              />
              {isUploadingSyllabus && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <i className="fas fa-spinner fa-spin"></i>
                  جاري رفع الملف...
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onOpenChange(false);
                  setSelectedCourse(null);
                  form.reset();
                }}
              >
                إلغاء
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <i className="fas fa-spinner fa-spin ml-2"></i>
                    جاري الحفظ...
                  </>
                ) : (
                  selectedCourse ? "تحديث الكورس" : "إنشاء الكورس"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function CourseManagementPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [isUploadingSyllabus, setIsUploadingSyllabus] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const { toast } = useToast();

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      instructor: "",
      level: "مبتدئ",
      duration: 120,
      thumbnailUrl: "",
      imageUrl: "",
      syllabusUrl: "",
      syllabusFileName: "",
    },
  });

  // Fetch courses
  const { data: courses = [], isLoading, refetch } = useQuery({
    queryKey: ["courses"],
  });

  // Remove empty strings from URL fields so server validation (which requires valid URL when present) passes
  const sanitizeCourseData = (data: CourseFormData) => {
    const payload: any = { ...data };
    const urlFields: Array<keyof CourseFormData> = [
      'thumbnailUrl',
      'imageUrl',
      'syllabusUrl',
    ];
    urlFields.forEach((key) => {
      const value = payload[key];
      // Remove empty-like values
      if (value === '' || value === null || value === undefined) {
        delete payload[key];
        return;
      }
      // Remove invalid URL values defensively
      try {
        // Accept only http/https URLs
        const u = new URL(value as string);
        if (!/^https?:$/.test(u.protocol)) {
          delete payload[key];
        }
      } catch {
        delete payload[key];
      }
    });
    // Also drop empty syllabusFileName
    if (!payload.syllabusFileName) delete payload.syllabusFileName;
    return payload as CourseFormData;
  };

  // Create course mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      const payload = sanitizeCourseData(data);
      return await apiRequest("POST", "/courses", payload);
    },
    onSuccess: () => {
      toast({
        title: "نجح إنشاء الكورس",
        description: "تم إنشاء الكورس بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setIsCreateDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء الكورس",
        description: error.message || "حدث خطأ أثناء إنشاء الكورس",
        variant: "destructive",
      });
    },
  });

  // Update course mutation
  const updateCourseMutation = useMutation({
    mutationFn: async (data: CourseFormData & { id: string }) => {
      const { id, ...rest } = data;
      const payload = sanitizeCourseData(rest as CourseFormData);
      return await apiRequest("PATCH", `/api/courses/${id}`, payload);
    },
    onSuccess: () => {
      toast({
        title: "نجح تحديث الكورس",
        description: "تم تحديث الكورس بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setIsEditDialogOpen(false);
      setSelectedCourse(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث الكورس",
        description: error.message || "حدث خطأ أثناء تحديث الكورس",
        variant: "destructive",
      });
    },
  });

  // Delete course mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return await apiRequest("DELETE", `/api/courses/${courseId}`);
    },
    onSuccess: () => {
      toast({
        title: "نجح حذف الكورس",
        description: "تم حذف الكورس بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في حذف الكورس",
        description: error.message || "حدث خطأ أثناء حذف الكورس",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CourseFormData) => {
    if (selectedCourse) {
      updateCourseMutation.mutate({ ...(sanitizeCourseData(data) as CourseFormData), id: selectedCourse.id });
    } else {
      createCourseMutation.mutate(sanitizeCourseData(data));
    }
  };

  const handleEdit = (course: Course) => {
    setSelectedCourse(course);
    form.reset({
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      level: course.level as any,
      duration: course.duration,
      thumbnailUrl: course.thumbnailUrl || "",
      imageUrl: course.imageUrl || "",
      syllabusUrl: course.syllabusUrl || "",
      syllabusFileName: course.syllabusFileName || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (courseId: string) => {
    deleteCourseMutation.mutate(courseId);
  };

  // Handle syllabus file upload
  const handleSyllabusUpload = async (file: File) => {
    setIsUploadingSyllabus(true);
    try {
      const formData = new FormData();
      formData.append('syllabus', file);

      // Include Authorization header and use configured API base URL
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseURL}/upload/syllabus`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Update form values
      form.setValue('syllabusUrl', result.url);
      form.setValue('syllabusFileName', result.fileName);

      setSyllabusFile(file);

      toast({
        title: "نجح رفع الملف",
        description: `تم رفع ملف "${result.fileName}" بنجاح`,
      });
    } catch (error) {
      toast({
        title: "خطأ في رفع الملف",
        description: "حدث خطأ أثناء رفع مقرر المادة",
        variant: "destructive",
      });
    } finally {
      setIsUploadingSyllabus(false);
    }
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={course.level === "مبتدئ" ? "default" : course.level === "متوسط" ? "secondary" : "outline"}>
                {course.level}
              </Badge>
              <span className="text-sm text-gray-500">
                {course.duration && `${course.duration} دقيقة`}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
          </div>

          {/* Thumbnail removed from list display as requested */}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
          <span>المدرس: {course.instructor}</span>
          <span>{course.totalLessons} درس</span>
        </div>

        {/* Syllabus file info */}
        {course.syllabusFileName && (
          <div className="mb-3 p-2 bg-blue-50 rounded-md">
            <div className="flex items-center gap-2 text-sm">
              <i className="fas fa-file-alt text-blue-500"></i>
              <span className="text-blue-700 font-medium">مقرر المادة:</span>
              <span className="text-blue-600">{course.syllabusFileName}</span>
              {course.syllabusUrl && (
                <a
                  href={course.syllabusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  <i className="fas fa-download ml-1"></i>
                  تحميل
                </a>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() => handleEdit(course)}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <i className="fas fa-edit ml-1"></i>
            تعديل
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <i className="fas fa-trash ml-1"></i>
                حذف
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent dir="rtl">
              <AlertDialogHeader>
                <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
                <AlertDialogDescription>
                  سيتم حذف الكورس "{course.title}" نهائياً. لا يمكن التراجع عن هذا الإجراء.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(course.id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  حذف
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  // Removed inline CourseFormDialog component to prevent re-renders
  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-blue-600 to-blue-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-graduation-cap text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                    إدارة الكورسات والمواد
                  </h1>
                  <p className="text-blue-100 mt-2">
                    إضافة وتحرير الكورسات مع الصور والتفاصيل
                  </p>
                </div>
              </div>

              <Button
                onClick={() => {
                  setSelectedCourse(null);
                  form.reset();
                  setIsCreateDialogOpen(true);
                }}
                className="bg-white text-blue-700 hover:bg-blue-50"
              >
                <i className="fas fa-plus ml-2"></i>
                إضافة كورس جديد
              </Button>
            </div>
          </div>
        </div>

        {/* Level Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">تصفية حسب المستوى:</label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="جميع المستويات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المستويات</SelectItem>
                <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                <SelectItem value="متوسط">متوسط</SelectItem>
                <SelectItem value="متقدم">متقدم</SelectItem>
                <SelectItem value="تمهيدي">تمهيدي</SelectItem>
                <SelectItem value="بكالوريوس">بكالوريوس</SelectItem>
                <SelectItem value="ماجستير">ماجستير</SelectItem>
                <SelectItem value="دكتوراه">دكتوراه</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Courses List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <i className="fas fa-spinner fa-spin text-2xl text-gray-400 ml-3"></i>
            <span>جاري تحميل الكورسات...</span>
          </div>
        ) : (courses as Course[]).filter(course => selectedLevel === "all" || course.level === selectedLevel).length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-book-open text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">لا توجد كورسات بعد</h3>
            <p className="text-gray-500 mb-4">ابدأ بإنشاء أول كورس</p>
            <Button
              onClick={() => {
                setSelectedCourse(null);
                form.reset();
                setIsCreateDialogOpen(true);
              }}
            >
              <i className="fas fa-plus ml-2"></i>
              إنشاء كورس جديد
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(courses as Course[]).filter(course => selectedLevel === "all" || course.level === selectedLevel).map((course: Course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* Create Course Dialog */}
        <CourseFormDialogComponent
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          title="إنشاء كورس جديد"
          description="أضف كورس جديد مع الصور والتفاصيل"
          form={form}
          onSubmit={onSubmit}
          isUploadingSyllabus={isUploadingSyllabus}
          handleSyllabusUpload={handleSyllabusUpload}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          isSaving={createCourseMutation.isPending || updateCourseMutation.isPending}
        />

        {/* Edit Course Dialog */}
        <CourseFormDialogComponent
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          title="تعديل الكورس"
          description="تحديث بيانات الكورس والصور"
          form={form}
          onSubmit={onSubmit}
          isUploadingSyllabus={isUploadingSyllabus}
          handleSyllabusUpload={handleSyllabusUpload}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          isSaving={createCourseMutation.isPending || updateCourseMutation.isPending}
        />
      </main>

      <Footer />
    </div>
  );
}