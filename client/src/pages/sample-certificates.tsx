import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function SampleCertificatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Fetch diploma templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/diploma-templates"],
  });

  const sampleCertificate = {
    studentName: "أحمد محمد العلي",
    course: { title: "أصول علم الحديث", level: "تحضيري" },
    certificateNumber: "CERT-2024-001",
    grade: "95",
    honors: "امتياز مع مرتبة الشرف",
    specialization: "علوم الحديث الشريف",
    completionDate: new Date().toISOString(),
    issuedAt: new Date().toISOString(),
  };

  const CertificatePreview = ({ template }: { template: any }) => (
    <div 
      className="mx-auto p-6 border-4 rounded-lg shadow-xl bg-white print:shadow-none"
      style={{ 
        backgroundColor: template.backgroundColor || '#ffffff',
        color: template.textColor || '#2c3e50',
        borderColor: template.borderColor || '#d4af37',
        width: '800px',
        height: '600px',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <div className="text-center space-y-4 h-full flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="space-y-3">
            {template.logoUrl && (
              <img src={template.logoUrl} alt="شعار الجامعة" className="mx-auto h-20 w-20 object-contain" />
            )}
            <h1 className="text-3xl font-bold" style={{ color: template.textColor }}>
              {template.institutionName}
            </h1>
            <div className="border-t-2 border-b-2 py-4" style={{ borderColor: template.borderColor }}>
              <h2 className="text-2xl font-bold">شهادة {template.title}</h2>
              <p className="text-lg mt-2">المستوى: {template.level}</p>
            </div>
          </div>

          {/* Main Content */}
          <div className="space-y-6">
            <p className="text-xl">
              تشهد هذه الجامعة بأن الطالب/الطالبة:
            </p>
            
            <div className="text-3xl font-bold border-b-2 pb-3 mx-12" style={{ borderColor: template.borderColor }}>
              {sampleCertificate.studentName}
            </div>
            
            <p className="text-lg">
              قد أكمل بنجاح جميع متطلبات {sampleCertificate.specialization}
            </p>
            
            {sampleCertificate.honors && (
              <p className="text-xl font-semibold" style={{ color: template.borderColor }}>
                بتقدير: {sampleCertificate.honors}
              </p>
            )}
            
            <p className="text-lg">
              الدرجة: {sampleCertificate.grade}%
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-end text-sm">
          <div className="text-left">
            <p>تاريخ الإنجاز:</p>
            <p className="font-semibold">١٥ محرم ١٤٤٦هـ</p>
            <p className="mt-3">٢٠ يوليو ٢٠٢٥م</p>
            
            {template.sealUrl && (
              <div className="mt-4">
                <img src={template.sealUrl} alt="ختم الجامعة" className="w-20 h-20 object-contain" />
              </div>
            )}
          </div>
          
          <div className="text-right">
            <p>رقم الشهادة:</p>
            <p className="font-semibold">{sampleCertificate.certificateNumber}</p>
            
            <div className="mt-8 pt-4 border-t" style={{ borderColor: template.borderColor }}>
              <p className="text-xs">توقيع العميد</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-purple-600 to-purple-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-award text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                  نماذج الديبلومات الجامعية
                </h1>
                <p className="text-purple-100 mt-2">
                  عرض نماذج الشهادات والديبلومات المعتمدة
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Templates List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>قوالب الديبلومات</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <i className="fas fa-spinner fa-spin text-2xl text-gray-400 ml-3"></i>
                    <span>جاري التحميل...</span>
                  </div>
                ) : templates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-certificate text-4xl mb-4 text-gray-300"></i>
                    <p>لا توجد قوالب متاحة</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {templates
                      .filter((template: any) => template.isActive)
                      .map((template: any) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'bg-purple-50 border-2 border-purple-300'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <h3 className="font-semibold text-sm">{template.title}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">{template.level}</Badge>
                          <span className="text-xs text-gray-500">
                            {template.templateStyle === 'classic' ? 'كلاسيكي' : 
                             template.templateStyle === 'modern' ? 'عصري' : 'أنيق'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Certificate Preview */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>نموذج الديبلوم</span>
                  {selectedTemplate && (
                    <Button onClick={() => window.print()} variant="outline" size="sm">
                      <i className="fas fa-print ml-2"></i>
                      طباعة النموذج
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTemplate ? (
                  <div className="flex justify-center overflow-auto">
                    <CertificatePreview template={selectedTemplate} />
                  </div>
                ) : templates.length > 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <i className="fas fa-certificate text-6xl mb-4 text-gray-300"></i>
                    <p className="text-lg">اختر قالب ديبلوم لعرض النموذج</p>
                    <Button 
                      onClick={() => setSelectedTemplate(templates.find((t: any) => t.isActive))}
                      className="mt-4"
                      variant="outline"
                    >
                      عرض أول نموذج متاح
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <i className="fas fa-exclamation-triangle text-6xl mb-4 text-gray-300"></i>
                    <p className="text-lg">لا توجد قوالب ديبلومات متاحة</p>
                    <p className="text-sm mt-2">يرجى مراجعة المدير لإضافة قوالب جديدة</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template Details */}
            {selectedTemplate && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>تفاصيل القالب</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>اسم الديبلوم:</strong>
                      <p>{selectedTemplate.title}</p>
                    </div>
                    <div>
                      <strong>المستوى:</strong>
                      <p>{selectedTemplate.level}</p>
                    </div>
                    <div>
                      <strong>المؤسسة:</strong>
                      <p>{selectedTemplate.institutionName}</p>
                    </div>
                    <div>
                      <strong>نمط التصميم:</strong>
                      <p>
                        {selectedTemplate.templateStyle === 'classic' ? 'كلاسيكي' : 
                         selectedTemplate.templateStyle === 'modern' ? 'عصري' : 'أنيق'}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <strong>المتطلبات:</strong>
                      <p>{selectedTemplate.requirements}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}