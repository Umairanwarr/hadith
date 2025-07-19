import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Award, CheckCircle } from "lucide-react";
import { Link } from "wouter";

interface MobileExamCardProps {
  courseId: number;
  courseTitle: string;
  examDuration?: number;
  questionsCount?: number;
  passingScore?: number;
  completed?: boolean;
  score?: number;
}

export function MobileExamCard({ 
  courseId, 
  courseTitle, 
  examDuration = 60, 
  questionsCount = 20,
  passingScore = 70,
  completed = false,
  score
}: MobileExamCardProps) {
  return (
    <Card className="w-full hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-orange-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-right text-lg leading-tight text-gray-900 line-clamp-2">
              اختبار {courseTitle}
            </h3>
            <p className="text-sm text-gray-600 text-right mt-1">
              اختبار شامل لقياس مستوى الفهم والاستيعاب
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2 mt-3">
          {completed ? (
            <Badge className={`${score && score >= passingScore ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs font-semibold px-2 py-1`}>
              {score && score >= passingScore ? 'نجح' : 'لم ينجح'}
            </Badge>
          ) : (
            <Badge className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1">
              متاح للاختبار
            </Badge>
          )}
          
          {completed && score && (
            <Badge variant="outline" className="text-xs">
              النتيجة: {score}%
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Exam Info */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{examDuration} دقيقة</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <BookOpen className="h-4 w-4" />
            <span>{questionsCount} سؤال</span>
          </div>
        </div>

        {/* Score Required */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">الدرجة المطلوبة للنجاح</span>
            <span className="font-semibold text-green-600">{passingScore}%</span>
          </div>
        </div>

        {/* Action Button */}
        <Link href={`/courses/${courseId}/exam`}>
          <Button 
            className={`w-full h-11 font-semibold rounded-lg shadow-sm ${
              completed 
                ? score && score >= passingScore 
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-orange-600 hover:bg-orange-700 text-white"
                : "bg-orange-600 hover:bg-orange-700 text-white"
            }`}
            size="default"
          >
            {completed ? (
              score && score >= passingScore ? (
                <>
                  <Award className="h-4 w-4 ml-2" />
                  عرض النتيجة
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 ml-2" />
                  إعادة الاختبار
                </>
              )
            ) : (
              <>
                <CheckCircle className="h-4 w-4 ml-2" />
                بدء الاختبار
              </>
            )}
          </Button>
        </Link>

        {/* Additional Info */}
        <div className="flex items-center justify-center gap-1 mt-3 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>يمكن إعادة الاختبار مرة واحدة</span>
        </div>
      </CardContent>
    </Card>
  );
}