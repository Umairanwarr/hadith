import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, CheckCircle, PlayCircle, Award } from "lucide-react";
import { Link } from "wouter";

interface MobileCourseProgressProps {
  courseId: number;
  courseTitle: string;
  progress: number;
  completedLessons: number;
  totalLessons: number;
  totalDuration: number;
  nextLessonId?: number;
  canTakeExam?: boolean;
}

export function MobileCourseProgress({
  courseId,
  courseTitle,
  progress,
  completedLessons,
  totalLessons,
  totalDuration,
  nextLessonId,
  canTakeExam
}: MobileCourseProgressProps) {
  return (
    <Card className="w-full bg-gradient-to-br from-green-50 to-white border-green-200 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-right text-lg font-bold text-green-800">
          تقدمك في الدورة
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Circle */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#e5e7eb"
                strokeWidth="8"
                fill="transparent"
                className="opacity-20"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="#16a34a"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${progress * 2.83} 283`}
                className="transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-green-700">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        </div>

        {/* Progress Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3 text-center border border-green-100">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="font-semibold">{completedLessons}</span>
            </div>
            <p className="text-xs text-gray-600">دروس مكتملة</p>
          </div>
          
          <div className="bg-white rounded-lg p-3 text-center border border-green-100">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <BookOpen className="h-4 w-4" />
              <span className="font-semibold">{totalLessons}</span>
            </div>
            <p className="text-xs text-gray-600">إجمالي الدروس</p>
          </div>
        </div>

        {/* Time Info */}
        <div className="bg-white rounded-lg p-3 border border-green-100">
          <div className="flex items-center justify-center gap-2 text-orange-600">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-semibold">
              {Math.round(totalDuration / 60)} ساعة إجمالية
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600">
            <span>التقدم الإجمالي</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {nextLessonId && (
            <Link href={`/courses/${courseId}/lessons/${nextLessonId}`}>
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                <PlayCircle className="h-4 w-4 ml-2" />
                متابعة التعلم
              </Button>
            </Link>
          )}
          
          {canTakeExam && (
            <Link href={`/courses/${courseId}/exam`}>
              <Button 
                variant="outline" 
                className="w-full border-orange-500 text-orange-700 hover:bg-orange-50"
              >
                <Award className="h-4 w-4 ml-2" />
                دخول الاختبار النهائي
              </Button>
            </Link>
          )}
        </div>

        {/* Achievement Badge */}
        {progress >= 100 && (
          <div className="flex justify-center">
            <Badge className="bg-green-100 text-green-800 px-3 py-1">
              <Award className="h-3 w-3 ml-1" />
              دورة مكتملة!
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}