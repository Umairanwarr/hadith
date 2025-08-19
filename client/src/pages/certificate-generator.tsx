import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Certificate {
  id: number;
  userId: string;
  courseId: number;
  certificateNumber: string;
  studentName: string;
  grade: string;
  specialization: string;
  honors: string;
  completionDate: string;
  diplomaTemplateId?: number;
  issuedAt: string;
  course: {
    id: number;
    title: string;
    description: string;
    level: string;
  };
}

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
}

export function CertificateGeneratorPage() {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<DiplomaTemplate | null>(null);

  // Fetch user certificates
  const { data: certificates = [], isLoading: certificatesLoading } = useQuery({
    queryKey: ["/my-certificates"],
  });

  // Fetch diploma templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["/diploma-templates"],
  });

  // Generate Certificate Image
  const generateCertificateImage = (certificate: Certificate, template: DiplomaTemplate) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (A3 landscape ratio for more space)
    canvas.width = 1800;
    canvas.height = 1200;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = template.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = template.borderColor;
    ctx.lineWidth = 15;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);
    
    // Inner border
    ctx.strokeStyle = template.borderColor;
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Text color
    ctx.fillStyle = template.textColor;
    ctx.textAlign = "center";

    // Institution name
    ctx.font = "bold 72px Arial";
    ctx.fillText(template.institutionName, canvas.width / 2, 180);

    // Certificate title
    ctx.font = "48px Arial";
    ctx.fillText(`شهادة ${certificate.course.title}`, canvas.width / 2, 270);
    ctx.fillText(`المستوى: ${certificate.course.level}`, canvas.width / 2, 330);

    // Main text
    ctx.font = "36px Arial";
    ctx.fillText("تشهد هذه الجامعة بأن الطالب/الطالبة:", canvas.width / 2, 450);

    // Student name
    ctx.font = "bold 54px Arial";
    ctx.fillText(certificate.studentName, canvas.width / 2, 570);

    // Course completion text
    ctx.font = "36px Arial";
    ctx.fillText(`قد أكمل بنجاح جميع متطلبات ${certificate.specialization}`, canvas.width / 2, 660);

    // Grade and honors
    if (certificate.honors) {
      ctx.fillText(`بتقدير: ${certificate.honors}`, canvas.width / 2, 720);
    }
    ctx.fillText(`الدرجة: ${certificate.grade}%`, canvas.width / 2, 780);

    // Completion date
    const completionDate = new Date(certificate.completionDate);
    ctx.font = "30px Arial";
    ctx.fillText(
      `تاريخ الإنجاز: ${format(completionDate, "dd MMMM yyyy", { locale: ar })}`, 
      canvas.width / 2, 
      840
    );

    // Footer information
    ctx.textAlign = "left";
    ctx.fillText(`رقم الشهادة: ${certificate.certificateNumber}`, 80, canvas.height - 80);
    
    ctx.textAlign = "right";
    const issuedDate = new Date(certificate.issuedAt);
    ctx.fillText(
      `تاريخ الإصدار: ${format(issuedDate, "dd/MM/yyyy", { locale: ar })}`, 
      canvas.width - 80, 
      canvas.height - 80
    );

    // University seal
    if (template.sealUrl) {
      const sealImage = new Image();
      sealImage.onload = () => {
        ctx.drawImage(sealImage, canvas.width - 200, canvas.height - 200, 100, 100);
      };
      sealImage.src = template.sealUrl;
    } else {
      // Fallback placeholder seal
      ctx.textAlign = "center";
      ctx.font = "16px Arial";
      ctx.fillText("ختم الجامعة", canvas.width - 150, canvas.height - 120);
      ctx.strokeStyle = template.borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(canvas.width - 150, canvas.height - 150, 50, 0, 2 * Math.PI);
      ctx.stroke();
    }
  };

  const downloadCertificate = async () => {
    if (!selectedCertificate || !canvasRef.current) return;

    const canvas = canvasRef.current;
    
    try {
      // First try to download as PDF if we have certificate ID
      if (selectedCertificate.id) {
        // Get available templates first
        let validTemplateId = selectedCertificate.diplomaTemplateId;
        if (!validTemplateId) {
          try {
            const templatesResponse = await fetch('/api/diploma-templates');
            if (templatesResponse.ok) {
              const templates = await templatesResponse.json();
              if (templates && templates.length > 0) {
                validTemplateId = templates[0].id; // Use first available template
              } else {
                // Fall back to PNG download
                const link = document.createElement('a');
                link.download = `certificate_${selectedCertificate.certificateNumber}.png`;
                link.href = canvas.toDataURL();
                link.click();
                toast({
                  title: "تم تحميل الشهادة",
                  description: "تم حفظ الشهادة بصيغة PNG بنجاح",
                });
                return;
              }
            } else {
              throw new Error('Failed to fetch templates');
            }
          } catch (error) {
            // Fall back to PNG download
            const link = document.createElement('a');
            link.download = `certificate_${selectedCertificate.certificateNumber}.png`;
            link.href = canvas.toDataURL();
            link.click();
            toast({
              title: "تم تحميل الشهادة",
              description: "تم حفظ الشهادة بصيغة PNG بنجاح",
            });
            return;
          }
        }
        // Get canvas data
        const canvasData = canvas.toDataURL('image/png');
        
        // Generate certificate on server
        const response = await fetch('/api/certificates/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          },
          body: JSON.stringify({
            certificateId: selectedCertificate.id,
            templateId: validTemplateId,
            canvasData,
            certificateData: {
              studentName: selectedCertificate.studentName,
              courseName: selectedCertificate.course.title,
              grade: selectedCertificate.grade,
              date: format(new Date(selectedCertificate.issuedAt), "dd/MM/yyyy"),
              certificateNumber: selectedCertificate.certificateNumber,
              generatedAt: new Date().toISOString()
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          
          // Download as PDF
          if (result.certificateImage && result.certificateImage.id) {
            const downloadResponse = await fetch(`/api/certificates/${selectedCertificate.id}/download/${result.certificateImage.id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              }
            });

            if (downloadResponse.ok) {
              const pdfBlob = await downloadResponse.blob();
              const downloadUrl = window.URL.createObjectURL(pdfBlob);
              const downloadLink = document.createElement('a');
              downloadLink.href = downloadUrl;
              downloadLink.download = `certificate_${selectedCertificate.certificateNumber}.pdf`;
              downloadLink.click();
              window.URL.revokeObjectURL(downloadUrl);

              toast({
                title: "تم تحميل الشهادة",
                description: "تم حفظ الشهادة بصيغة PDF بنجاح",
              });
              return;
            }
          }
        }
      }
    } catch (error) {
      // Silently handle error
    }

    // Fallback to PNG download
    const link = document.createElement('a');
    link.download = `certificate_${selectedCertificate.certificateNumber}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "تم تحميل الشهادة",
      description: "تم حفظ الشهادة بصيغة PNG بنجاح",
    });
  };

  const printCertificate = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    const windowContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>طباعة الشهادة</title>
          <style>
            body { 
              margin: 0; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
            }
            img { 
              max-width: 100%; 
              height: auto; 
            }
            @media print {
              body { margin: 0; }
              img { width: 100%; height: auto; }
            }
          </style>
        </head>
        <body>
          <img src="${dataUrl}" alt="شهادة" />
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(windowContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  // Generate certificate when selection changes
  useEffect(() => {
    if (selectedCertificate && selectedTemplate) {
      setTimeout(() => {
        generateCertificateImage(selectedCertificate, selectedTemplate);
      }, 100);
    }
  }, [selectedCertificate, selectedTemplate]);

  // Auto-select first certificate and active template
  useEffect(() => {
    if (certificates.length > 0 && !selectedCertificate) {
      setSelectedCertificate(certificates[0]);
    }
  }, [certificates, selectedCertificate]);

  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      const activeTemplate = templates.find((t: DiplomaTemplate) => t.isActive);
      setSelectedTemplate(activeTemplate || templates[0]);
    }
  }, [templates, selectedTemplate]);

  const getHonorsColor = (honors: string) => {
    if (honors.includes('امتياز')) return 'bg-yellow-100 text-yellow-800';
    if (honors.includes('جيد جداً')) return 'bg-green-100 text-green-800';
    if (honors.includes('جيد')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 pt-24" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-l from-green-600 to-green-700 rounded-2xl text-white p-6 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-medal text-2xl"></i>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-amiri font-bold">
                  شهاداتي ومنجزاتي
                </h1>
                <p className="text-green-100 mt-2">
                  عرض وتحميل وطباعة الشهادات الأكاديمية
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Certificates List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>شهاداتي ({certificates.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {certificatesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <i className="fas fa-spinner fa-spin text-2xl text-gray-400 ml-3"></i>
                    <span>جاري التحميل...</span>
                  </div>
                ) : certificates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-certificate text-4xl mb-4 text-gray-300"></i>
                    <p className="text-lg">لا توجد شهادات متاحة</p>
                    <p className="text-sm mt-2">أكمل المقررات واجتز الامتحانات للحصول على الشهادات</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {certificates.map((certificate: Certificate) => (
                      <div
                        key={certificate.id}
                        onClick={() => setSelectedCertificate(certificate)}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedCertificate?.id === certificate.id
                            ? 'bg-green-50 border-2 border-green-300'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <h3 className="font-semibold text-sm">{certificate.course.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">{certificate.studentName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge className={getHonorsColor(certificate.honors || '')}>
                            {certificate.honors || `${certificate.grade}%`}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {format(new Date(certificate.issuedAt), "dd/MM/yyyy")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Templates Selection */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>قالب الشهادة</CardTitle>
              </CardHeader>
              <CardContent>
                {templatesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <i className="fas fa-spinner fa-spin text-gray-400 ml-2"></i>
                    <span className="text-sm">جاري التحميل...</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {templates
                      .filter((template: DiplomaTemplate) => template.isActive)
                      .map((template: DiplomaTemplate) => (
                      <div
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-3 rounded-lg cursor-pointer text-sm transition-colors ${
                          selectedTemplate?.id === template.id
                            ? 'bg-blue-50 border-2 border-blue-300'
                            : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        <div className="font-semibold">{template.title}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {template.level} - {template.templateStyle === 'classic' ? 'كلاسيكي' : 
                           template.templateStyle === 'modern' ? 'عصري' : 'أنيق'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Certificate Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>معاينة الشهادة</span>
                  {selectedCertificate && (
                    <div className="flex gap-2">
                      <Button onClick={downloadCertificate} size="sm">
                        <i className="fas fa-download ml-2"></i>
                        تحميل
                      </Button>
                      <Button onClick={printCertificate} variant="outline" size="sm">
                        <i className="fas fa-print ml-2"></i>
                        طباعة
                      </Button>
                    </div>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedCertificate ? (
                  <div className="flex justify-center">
                    <canvas
                      ref={canvasRef}
                      className="border border-gray-300 rounded-lg shadow-lg max-w-full h-auto"
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        width: '800px',
                        display: 'block'
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <i className="fas fa-certificate text-6xl mb-4 text-gray-300"></i>
                    <p className="text-lg">اختر شهادة لعرضها</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Certificate Details */}
            {selectedCertificate && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>تفاصيل الشهادة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>رقم الشهادة:</strong>
                      <p>{selectedCertificate.certificateNumber}</p>
                    </div>
                    <div>
                      <strong>اسم الطالب:</strong>
                      <p>{selectedCertificate.studentName}</p>
                    </div>
                    <div>
                      <strong>المقرر:</strong>
                      <p>{selectedCertificate.course.title}</p>
                    </div>
                    <div>
                      <strong>التخصص:</strong>
                      <p>{selectedCertificate.specialization}</p>
                    </div>
                    <div>
                      <strong>الدرجة:</strong>
                      <p>{selectedCertificate.grade}%</p>
                    </div>
                    <div>
                      <strong>التقدير:</strong>
                      <p>{selectedCertificate.honors || 'غير محدد'}</p>
                    </div>
                    <div>
                      <strong>تاريخ الإنجاز:</strong>
                      <p>{format(new Date(selectedCertificate.completionDate), "dd MMMM yyyy", { locale: ar })}</p>
                    </div>
                    <div>
                      <strong>تاريخ الإصدار:</strong>
                      <p>{format(new Date(selectedCertificate.issuedAt), "dd MMMM yyyy", { locale: ar })}</p>
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