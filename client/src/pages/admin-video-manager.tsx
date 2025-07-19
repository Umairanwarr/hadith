import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Video, FileText, Clock, HardDrive, Calendar, User, Trash2, Edit2, Play } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Course {
  id: number;
  title: string;
  instructor: string;
  level: string;
  totalLessons: number;
}

interface Lesson {
  id: number;
  courseId: number;
  title: string;
  description: string;
  videoUrl: string;
  videoFileName: string;
  videoFileSize: number;
  videoMimeType: string;
  uploadStatus: string;
  duration: number;
  order: number;
  uploadedBy: string;
  uploadedAt: string;
  createdAt: string;
}

export default function AdminVideoManager() {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Form state
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    order: 1
  });

  const { data: courses } = useQuery({
    queryKey: ["/api/courses"],
    retry: false,
  });

  const { data: lessons } = useQuery({
    queryKey: ["/api/courses", selectedCourse, "lessons"],
    enabled: !!selectedCourse,
    retry: false,
  });

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        };

        xhr.onload = () => {
          if (xhr.status === 201) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(new Error(JSON.parse(xhr.responseText).message || 'Upload failed'));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        
        xhr.open('POST', `/api/admin/courses/${selectedCourse}/lessons`);
        xhr.send(formData);
      });
    },
    onSuccess: () => {
      toast({
        title: "تم الرفع بنجاح",
        description: "تم رفع الفيديو وإنشاء الدرس بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", selectedCourse, "lessons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      setUploadFile(null);
      setUploadProgress(0);
      setLessonForm({ title: "", description: "", order: 1 });
    },
    onError: (error: any) => {
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
        title: "خطأ في الرفع",
        description: error.message || "فشل في رفع الفيديو",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsUploading(false);
      setUploadProgress(0);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (lessonId: number) => {
      await apiRequest(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
    },
    onSuccess: () => {
      toast({
        title: "تم الحذف بنجاح",
        description: "تم حذف الدرس والفيديو بنجاح",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/courses", selectedCourse, "lessons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
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
        title: "خطأ في الحذف",
        description: "فشل في حذف الدرس",
        variant: "destructive",
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['video/mp4', 'video/avi', 'video/mkv', 'video/mov', 'video/wmv'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يرجى اختيار ملف فيديو صالح (MP4, AVI, MKV, MOV, WMV)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (500MB limit)
    if (file.size > 500 * 1024 * 1024) {
      toast({
        title: "حجم ملف كبير جداً",
        description: "حجم الملف يجب أن يكون أقل من 500 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setUploadFile(file);
  };

  const handleUpload = async () => {
    if (!uploadFile || !selectedCourse || !lessonForm.title.trim()) {
      toast({
        title: "بيانات ناقصة",
        description: "يرجى اختيار المادة والملف وإدخال عنوان الدرس",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append('video', uploadFile);
    formData.append('title', lessonForm.title);
    formData.append('description', lessonForm.description);
    formData.append('order', lessonForm.order.toString());

    setIsUploading(true);
    uploadMutation.mutate(formData);
  };

  const handleDelete = (lesson: Lesson) => {
    if (confirm(`هل أنت متأكد من حذف الدرس "${lesson.title}"؟ سيتم حذف الفيديو نهائياً.`)) {
      deleteMutation.mutate(lesson.id);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return "غير محدد";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white pt-24 pb-20" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الفيديوهات</h1>
          <p className="text-gray-600">رفع وإدارة الفيديوهات التعليمية للمواد</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">رفع فيديو جديد</TabsTrigger>
            <TabsTrigger value="manage">إدارة الفيديوهات</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  رفع فيديو تعليمي جديد
                </CardTitle>
                <CardDescription>
                  اختر المادة ورفع فيديو الدرس مع المعلومات المطلوبة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Course Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">اختيار المادة *</label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المادة الدراسية" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course: Course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title} - {course.instructor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lesson Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">عنوان الدرس *</label>
                    <Input
                      placeholder="أدخل عنوان الدرس"
                      value={lessonForm.title}
                      onChange={(e) => setLessonForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ترتيب الدرس</label>
                    <Input
                      type="number"
                      min="1"
                      value={lessonForm.order}
                      onChange={(e) => setLessonForm(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">وصف الدرس</label>
                  <Textarea
                    placeholder="أدخل وصف مفصل للدرس"
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>

                {/* File Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">ملف الفيديو *</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="video-upload"
                      disabled={isUploading}
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-1">
                        اضغط هنا لاختيار ملف فيديو أو اسحبه هنا
                      </p>
                      <p className="text-xs text-gray-500">
                        الأنواع المدعومة: MP4, AVI, MKV, MOV, WMV (حد أقصى: 500MB)
                      </p>
                    </label>
                  </div>
                  
                  {uploadFile && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">{uploadFile.name}</span>
                      </div>
                      <p className="text-sm text-blue-600">
                        الحجم: {formatFileSize(uploadFile.size)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>جاري الرفع...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} />
                  </div>
                )}

                {/* Upload Button */}
                <Button 
                  onClick={handleUpload}
                  disabled={!uploadFile || !selectedCourse || !lessonForm.title.trim() || isUploading}
                  className="w-full"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      جاري الرفع... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload className="ml-2 h-4 w-4" />
                      رفع الفيديو
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            {/* Course Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">اختيار المادة لعرض الفيديوهات</label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المادة الدراسية" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses?.map((course: Course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.title} - {course.instructor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lessons List */}
            {selectedCourse && (
              <div className="grid grid-cols-1 gap-4">
                {lessons?.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">لا توجد فيديوهات في هذه المادة بعد</p>
                    </CardContent>
                  </Card>
                ) : (
                  lessons?.map((lesson: Lesson) => (
                    <Card key={lesson.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              الدرس {lesson.order}: {lesson.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">{lesson.description}</p>
                            
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatDuration(lesson.duration)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <HardDrive className="h-4 w-4" />
                                <span>{formatFileSize(lesson.videoFileSize)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(lesson.uploadedAt).toLocaleDateString('ar-SA')}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>رفع بواسطة المدير</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Badge variant={lesson.uploadStatus === 'completed' ? 'default' : 'secondary'}>
                              {lesson.uploadStatus === 'completed' ? 'مكتمل' : 'معلق'}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          {lesson.videoUrl && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => window.open(lesson.videoUrl, '_blank')}
                            >
                              <Play className="ml-1 h-4 w-4" />
                              تشغيل
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingLesson(lesson)}
                          >
                            <Edit2 className="ml-1 h-4 w-4" />
                            تعديل
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(lesson)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="ml-1 h-4 w-4" />
                            حذف
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}