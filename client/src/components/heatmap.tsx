import { useMemo } from "react";

interface HeatmapProps {
  enrollments: Array<{
    id: number;
    courseId: number;
    progress: string;
    enrolledAt: string;
    course: {
      title: string;
      level: string;
    };
  }>;
}

interface ActivityData {
  date: string;
  count: number;
  activities: string[];
}

const HeatmapComponent = ({ enrollments }: HeatmapProps) => {
  const heatmapData = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth() - 11, 1); // Last 12 months
    const data: ActivityData[] = [];

    // Generate all days in the last 12 months
    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // Simulate learning activity based on enrollments and progress
      const activities: string[] = [];
      let count = 0;

      enrollments.forEach((enrollment) => {
        if (!enrollment.enrolledAt) return; // Skip if no enrollment date
        
        const enrollDate = new Date(enrollment.enrolledAt);
        const progress = Number(enrollment.progress);
        
        // Simulate daily learning activity
        if (currentDate >= enrollDate) {
          const daysSinceEnroll = Math.floor((currentDate.getTime() - enrollDate.getTime()) / (1000 * 60 * 60 * 24));
          
          // Create realistic activity patterns
          const isWeekend = currentDate.getDay() === 5 || currentDate.getDay() === 6; // Friday & Saturday in Arabic culture
          const studyProbability = isWeekend ? 0.3 : 0.7;
          
          // More activity at the beginning and when course is nearly complete
          const progressFactor = progress < 20 ? 1.2 : progress > 80 ? 1.5 : 1.0;
          
          // Random but deterministic based on date and course
          const seed = (currentDate.getDate() + enrollment.courseId * 7) % 10;
          
          if (seed / 10 < studyProbability * progressFactor) {
            if (progress > 0) {
              activities.push(`دراسة ${enrollment.course.title}`);
              count += 1;
            }
            
            // Add exam activity if course is completed
            if (progress >= 100 && seed % 3 === 0) {
              activities.push(`اختبار ${enrollment.course.title}`);
              count += 1;
            }
          }
        }
      });

      // Add some random scholarly activities
      const seed2 = (currentDate.getDate() * 3) % 10;
      if (seed2 === 0) {
        activities.push('مراجعة المتون');
        count += 1;
      } else if (seed2 === 1) {
        activities.push('حفظ الأحاديث');
        count += 1;
      } else if (seed2 === 2 && count > 0) {
        activities.push('مجلس سماع');
        count += 1;
      }

      data.push({
        date: dateStr,
        count: Math.min(count, 4), // Cap at 4 for visual consistency
        activities
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }, [enrollments]);

  const getIntensityClass = (count: number) => {
    if (count === 0) return 'bg-gray-100 hover:bg-gray-200';
    if (count === 1) return 'bg-green-200 hover:bg-green-300';
    if (count === 2) return 'bg-green-400 hover:bg-green-500';
    if (count === 3) return 'bg-green-600 hover:bg-green-700';
    return 'bg-green-800 hover:bg-green-900';
  };

  const getTooltipContent = (dayData: ActivityData) => {
    const date = new Date(dayData.date);
    const dateStr = date.toLocaleDateString('ar-SA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    if (dayData.count === 0) {
      return `${dateStr}\nلا توجد أنشطة دراسية`;
    }

    return `${dateStr}\n${dayData.count} نشاط دراسي\n${dayData.activities.slice(0, 3).join('\n')}${dayData.activities.length > 3 ? '\n...' : ''}`;
  };

  // Group data by weeks for better layout
  const weeks = useMemo(() => {
    const weekGroups: ActivityData[][] = [];
    let currentWeek: ActivityData[] = [];
    
    heatmapData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      // Start new week on Sunday (0)
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weekGroups.push([...currentWeek]);
        currentWeek = [];
      }
      
      currentWeek.push(day);
      
      // If it's the last day, push the remaining week
      if (index === heatmapData.length - 1) {
        weekGroups.push(currentWeek);
      }
    });
    
    return weekGroups;
  }, [heatmapData]);

  const monthLabels = useMemo(() => {
    const months: { name: string; position: number }[] = [];
    let currentMonth = -1;
    let weekPosition = 0;

    weeks.forEach((week, weekIndex) => {
      if (week.length > 0) {
        const firstDay = new Date(week[0].date);
        if (firstDay.getMonth() !== currentMonth) {
          currentMonth = firstDay.getMonth();
          months.push({
            name: firstDay.toLocaleDateString('ar-SA', { month: 'short' }),
            position: weekIndex * 16 // Approximate width of each week
          });
        }
      }
    });

    return months;
  }, [weeks]);

  return (
    <div className="w-full">
      {/* Month labels */}
      <div className="relative mb-2 h-4">
        {monthLabels.map((month, index) => (
          <div
            key={index}
            className="absolute text-xs text-gray-600 font-medium"
            style={{ left: `${month.position}px` }}
          >
            {month.name}
          </div>
        ))}
      </div>

      {/* Days of week labels */}
      <div className="flex gap-1 mb-2 mr-8">
        {['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'].map((day, index) => (
          <div key={index} className="w-3 h-3 text-xs text-gray-600 flex items-center">
            {index % 2 === 0 ? day[0] : ''}
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex gap-1 overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {Array.from({ length: 7 }, (_, dayIndex) => {
              const dayData = week.find(d => new Date(d.date).getDay() === dayIndex);
              
              if (!dayData) {
                return (
                  <div
                    key={`empty-${weekIndex}-${dayIndex}`}
                    className="w-3 h-3 bg-transparent"
                  />
                );
              }

              return (
                <div
                  key={dayData.date}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-colors duration-200 ${getIntensityClass(dayData.count)}`}
                  title={getTooltipContent(dayData)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-lg font-bold text-green-700">
            {heatmapData.filter(d => d.count > 0).length}
          </div>
          <div className="text-xs text-gray-600">يوم نشط</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-lg font-bold text-blue-700">
            {Math.round((heatmapData.filter(d => d.count > 0).length / heatmapData.length) * 100)}%
          </div>
          <div className="text-xs text-gray-600">معدل النشاط</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="text-lg font-bold text-orange-700">
            {Math.max(...heatmapData.map(d => d.count))}
          </div>
          <div className="text-xs text-gray-600">أكثر نشاط يومي</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="text-lg font-bold text-purple-700">
            {heatmapData.reduce((sum, d) => sum + d.count, 0)}
          </div>
          <div className="text-xs text-gray-600">إجمالي الأنشطة</div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="mt-6">
        <h4 className="font-semibold text-gray-800 mb-3 text-sm">الأنشطة الحديثة</h4>
        <div className="space-y-2">
          {heatmapData
            .slice(-7)
            .filter(d => d.count > 0)
            .reverse()
            .slice(0, 5)
            .map((day, index) => {
              const date = new Date(day.date);
              const dateStr = date.toLocaleDateString('ar-SA', {
                month: 'short',
                day: 'numeric'
              });
              
              return (
                <div key={index} className="flex items-center gap-3 text-sm">
                  <div className={`w-3 h-3 rounded-sm ${getIntensityClass(day.count)}`}></div>
                  <div className="text-gray-600 min-w-[60px]">{dateStr}</div>
                  <div className="text-gray-800 flex-1">
                    {day.activities.slice(0, 2).join(' • ')}
                    {day.activities.length > 2 && ` و ${day.activities.length - 2} أنشطة أخرى`}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default HeatmapComponent;