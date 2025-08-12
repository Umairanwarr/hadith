import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "wouter";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { createExamQuestionSchema, type CreateExamQuestion, type Exam, type ExamQuestion } from "@shared/schema";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Edit, Trash2 } from "lucide-react";

export default function AdminEditExam() {
  const { id: examId } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: exams } = useQuery<Exam[]>({ queryKey: ["exams"] });
  const currentExam = useMemo(() => exams?.find((e) => e.id === examId), [exams, examId]);

  const [editingQuestion, setEditingQuestion] = useState<ExamQuestion | null>(null);

  const form = useForm<CreateExamQuestion>({
    resolver: zodResolver(createExamQuestionSchema),
    defaultValues: {
      examId: examId,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      order: (currentExam?.totalQuestions || 0) + 1,
      points: 1,
    } as unknown as CreateExamQuestion,
  });

  // Update default order if exam data arrives later
  useEffect(() => {
    if (currentExam && !form.getValues("order")) {
      form.setValue("order", (currentExam.totalQuestions || 0) + 1 as any);
    }
  }, [currentExam]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options" as const,
  });

  // Keep Select options reactive and valid
  const watchedOptions = form.watch("options");
  const selectableOptions = (watchedOptions || []).filter(
    (opt: string | undefined) => typeof opt === "string" && opt.trim().length > 0
  );

  // If current correctAnswer is no longer present in options, reset it
  useEffect(() => {
    const current = form.getValues("correctAnswer");
    if (current && !selectableOptions.includes(current)) {
      form.setValue("correctAnswer", "");
    }
  }, [selectableOptions.join("|")]);

  // Load existing questions for this exam (admin view)
  const { data: questions, isLoading: questionsLoading } = useQuery<ExamQuestion[]>({
    queryKey: ["api", "admin", "exams", examId, "questions"],
    retry: false,
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/questions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api", "admin", "exams", examId, "questions"] });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      toast({ title: "تم حذف السؤال", description: "تم حذف السؤال بنجاح" });
    },
    onError: () => {
      toast({ title: "فشل حذف السؤال", description: "تعذر حذف السؤال", variant: "destructive" });
    },
  });

  const addQuestionMutation = useMutation({
    mutationFn: async (data: CreateExamQuestion) => {
      const { examId: _omitExamId, ...body } = data as any;
      const res = await apiRequest("POST", `/api/admin/exams/${examId}/questions`, body);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "تمت إضافة السؤال",
        description: "تم حفظ السؤال ضمن الاختبار",
      });
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      form.reset({
        examId,
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        order: (currentExam?.totalQuestions || 0) + 1 as any,
        points: 1 as any,
      } as unknown as CreateExamQuestion);
    },
    onError: async (error: any) => {
      toast({
        title: "فشل إضافة السؤال",
        description: error?.message || "تعذر حفظ السؤال. حاول مجدداً",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CreateExamQuestion) => {
    // Ensure numeric types
    const finalData = {
      ...data,
      examId,
      order: Number((data as any).order),
      points: Number((data as any).points) as any,
    } as CreateExamQuestion;

    if (editingQuestion) {
      try {
        await apiRequest("PATCH", `/api/admin/questions/${editingQuestion.id}`, finalData);
        toast({ title: "تم تحديث السؤال", description: "تم حفظ تعديلات السؤال" });
        setEditingQuestion(null);
        form.reset({
          examId,
          question: "",
          options: ["", "", "", ""],
          correctAnswer: "",
          order: (currentExam?.totalQuestions || 0) + 1 as any,
          points: 1 as any,
        } as unknown as CreateExamQuestion);
        queryClient.invalidateQueries({ queryKey: ["api", "admin", "exams", examId, "questions"] });
        queryClient.invalidateQueries({ queryKey: ["exams"] });
      } catch (error: any) {
        toast({ title: "فشل تحديث السؤال", description: error?.message || "تعذر تحديث السؤال", variant: "destructive" });
      }
      return;
    }

    addQuestionMutation.mutate(finalData);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">إدارة أسئلة الاختبار</h1>
          <Button variant="outline" onClick={() => setLocation("/admin")}>عودة للوحة الإدارة</Button>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-question-circle text-green-600"></i>
              إضافة سؤال للاختبار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {editingQuestion && (
                  <div className="p-3 rounded-md bg-yellow-50 text-yellow-800 text-sm">
                    أنت تقوم بتعديل سؤال موجود. يمكنك حفظ التعديلات أو إلغاء التعديل.
                    <Button
                      type="button"
                      variant="outline"
                      className="ml-2"
                      onClick={() => {
                        setEditingQuestion(null);
                        form.reset({
                          examId,
                          question: "",
                          options: ["", "", "", ""],
                          correctAnswer: "",
                          order: (currentExam?.totalQuestions || 0) + 1 as any,
                          points: 1 as any,
                        } as unknown as CreateExamQuestion);
                      }}
                    >
                      إلغاء التعديل
                    </Button>
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نص السؤال</FormLabel>
                      <FormControl>
                        <Textarea className="text-right min-h-[80px]" placeholder="اكتب نص السؤال هنا" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <div className="flex items-center justify-between">
                    <FormLabel>الخيارات</FormLabel>
                    <div className="space-x-2 space-x-reverse">
                      <Button type="button" variant="outline" onClick={() => append("")}>إضافة خيار</Button>
                      {fields.length > 2 && (
                        <Button type="button" variant="outline" onClick={() => remove(fields.length - 1)}>حذف آخر خيار</Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                    {fields.map((f, index) => (
                      <FormField
                        key={f.id}
                        control={form.control}
                        name={`options.${index}` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">خيار {index + 1}</FormLabel>
                            <FormControl>
                              <Input className="text-right" placeholder={`اكتب الخيار ${index + 1}`} {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="correctAnswer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الإجابة الصحيحة</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                        disabled={selectableOptions.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الإجابة الصحيحة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {selectableOptions.map((optionText, idx) => (
                            <SelectItem key={`${optionText}-${idx}`} value={optionText}>
                              {optionText}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="order"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ترتيب السؤال</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="points"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>النقاط</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="1" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={addQuestionMutation.isPending} className="flex-1 bg-green-600 hover:bg-green-700">
                    {addQuestionMutation.isPending ? (
                      <>
                        <i className="fas fa-spinner fa-spin ml-2"></i>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus ml-2"></i>
                        {editingQuestion ? "حفظ التعديلات" : "إضافة السؤال"}
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setLocation("/admin")}>إنهاء</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Existing questions list */}
        <div className="max-w-3xl mx-auto mt-6">
          <Card>
            <CardHeader>
              <CardTitle>الأسئلة الحالية</CardTitle>
            </CardHeader>
            <CardContent>
              {questionsLoading ? (
                <div className="text-gray-500">جاري التحميل...</div>
              ) : (questions && questions.length > 0) ? (
                <div className="space-y-4">
                  {questions
                    .slice()
                    .sort((a, b) => (a.order as any) - (b.order as any))
                    .map((q, idx) => (
                      <div key={q.id} className="border rounded-md p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm text-gray-500">سؤال {idx + 1} • ترتيب: {q.order} • نقاط: {q.points as any}</div>
                            <div className="font-medium mt-1">{q.question}</div>
                            <ul className="list-disc mr-5 mt-2 text-sm text-gray-700">
                              {Array.isArray(q.options) && q.options.map((opt, i) => (
                                <li key={`${q.id}-opt-${i}`} className={opt === q.correctAnswer ? "font-semibold text-green-700" : undefined}>
                                  {opt}
                                  {opt === q.correctAnswer ? " (الإجابة الصحيحة)" : ""}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingQuestion(q);
                                form.reset({
                                  examId,
                                  question: q.question as any,
                                  options: (q.options as any) || [],
                                  correctAnswer: q.correctAnswer as any,
                                  order: (q.order as any),
                                  points: Number(q.points as any) as any,
                                } as unknown as CreateExamQuestion);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm("هل تريد حذف هذا السؤال؟")) {
                                  deleteQuestionMutation.mutate(q.id as any);
                                }
                              }}
                              disabled={deleteQuestionMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-gray-500">لا توجد أسئلة بعد لهذا الاختبار.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

