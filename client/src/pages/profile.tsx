import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string;
  city: string;
  specialization: string;
  level: string;
  createdAt: string;
}

interface UserStats {
  completedCourses: number;
  certificates: number;
  totalHours: number;
  averageGrade: number;
}

interface RecentActivity {
  title: string;
  date: string;
  type: 'certificate' | 'exam' | 'course';
}

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const { logout } = useAuthContext();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    city: '',
    specialization: '',
    level: '',
  });

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/dashboard/stats"],
    retry: false,
  });

  // Initialize form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        city: user.city || '',
        specialization: user.specialization || '',
        level: user.level || 'مبتدئ',
      });
    }
  }, [user]);

  const promoteToAdminMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/promote-to-admin');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/auth/user"] });
      toast({
        title: "تم الترقية بنجاح",
        description: "تم ترقيتك إلى مدير",
      });
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الترقية",
        description: error.message || "حدث خطأ أثناء الترقية",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      await apiRequest('PATCH', '/api/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/auth/user"] });
      setIsEditing(false);
      toast({
        title: "تم تحديث الملف الشخصي",
        description: "تم حفظ التغييرات بنجاح",
      });
    },
    onError: (error: any) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "غير مخول",
          description: "يتم إعادة تسجيل الدخول...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
        return;
      }

      // Handle validation errors
      if (error.message.includes('400:') && error.errors) {
        const errorMessages = error.errors.map((err: any) => err.message).join(', ');
        toast({
          title: "خطأ في البيانات",
          description: errorMessages,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "خطأ في التحديث",
        description: error.message || "حدث خطأ أثناء تحديث الملف الشخصي",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        city: user.city || '',
        specialization: user.specialization || '',
        level: user.level || 'مبتدئ',
      });
    }
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, redirect to home
      setLocation('/');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getUserDisplayName = () => {
    if (!user) return 'الطالب';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email?.split('@')[0] || 'الطالب';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'مبتدئ':
        return 'bg-green-100 text-green-800';
      case 'متوسط':
        return 'bg-blue-100 text-blue-800';
      case 'متقدم':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Generate mock recent activities based on stats
  const getRecentActivities = (): RecentActivity[] => {
    if (!stats) return [];
    
    const activities: RecentActivity[] = [];
    
    if (stats.certificates > 0) {
      activities.push({
        title: 'حصلت على شهادة جديدة في علوم الحديث',
        date: 'منذ 3 أيام',
        type: 'certificate'
      });
    }
    
    if (stats.completedCourses > 0) {
      activities.push({
        title: 'اجتزت اختبار في مادة منهج الإمام البخاري',
        date: 'منذ أسبوع',
        type: 'exam'
      });
      
      activities.push({
        title: 'بدأت دراسة مادة جديدة في علوم الحديث',
        date: 'منذ أسبوعين',
        type: 'course'
      });
    }
    
    return activities.slice(0, 3); // Show only last 3 activities
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'certificate':
        return 'fas fa-certificate';
      case 'exam':
        return 'fas fa-graduation-cap';
      case 'course':
        return 'fas fa-play';
      default:
        return 'fas fa-info-circle';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'certificate':
        return 'bg-[hsl(158,40%,34%)]';
      case 'exam':
        return 'bg-[hsl(45,76%,58%)]';
      case 'course':
        return 'bg-blue-600';
      default:
        return 'bg-gray-600';
    }
  };

  if (authLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="md:col-span-2 h-96 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
              <h2 className="text-xl font-bold text-gray-900 mb-2">خطأ في تحميل البيانات</h2>
              <p className="text-gray-600 mb-4">لم يتم العثور على بيانات المستخدم</p>
              <Button onClick={() => window.location.reload()}>
                إعادة تحميل الصفحة
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const recentActivities = getRecentActivities();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-amiri font-bold text-[hsl(158,40%,34%)] mb-2">
            الملف الشخصي
          </h1>
          <p className="text-gray-600">
            إدارة معلوماتك الشخصية ومتابعة تقدمك الأكاديمي
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="صورة الطالب" 
                    className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-[hsl(158,40%,34%)]" 
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-[hsl(158,40%,34%)] flex items-center justify-center">
                    <i className="fas fa-user text-3xl text-white"></i>
                  </div>
                )}
                <h2 className="font-amiri font-bold text-lg">{getUserDisplayName()}</h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
                <p className="text-sm text-gray-500">
                  طالب منذ: {formatDate(user.createdAt)}
                </p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="firstName">الاسم الأول:</Label>
                  {isEditing ? (
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      placeholder="أدخل اسمك الأول"
                      required
                    />
                  ) : (
                    <p className="mt-1 text-sm">{user.firstName || 'غير محدد'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">اسم العائلة:</Label>
                  {isEditing ? (
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      placeholder="أدخل اسم عائلتك"
                      required
                    />
                  ) : (
                    <p className="mt-1 text-sm">{user.lastName || 'غير محدد'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="level">المستوى:</Label>
                  {isEditing ? (
                    <Select 
                      value={formData.level} 
                      onValueChange={(value) => handleInputChange('level', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="مبتدئ">مبتدئ</SelectItem>
                        <SelectItem value="متوسط">متوسط</SelectItem>
                        <SelectItem value="متقدم">متقدم</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(user.level || 'مبتدئ')}`}>
                        {user.level || 'مبتدئ'}
                      </span>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="city">المدينة:</Label>
                  {isEditing ? (
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="اختر مدينتك"
                    />
                  ) : (
                    <p className="mt-1 text-sm">{user.city || 'غير محدد'}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="specialization">التخصص:</Label>
                  {isEditing ? (
                    <Input
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange('specialization', e.target.value)}
                      placeholder="مثل: علوم الحديث، الفقه، العقيدة"
                    />
                  ) : (
                    <p className="mt-1 text-sm">{user.specialization || 'غير محدد'}</p>
                  )}
                </div>
                
                {isEditing ? (
                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="btn-primary flex-1"
                    >
                      {updateProfileMutation.isPending ? "جاري الحفظ..." : "حفظ"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                      className="flex-1"
                    >
                      إلغاء
                    </Button>
                  </div>
                ) : (
                  <Button 
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="w-full btn-primary mt-4"
                  >
                    تحديث الملف
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
          
          {/* Academic Progress */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-amiri font-bold text-lg mb-6">الإنجازات الأكاديمية</h3>
                
                {/* Progress Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-[hsl(158,40%,34%)]">
                      {stats?.completedCourses || 0}
                    </div>
                    <div className="text-sm text-gray-600">مادة مكتملة</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-[hsl(45,76%,58%)]">
                      {stats?.certificates || 0}
                    </div>
                    <div className="text-sm text-gray-600">شهادة</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.totalHours || 0}
                    </div>
                    <div className="text-sm text-gray-600">ساعة دراسية</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {stats?.averageGrade || 0}%
                    </div>
                    <div className="text-sm text-gray-600">المعدل العام</div>
                  </div>
                </div>
                
                {/* Recent Activity */}
                <h4 className="font-semibold mb-4">النشاط الأخير</h4>
                {recentActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-history text-3xl text-gray-400 mb-3"></i>
                    <p className="text-gray-500">لا يوجد نشاط حديث</p>
                    <p className="text-sm text-gray-400">ابدأ بدراسة المواد لترى نشاطك هنا</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-10 h-10 ${getActivityColor(activity.type)} rounded-full flex items-center justify-center text-white`}>
                          <i className={getActivityIcon(activity.type)}></i>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-gray-600">{activity.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-amiri font-bold text-lg mb-4">إجراءات سريعة</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {user.role !== 'admin' && (
                    <Button
                      onClick={() => promoteToAdminMutation.mutate()}
                      disabled={promoteToAdminMutation.isPending}
                      className="flex items-center gap-3 p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors h-auto"
                    >
                      <i className="fas fa-user-shield text-xl"></i>
                      <div className="text-right">
                        <div className="font-semibold">ترقية إلى مدير</div>
                        <div className="text-sm opacity-90">مؤقت - للتطوير</div>
                      </div>
                    </Button>
                  )}
                  <a 
                    href="/" 
                    className="flex items-center gap-3 p-4 bg-[hsl(158,40%,34%)] text-white rounded-lg hover:bg-[hsl(158,46%,47%)] transition-colors"
                  >
                    <i className="fas fa-book-open text-xl"></i>
                    <div>
                      <div className="font-semibold">تصفح المواد</div>
                      <div className="text-sm opacity-90">ابدأ مادة جديدة</div>
                    </div>
                  </a>
                  
                  <a 
                    href="/certificates" 
                    className="flex items-center gap-3 p-4 bg-[hsl(45,76%,58%)] text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <i className="fas fa-certificate text-xl"></i>
                    <div>
                      <div className="font-semibold">شهاداتي</div>
                      <div className="text-sm opacity-90">عرض وتحميل</div>
                    </div>
                  </a>
                  
                  <Button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors h-auto w-full justify-start"
                  >
                    <i className="fas fa-sign-out-alt text-xl"></i>
                    <div>
                      <div className="font-semibold">تسجيل الخروج</div>
                      <div className="text-sm opacity-90">إنهاء الجلسة</div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
