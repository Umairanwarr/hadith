import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { ImageUpload } from "@/components/image-upload";

// Schema for diploma template creation
const createDiplomaTemplateSchema = z.object({
  title: z.string().min(5, "عنوان الديبلوم يجب أن يكون 5 أحرف على الأقل"),
  level: z.enum(["تحضيري", "متوسط", "شهادة", "بكالوريوس", "ماجستير", "دكتوراه"]),
  backgroundColor: z.string().min(3, "لون الخلفية مطلوب"),
  textColor: z.string().min(3, "لون النص مطلوب"),
  borderColor: z.string().min(3, "لون الحدود مطلوب"),
  logoUrl: z.string().optional(),
  sealUrl: z.string().optional(),
  institutionName: z.string().min(5, "اسم المؤسسة مطلوب"),
  templateStyle: z.enum(["classic", "modern", "elegant"]),
  requirements: z.string().min(10, "متطلبات الديبلوم يجب أن تكون 10 أحرف على الأقل"),
});

type CreateDiplomaTemplate = z.infer<typeof createDiplomaTemplateSchema>;

interface DiplomaTemplate {
  id: number;
  title: string;
  level: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  logoUrl?: string;
  sealUrl?: string;
  institutionName: string;
  templateStyle: string;
  requirements: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Certificate Preview Component
const CertificatePreview = ({ template }: { template: DiplomaTemplate }) => (
  <div
    className="mx-auto p-6 border-4 rounded-lg shadow-xl bg-white"
    style={{
      backgroundColor: template.backgroundColor,
      color: template.textColor,
      borderColor: template.borderColor,
      width: '100%',
      maxWidth: '600px',
      height: '400px',
      aspectRatio: '3/2'
    }}
  >
    <div className="text-center space-y-3">
      {template.logoUrl && (
        <img src={template.logoUrl} alt="شعار الجامعة" className="mx-auto h-12 w-12 object-contain" />
      )}
      <h1 className="text-xl font-amiri font-bold">{template.institutionName}</h1>
      <div className="border-t border-b border-current py-3">
        <h2 className="text-lg font-amiri">شهادة {template.title}</h2>
        <p className="text-sm mt-1">المستوى: {template.level}</p>
      </div>
      <p className="text-center text-sm">
        تشهد هذه الجامعة بأن الطالب/الطالبة:
      </p>
      <div className="text-lg font-bold border-b border-current pb-2 mx-8">
        [اسم الطالب]
      </div>
      <p className="text-sm">
        قد أكمل بنجاح جميع متطلبات {template.title}
      </p>
      <div className="flex justify-between items-end pt-4 text-xs">
        <div>
          التاريخ: [تاريخ الإصدار]
          {template.sealUrl && (
            <div className="mt-1">
              <img src={template.sealUrl} alt="ختم الجامعة" className="w-8 h-8 object-contain" />
            </div>
          )}
        </div>
        <div>رقم الشهادة: [رقم الشهادة]</div>
      </div>
    </div>
  </div>
);

// Live Preview Component to prevent re-rendering issues
function LivePreview({ form }: { form: any }) {
  const watchedValues = useWatch({
    control: form.control,
    name: ['title', 'level', 'backgroundColor', 'textColor', 'borderColor', 'logoUrl', 'sealUrl', 'institutionName', 'templateStyle', 'requirements']
  });

  const [title, level, backgroundColor, textColor, borderColor, logoUrl, sealUrl, institutionName, templateStyle, requirements] = watchedValues;

  const previewTemplate = {
    id: 0,
    title: title || 'عنوان الديبلوم',
    level: level || 'تحضيري',
    backgroundColor: backgroundColor || '#ffffff',
    textColor: textColor || '#000000',
    borderColor: borderColor || '#d4af37',
    logoUrl: logoUrl || '',
    sealUrl: sealUrl || '',
    institutionName: institutionName || 'جامعة الإمام الزُّهري',
    templateStyle: templateStyle || 'classic',
    requirements: requirements || '',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">معاينة مباشرة</h3>
      <div className="border rounded-lg p-4 bg-gray-50 overflow-hidden w-full flex justify-center">
        <CertificatePreview template={previewTemplate} />
      </div>
    </div>
  );
}

export function DiplomaManagementPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<DiplomaTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<DiplomaTemplate | null>(null);

  const form = useForm<CreateDiplomaTemplate>({
    resolver: zodResolver(createDiplomaTemplateSchema),
    defaultValues: {
      title: "",
      level: "تحضيري",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      borderColor: "#d4af37",
      logoUrl: "",
      sealUrl: "",
      institutionName: "جامعة الإمام الزُّهري",
      templateStyle: "classic",
      requirements: "",
    },
  });

  // Fetch diploma templates
  const { data: templates = [], isLoading, error, refetch } = useQuery({
    queryKey: ["/diploma-templates"],
    retry: 3,
    retryDelay: 1000,
  });

  // Debug logging
  console.log('📋 Diploma Templates Debug:', {
    templates,
    templatesLength: templates?.length,
    isLoading,
    error,
    timestamp: new Date().toISOString()
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: CreateDiplomaTemplate) => {
      console.log('🚀 Creating diploma template:', data);
      const result = await apiRequest("POST", "/api/diploma-templates", data);
      console.log('📄 Template creation result:', result);
      return result;
    },
    onSuccess: (newTemplate) => {
      console.log('✅ Template created successfully:', newTemplate);
      queryClient.invalidateQueries({ queryKey: ["/diploma-templates"] });
      // Force refetch to ensure latest data
      refetch();
      setIsCreateDialogOpen(false);
      toast({
        title: "تم إنشاء قالب الديبلوم",
        description: "تم إضافة قالب ديبلوم جديد بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في إنشاء القالب",
        description: error.message || "حدث خطأ أثناء إنشاء قالب الديبلوم",
        variant: "destructive",
      });
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<CreateDiplomaTemplate> }) => {
      console.log('🔄 Updating diploma template:', { id, data });
      return apiRequest("PUT", `/api/diploma-templates/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/diploma-templates"] });
      refetch();
      setIsCreateDialogOpen(false);
      toast({
        title: "تم تحديث القالب",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث القالب",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (templateId: number) => {
      console.log('🗑️ Deleting diploma template:', templateId);
      return apiRequest("DELETE", `/api/diploma-templates/${templateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/diploma-templates"] });
      refetch();
      toast({
        title: "تم حذف القالب",
        description: "تم حذف قالب الديبلوم بنجاح",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحذف",
        description: error.message || "حدث خطأ أثناء حذف القالب",
        variant: "destructive",
      });
    },
  });

  // Toggle active status mutation
  const toggleActiveStatusMutation = useMutation({
    mutationFn: async ({ templateId, isActive }: { templateId: number; isActive: boolean }) => {
      console.log('🔄 Toggling template status:', { templateId, isActive });
      return apiRequest("PATCH", `/api/diploma-templates/${templateId}/status`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/diploma-templates"] });
      refetch();
      toast({
        title: "تم تحديث حالة القالب",
        description: "تم تحديث حالة تفعيل القالب",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في تحديث الحالة",
        description: error.message || "حدث خطأ أثناء تحديث حالة القالب",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateDiplomaTemplate) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data });
    } else {
      createTemplateMutation.mutate(data);
    }
  };

  const handleEdit = (template: DiplomaTemplate) => {
    setEditingTemplate(template);
    // Use setTimeout to ensure the dialog state is set first
    setTimeout(() => {
      form.reset({
        title: template.title,
        level: template.level as any,
        backgroundColor: template.backgroundColor,
        textColor: template.textColor,
        borderColor: template.borderColor,
        logoUrl: template.logoUrl || "",
        sealUrl: template.sealUrl || "",
        institutionName: template.institutionName,
        templateStyle: template.templateStyle as any,
        requirements: template.requirements,
      });
    }, 0);
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (templateId: number) => {
    deleteTemplateMutation.mutate(templateId);
  };

  const toggleActiveStatus = (templateId: number, currentStatus: boolean) => {
    toggleActiveStatusMutation.mutate({ templateId, isActive: !currentStatus });
  };

  const getLevelColor = (level: string) => {
    const colors = {
      'تحضيري': 'bg-blue-100 text-blue-800',
      'متوسط': 'bg-green-100 text-green-800',
      'شهادة': 'bg-purple-100 text-purple-800',
      'بكالوريوس': 'bg-orange-100 text-orange-800',
      'ماجستير': 'bg-red-100 text-red-800',
      'دكتوراه': 'bg-gray-100 text-gray-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };



  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-amber-600 to-amber-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-certificate text-2xl"></i>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                    إدارة قوالب الديبلومات
                  </h1>
                  <p className="text-amber-100 mt-2">
                    إنشاء وتخصيص قوالب الشهادات والديبلومات
                  </p>
                </div>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) {
                  // Cleanup when dialog closes
                  setTimeout(() => {
                    setEditingTemplate(null);
                    form.reset();
                  }, 100);
                }
              }}>
                <DialogTrigger asChild>
                  <Button
                    className="bg-white text-amber-600 hover:bg-amber-50"
                    onClick={() => {
                      setEditingTemplate(null);
                      form.reset();
                    }}
                  >
                    <i className="fas fa-plus ml-2"></i>
                    إضافة قالب جديد
                  </Button>
                </DialogTrigger>

                <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingTemplate ? "تحديث قالب الديبلوم" : "إضافة قالب ديبلوم جديد"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingTemplate ? "تحديث بيانات القالب المختار" : "املأ المعلومات لإنشاء قالب ديبلوم جديد"}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="grid grid-cols-1 xl:grid-cols-[1fr,600px] gap-8">
                    {/* Form */}
                    <div>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>عنوان الديبلوم</FormLabel>
                                <FormControl>
                                  <Input placeholder="الديبلوم التحضيري في علوم الحديث" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="level"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>المستوى</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="اختر المستوى" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="تحضيري">تحضيري</SelectItem>
                                      <SelectItem value="متوسط">متوسط</SelectItem>
                                      <SelectItem value="شهادة">شهادة</SelectItem>
                                      <SelectItem value="بكالوريوس">بكالوريوس</SelectItem>
                                      <SelectItem value="ماجستير">ماجستير</SelectItem>
                                      <SelectItem value="دكتوراه">دكتوراه</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="templateStyle"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>نمط التصميم</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="اختر النمط" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="classic">كلاسيكي</SelectItem>
                                      <SelectItem value="modern">عصري</SelectItem>
                                      <SelectItem value="elegant">أنيق</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="institutionName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>اسم المؤسسة</FormLabel>
                                <FormControl>
                                  <Input placeholder="جامعة الإمام الزُّهري" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-3 gap-4">
                            <FormField
                              control={form.control}
                              name="backgroundColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>لون الخلفية</FormLabel>
                                  <FormControl>
                                    <Input type="color" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="textColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>لون النص</FormLabel>
                                  <FormControl>
                                    <Input type="color" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="borderColor"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>لون الحدود</FormLabel>
                                  <FormControl>
                                    <Input type="color" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="logoUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <ImageUpload
                                    label="شعار الجامعة"
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
                              name="sealUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <ImageUpload
                                    label="ختم الجامعة"
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

                          <FormField
                            control={form.control}
                            name="requirements"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>متطلبات الحصول على الديبلوم</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="يجب على الطالب إكمال جميع المقررات والاجتياز بدرجة لا تقل عن 70%..."
                                    className="min-h-[80px]"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-3 pt-4">
                            <Button
                              type="submit"
                              disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                              className="flex-1"
                            >
                              {(createTemplateMutation.isPending || updateTemplateMutation.isPending) ? (
                                <>
                                  <i className="fas fa-spinner fa-spin ml-2"></i>
                                  {editingTemplate ? "جاري التحديث..." : "جاري الإنشاء..."}
                                </>
                              ) : (
                                <>
                                  <i className={`fas ${editingTemplate ? 'fa-save' : 'fa-plus'} ml-2`}></i>
                                  {editingTemplate ? "حفظ التغييرات" : "إنشاء القالب"}
                                </>
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsCreateDialogOpen(false);
                              }}
                            >
                              إلغاء
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>

                    {/* Live Preview */}
                    <LivePreview form={form} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Templates Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>جميع قوالب الديبلومات ({templates.length})</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <i className="fas fa-refresh ml-2"></i>
                {isLoading ? "جاري التحميل..." : "تحديث"}
              </Button>
            </div>
            {error && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                خطأ في تحميل القوالب: {(error as any)?.message || 'خطأ غير معروف'}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <i className="fas fa-spinner fa-spin text-2xl text-gray-400 ml-3"></i>
                <span>جاري تحميل القوالب...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <i className="fas fa-certificate text-4xl mb-4 text-gray-300"></i>
                <p className="text-lg">لا توجد قوالب ديبلومات حتى الآن</p>
                <p className="text-sm mt-2">اضغط على "إضافة قالب جديد" لإنشاء أول قالب</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>العنوان</TableHead>
                      <TableHead>المستوى</TableHead>
                      <TableHead>المؤسسة</TableHead>
                      <TableHead>النمط</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template: DiplomaTemplate) => (
                      <TableRow key={template.id}>
                        <TableCell>
                          <div className="font-semibold">{template.title}</div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getLevelColor(template.level)}>
                            {template.level}
                          </Badge>
                        </TableCell>
                        <TableCell>{template.institutionName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {template.templateStyle === 'classic' ? 'كلاسيكي' :
                              template.templateStyle === 'modern' ? 'عصري' : 'أنيق'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant={template.isActive ? "default" : "secondary"}>
                              {template.isActive ? "نشط" : "غير نشط"}
                            </Badge>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleActiveStatus(template.id, template.isActive)}
                              disabled={toggleActiveStatusMutation.isPending}
                            >
                              {template.isActive ? "إلغاء التفعيل" : "تفعيل"}
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setPreviewTemplate(template)}
                            >
                              <i className="fas fa-eye"></i>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(template)}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                                  <i className="fas fa-trash"></i>
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف هذا القالب؟ سيؤثر هذا على جميع الشهادات المرتبطة به.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(template.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    حذف القالب
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview Dialog */}
        <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>معاينة قالب الديبلوم</DialogTitle>
              <DialogDescription>
                معاينة لشكل الشهادة النهائية
              </DialogDescription>
            </DialogHeader>
            {previewTemplate && (
              <div className="flex justify-center p-4">
                <CertificatePreview template={previewTemplate} />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}