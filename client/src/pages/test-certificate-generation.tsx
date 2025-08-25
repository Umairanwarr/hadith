import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import CertificateGenerator from "@/components/certificate-generator";

export function TestCertificateGenerationPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    studentName: "أحمد محمد الزهري",
    courseName: "أصول علم الحديث",
    grade: 95,
    date: "2024-01-15",
    certificateNumber: "CERT-2024-001",
    certificateId: 1,
    templateId: 1
  });

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const testServerGeneration = async () => {
    try {
      // Create a canvas element for testing
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw a simple test certificate
      ctx.fillStyle = '#2D6A4F';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('شهادة اختبار', canvas.width / 2, 200);
      ctx.fillText(formData.studentName, canvas.width / 2, 300);
      ctx.fillText(formData.courseName, canvas.width / 2, 400);
      ctx.fillText(`الدرجة: ${formData.grade}%`, canvas.width / 2, 500);

      // Get canvas data
      const canvasData = canvas.toDataURL('image/png');

      // Prepare certificate data
      const certificateData = {
        studentName: formData.studentName,
        courseName: formData.courseName,
        grade: formData.grade,
        date: formData.date,
        certificateNumber: formData.certificateNumber,
        generatedAt: new Date().toISOString()
      };

      // Send to backend
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/certificates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          certificateId: formData.certificateId,
          templateId: formData.templateId,
          canvasData,
          certificateData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate certificate');
      }

      const result = await response.json();
      
      toast({
        title: "تم إنشاء الشهادة بنجاح",
        description: `تم حفظ الشهادة في: ${result.downloadUrl}`,
      });

      console.log('Certificate generated:', result);

    } catch (error) {
      console.error('Error testing certificate generation:', error);
      toast({
        title: "خطأ في إنشاء الشهادة",
        description: error instanceof Error ? error.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8 mt-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">اختبار إنشاء الشهادات</h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Section */}
            <Card>
              <CardHeader>
                <CardTitle>بيانات الشهادة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="studentName">اسم الطالب</Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => handleInputChange('studentName', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="courseName">اسم المادة</Label>
                  <Input
                    id="courseName"
                    value={formData.courseName}
                    onChange={(e) => handleInputChange('courseName', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="grade">الدرجة</Label>
                  <Input
                    id="grade"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.grade}
                    onChange={(e) => handleInputChange('grade', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="date">التاريخ</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="certificateNumber">رقم الشهادة</Label>
                  <Input
                    id="certificateNumber"
                    value={formData.certificateNumber}
                    onChange={(e) => handleInputChange('certificateNumber', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="certificateId">معرف الشهادة (ID)</Label>
                  <Input
                    id="certificateId"
                    type="number"
                    value={formData.certificateId}
                    onChange={(e) => handleInputChange('certificateId', parseInt(e.target.value))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="templateId">معرف القالب (ID)</Label>
                  <Input
                    id="templateId"
                    type="number"
                    value={formData.templateId}
                    onChange={(e) => handleInputChange('templateId', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={testServerGeneration} className="flex-1">
                    اختبار إنشاء على الخادم
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Certificate Generator Component */}
            <Card>
              <CardHeader>
                <CardTitle>مكون إنشاء الشهادة</CardTitle>
              </CardHeader>
              <CardContent>
                <CertificateGenerator
                  studentName={formData.studentName}
                  courseName={formData.courseName}
                  grade={formData.grade}
                  date={formData.date}
                  certificateNumber={formData.certificateNumber}
                  certificateId={formData.certificateId}
                  templateId={formData.templateId}
                />
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>تعليمات الاختبار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>1.</strong> تأكد من أن لديك شهادة صالحة في قاعدة البيانات (استخدم معرف الشهادة الصحيح)</p>
                <p><strong>2.</strong> تأكد من وجود قالب ديبلوم صالح (استخدم معرف القالب الصحيح)</p>
                <p><strong>3.</strong> جرب "اختبار إنشاء على الخادم" لاختبار API</p>
                <p><strong>4.</strong> استخدم "إنشاء على الخادم" في مكون الشهادة لاختبار التكامل الكامل</p>
                <p><strong>5.</strong> تحقق من مجلد <code>/public/uploads/certificates/</code> للصور المحفوظة</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 