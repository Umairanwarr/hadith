import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import CertificateGenerator from "@/components/certificate-generator";
import { useAuth } from "@/hooks/useAuth";

interface Course {
  id: number;
  title: string;
  instructor: string;
}

interface Certificate {
  id: number;
  certificateNumber: string;
  issuedAt: string;
  grade: string;
  course: Course;
}

export default function Certificates() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: certificates, isLoading, error } = useQuery<Certificate[]>({
    queryKey: ["/my-certificates"],
    retry: false,
  });

  // Handle unauthorized error
  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "غير مخول",
        description: "يتم إعادة تسجيل الدخول...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    }
  }, [error, toast]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getCertificateGradient = (index: number) => {
    const gradients = [
      'from-[hsl(158,40%,34%)] to-[hsl(158,46%,47%)]',
      'from-[hsl(45,76%,58%)] to-yellow-600',
      'from-purple-500 to-purple-700',
      'from-blue-500 to-blue-700',
    ];
    return gradients[index % gradients.length];
  };

  const getUserDisplayName = () => {
    if (!user) return 'الطالب';
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.email?.split('@')[0] || 'الطالب';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-amiri font-bold text-[hsl(158,40%,34%)] mb-2">
            الشهادات المحصل عليها
          </h1>
          <p className="text-gray-600">
            جميع الشهادات التي حصلت عليها من إتمام المواد الدراسية بنجاح
          </p>
        </div>

        {!certificates || certificates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <i className="fas fa-certificate text-6xl text-gray-400 mb-6"></i>
                <h2 className="text-2xl font-amiri font-bold text-gray-600 mb-4">
                  لا توجد شهادات بعد
                </h2>
                <p className="text-gray-500 mb-6">
                  لم تحصل على أي شهادات حتى الآن. أكمل المواد الدراسية واجتز الاختبارات للحصول على شهاداتك الأولى.
                </p>
                <a 
                  href="/" 
                  className="inline-flex items-center px-6 py-3 bg-[hsl(158,40%,34%)] text-white rounded-lg hover:bg-[hsl(158,46%,47%)] transition-colors"
                >
                  <i className="fas fa-book-open ml-2"></i>
                  تصفح المواد الدراسية
                </a>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-[hsl(158,40%,34%)] mb-2">
                    {certificates.length}
                  </div>
                  <div className="text-sm text-gray-600">إجمالي الشهادات</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-[hsl(45,76%,58%)] mb-2">
                    {Math.round(certificates.reduce((sum, cert) => sum + Number(cert.grade), 0) / certificates.length)}%
                  </div>
                  <div className="text-sm text-gray-600">المعدل العام</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {certificates.filter(cert => Number(cert.grade) >= 90).length}
                  </div>
                  <div className="text-sm text-gray-600">شهادات ممتازة</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {new Date().getFullYear()}
                  </div>
                  <div className="text-sm text-gray-600">السنة الحالية</div>
                </CardContent>
              </Card>
            </div>

            {/* Certificates Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              {certificates.map((certificate, index) => (
                <Card key={certificate.id} className="hover-scale overflow-hidden">
                  {/* Certificate Preview */}
                  <div className={`bg-gradient-to-br ${getCertificateGradient(index)} p-8 text-white relative islamic-pattern`}>
                    <div className="absolute top-4 right-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <i className="fas fa-mosque text-2xl"></i>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h2 className="font-amiri text-2xl font-bold mb-2">شهادة إتمام</h2>
                      <div className="w-16 h-1 bg-white/50 mx-auto mb-4"></div>
                      <p className="text-lg mb-4">يشهد بأن الطالب</p>
                      <h3 className="font-amiri text-xl font-bold mb-4">
                        {getUserDisplayName()}
                      </h3>
                      <p className="mb-2">قد أتم بنجاح دراسة مادة</p>
                      <h4 className="font-amiri text-lg font-bold mb-4">
                        {certificate.course.title}
                      </h4>
                      
                      <div className="flex justify-between items-end mt-8">
                        <div className="text-sm">
                          <p>{formatDate(certificate.issuedAt)}</p>
                          <p className={`font-bold ${getGradeColor(Number(certificate.grade))}`}>
                            الدرجة: {Math.round(Number(certificate.grade))}%
                          </p>
                        </div>
                        <div className="text-center">
                          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                            <i className="fas fa-award text-2xl"></i>
                          </div>
                          <div className="text-xs">ختم الجامعة</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{certificate.course.title}</h4>
                        <p className="text-sm text-gray-600">
                          رقم الشهادة: {certificate.certificateNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          تاريخ الحصول: {formatDate(certificate.issuedAt)}
                        </p>
                        <p className="text-sm text-gray-600">
                          الأستاذ: {certificate.course.instructor}
                        </p>
                      </div>
                      <div className="text-center">
                        <div className={`text-2xl font-bold mb-1 ${getGradeColor(Number(certificate.grade))}`}>
                          {Math.round(Number(certificate.grade))}%
                        </div>
                        <CertificateGenerator
                          studentName={getUserDisplayName()}
                          courseName={certificate.course.title}
                          grade={Math.round(Number(certificate.grade))}
                          date={formatDate(certificate.issuedAt)}
                          certificateNumber={certificate.certificateNumber}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Achievement Section */}
            <Card className="mt-8">
              <CardContent className="p-8">
                <div className="text-center">
                  <i className="fas fa-trophy text-4xl text-[hsl(45,76%,58%)] mb-4"></i>
                  <h2 className="text-2xl font-amiri font-bold text-[hsl(158,40%,34%)] mb-4">
                    إنجازاتك الأكاديمية
                  </h2>
                  <p className="text-gray-600 mb-6">
                    تهانينا على حصولك على {certificates.length} شهادة في علوم الحديث الشريف
                  </p>
                  
                  <div className="grid md:grid-cols-3 gap-6 mt-8">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-graduation-cap text-2xl text-green-600"></i>
                      </div>
                      <h3 className="font-semibold mb-1">طالب متميز</h3>
                      <p className="text-sm text-gray-600">
                        حصلت على معدل عالي في دراستك
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-book-open text-2xl text-blue-600"></i>
                      </div>
                      <h3 className="font-semibold mb-1">عاشق للعلم</h3>
                      <p className="text-sm text-gray-600">
                        أكملت عدة مواد في علوم الحديث
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <i className="fas fa-medal text-2xl text-purple-600"></i>
                      </div>
                      <h3 className="font-semibold mb-1">محدث مؤهل</h3>
                      <p className="text-sm text-gray-600">
                        تأهلت في علوم الحديث النبوي الشريف
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
