import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Star, Play } from "lucide-react";
import { Link } from "wouter";
import type { Course } from "@shared/schema";

interface MobileCourseCardProps {
  course: Course;
  isEnrolled?: boolean;
  progress?: number;
}

export function MobileCourseCard({ course, isEnrolled, progress }: MobileCourseCardProps) {
  const levelColors = {
    1: "bg-green-100 text-green-800",
    2: "bg-blue-100 text-blue-800", 
    3: "bg-purple-100 text-purple-800",
    4: "bg-orange-100 text-orange-800",
    5: "bg-red-100 text-red-800",
    6: "bg-indigo-100 text-indigo-800"
  };

  const levelNames = {
    1: "دبلوم تحضيري",
    2: "دبلوم متوسط", 
    3: "شهادة في علوم الحديث",
    4: "بكالوريوس في علم الحديث",
    5: "عالم محدث",
    6: "دكتور في دراسات الحديث"
  };

  return (
    <Card className="w-full max-w-sm mx-auto hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-white to-green-50/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-right text-lg leading-tight text-gray-900 line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-gray-600 text-right mt-1 line-clamp-2">
              {course.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between gap-2 mt-3">
          <Badge 
            className={`${levelColors[course.level as keyof typeof levelColors]} text-xs font-semibold px-2 py-1`}
          >
            المستوى {course.level}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {levelNames[course.level as keyof typeof levelNames]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Course Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{course.duration} ساعة</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="h-4 w-4" />
            <span>متاح للجميع</span>
          </div>
        </div>

        {/* Progress Bar */}
        {isEnrolled && progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-600">التقدم</span>
              <span className="text-xs font-semibold text-green-600">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link href={`/courses/${course.id}`}>
          <Button 
            className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-sm"
            size="default"
          >
            {isEnrolled ? (
              <>
                <Play className="h-4 w-4 ml-2" />
                متابعة التعلم
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 ml-2" />
                البدء في الدورة
              </>
            )}
          </Button>
        </Link>

        {/* Rating */}
        <div className="flex items-center justify-center gap-1 mt-3 text-amber-500">
          {[1,2,3,4,5].map((star) => (
            <Star 
              key={star} 
              className="h-3 w-3 fill-current" 
            />
          ))}
          <span className="text-xs text-gray-600 mr-2">5.0</span>
        </div>
      </CardContent>
    </Card>
  );
}