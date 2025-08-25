import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useRef, useEffect, useState } from "react";
import logoPath from "@assets/logo (1)_1752944342261.png";

interface CertificateProps {
  studentName: string;
  courseName: string;
  grade: number;
  date: string;
  certificateNumber: string;
  certificateId?: number;
  templateId?: number;
}

interface DiplomaTemplate {
  id: number;
  title: string;
  level: string;
  courseIds?: string[];
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

export default function CertificateGenerator({ 
  studentName, 
  courseName, 
  grade, 
  date, 
  certificateNumber,
  certificateId,
  templateId
}: CertificateProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [templateData, setTemplateData] = useState<DiplomaTemplate | null>(null);

  // Fetch diploma template data
  const { data: template } = useQuery<DiplomaTemplate>({
    queryKey: [`/diploma-templates/${templateId}`],
    enabled: !!templateId && templateId !== 1,
    retry: 2,
  });

  // Fetch all templates as fallback
  const { data: allTemplates } = useQuery<DiplomaTemplate[]>({
    queryKey: ["/diploma-templates"],
    retry: 2,
  });

  useEffect(() => {
    if (template) {
      setTemplateData(template);
    } else if (allTemplates && allTemplates.length > 0) {
      // Use the first active template as fallback
      const activeTemplate = allTemplates.find(t => t.isActive) || allTemplates[0];
      setTemplateData(activeTemplate);
    }
  }, [template, allTemplates]);

  const generateCertificateWithTemplate = (template: DiplomaTemplate) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1800; // Increased size for better quality
    canvas.height = 1200;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = template.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add decorative pattern based on template style
    if (template.templateStyle === 'elegant') {
      // Add subtle pattern for elegant style
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = template.borderColor || '#d4af37';
      for (let x = 0; x < canvas.width; x += 60) {
        for (let y = 0; y < canvas.height; y += 60) {
          ctx.beginPath();
          ctx.arc(x + 30, y + 30, 3, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    }

    // Border
    ctx.strokeStyle = template.borderColor || '#d4af37';
    ctx.lineWidth = 12;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Inner border
    ctx.strokeStyle = template.textColor || '#000000';
    ctx.lineWidth = 3;
    ctx.strokeRect(90, 90, canvas.width - 180, canvas.height - 180);

    // Set text color
    ctx.fillStyle = template.textColor || '#000000';
    ctx.textAlign = 'center';

    // Institution logo (if available) - Handle with CORS
    if (template.logoUrl) {
      try {
        const logo = new Image();
        logo.crossOrigin = 'anonymous'; // Enable CORS
        logo.onload = () => {
          try {
            ctx.drawImage(logo, canvas.width / 2 - 40, 120, 80, 80);
          } catch (error) {
            console.warn('Could not draw logo image:', error);
            // Draw placeholder logo
            ctx.fillStyle = template.borderColor || '#d4af37';
            ctx.fillRect(canvas.width / 2 - 40, 120, 80, 80);
            ctx.fillStyle = template.textColor || '#000000';
            ctx.font = 'bold 12px serif';
            ctx.textAlign = 'center';
            ctx.fillText('LOGO', canvas.width / 2, 170);
          }
        };
        logo.onerror = () => {
          console.warn('Could not load logo image');
          // Draw placeholder logo
          ctx.fillStyle = template.borderColor || '#d4af37';
          ctx.fillRect(canvas.width / 2 - 40, 120, 80, 80);
          ctx.fillStyle = template.textColor || '#000000';
          ctx.font = 'bold 12px serif';
          ctx.textAlign = 'center';
          ctx.fillText('LOGO', canvas.width / 2, 170);
        };
        logo.src = template.logoUrl;
      } catch (error) {
        console.warn('Error handling logo:', error);
      }
    }

    // Institution name
    ctx.font = 'bold 36px serif';
    ctx.fillText(template.institutionName, canvas.width / 2, template.logoUrl ? 240 : 180);

    // Certificate title
    ctx.font = 'bold 54px serif';
    const titleY = template.logoUrl ? 320 : 260;
    ctx.fillText(`شهادة ${template.title}`, canvas.width / 2, titleY);

    // Decorative line
    ctx.fillStyle = template.borderColor || '#d4af37';
    ctx.fillRect(canvas.width / 2 - 120, titleY + 20, 240, 6);

    // Main text
    ctx.fillStyle = template.textColor || '#000000';
    ctx.font = '42px serif';
    const mainTextY = titleY + 80;
    ctx.fillText('يشهد بأن الطالب', canvas.width / 2, mainTextY);

    // Student name
    ctx.font = 'bold 54px serif';
    ctx.fillText(studentName, canvas.width / 2, mainTextY + 80);

    // Course completion text
    ctx.font = '42px serif';
    ctx.fillText('قد أتم بنجاح دراسة مادة', canvas.width / 2, mainTextY + 160);

    // Course name
    ctx.font = 'bold 48px serif';
    ctx.fillText(courseName, canvas.width / 2, mainTextY + 240);

    // Grade and honors
    ctx.font = '36px serif';
    let honors = '';
    if (grade >= 95) honors = 'بتقدير امتياز مع مرتبة الشرف';
    else if (grade >= 85) honors = 'بتقدير امتياز';
    else if (grade >= 75) honors = 'بتقدير جيد جداً';
    else if (grade >= 70) honors = 'بتقدير جيد';
    
    if (honors) {
      ctx.fillText(honors, canvas.width / 2, mainTextY + 320);
    }

    ctx.fillText(`الدرجة: ${grade}%`, canvas.width / 2, mainTextY + (honors ? 380 : 320));

    // Date and certificate number
    ctx.font = '30px serif';
    ctx.textAlign = 'left';
    const bottomY = canvas.height - 120;
    ctx.fillText(`التاريخ: ${date}`, 120, bottomY);
    ctx.fillText(`رقم الشهادة: ${certificateNumber}`, 120, bottomY + 40);

    // University seal (if available) - Handle with CORS
    if (template.sealUrl) {
      try {
        const seal = new Image();
        seal.crossOrigin = 'anonymous'; // Enable CORS
        seal.onload = () => {
          try {
            ctx.drawImage(seal, canvas.width - 200, bottomY - 80, 100, 100);
          } catch (error) {
            console.warn('Could not draw seal image:', error);
            // Draw placeholder seal
            ctx.fillStyle = template.borderColor || '#d4af37';
            ctx.beginPath();
            ctx.arc(canvas.width - 150, bottomY - 30, 50, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = template.textColor || '#000000';
            ctx.font = 'bold 18px serif';
            ctx.textAlign = 'center';
            ctx.fillText('ختم', canvas.width - 150, bottomY - 35);
            ctx.fillText('الجامعة', canvas.width - 150, bottomY - 15);
          }
        };
        seal.onerror = () => {
          console.warn('Could not load seal image');
          // Draw placeholder seal
          ctx.fillStyle = template.borderColor || '#d4af37';
          ctx.beginPath();
          ctx.arc(canvas.width - 150, bottomY - 30, 50, 0, 2 * Math.PI);
          ctx.fill();
          
          ctx.fillStyle = template.textColor || '#000000';
          ctx.font = 'bold 18px serif';
          ctx.textAlign = 'center';
          ctx.fillText('ختم', canvas.width - 150, bottomY - 35);
          ctx.fillText('الجامعة', canvas.width - 150, bottomY - 15);
        };
        seal.src = template.sealUrl;
      } catch (error) {
        console.warn('Error handling seal:', error);
      }
    } else {
      // Draw placeholder seal
      ctx.fillStyle = template.borderColor || '#d4af37';
      ctx.beginPath();
      ctx.arc(canvas.width - 150, bottomY - 30, 50, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = template.textColor || '#000000';
      ctx.font = 'bold 18px serif';
      ctx.textAlign = 'center';
      ctx.fillText('ختم', canvas.width - 150, bottomY - 35);
      ctx.fillText('الجامعة', canvas.width - 150, bottomY - 15);
    }
  };

  // Function to create a clean certificate without external images
  const generateCleanCertificate = (template: DiplomaTemplate) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log('Generating clean certificate without external images');

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set background
    ctx.fillStyle = template.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = template.borderColor || '#d4af37';
    ctx.lineWidth = 8;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Inner border
    ctx.strokeStyle = template.borderColor || '#d4af37';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Draw placeholder logo instead of external image
    ctx.fillStyle = template.borderColor || '#d4af37';
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 120, 40, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = template.textColor || '#000000';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('🎓', canvas.width / 2, 130);

    // Institution name
    ctx.fillStyle = template.textColor || '#000000';
    ctx.font = 'bold 36px serif';
    ctx.textAlign = 'center';
    ctx.fillText(template.institutionName, canvas.width / 2, 180);

    // Title
    ctx.font = 'bold 48px serif';
    ctx.fillText(`شهادة ${template.title}`, canvas.width / 2, 250);

    // Decorative line
    ctx.fillStyle = template.borderColor || '#d4af37';
    ctx.fillRect(canvas.width / 2 - 120, 270, 240, 6);

    // Student name section
    ctx.fillStyle = template.textColor || '#000000';
    ctx.font = '36px serif';
    ctx.fillText('يشهد بأن الطالب', canvas.width / 2, 330);

    // Student name
    ctx.font = 'bold 48px serif';
    ctx.fillText(studentName, canvas.width / 2, 390);

    // Completion text
    ctx.font = '36px serif';
    ctx.fillText('قد أتم بنجاح دراسة مادة', canvas.width / 2, 450);

    // Course name
    ctx.font = 'bold 42px serif';
    ctx.fillText(courseName, canvas.width / 2, 510);

    // Grade if provided
    if (grade) {
      ctx.font = '32px serif';
      let honors = '';
      if (grade >= 95) honors = 'بتقدير امتياز مع مرتبة الشرف';
      else if (grade >= 85) honors = 'بتقدير امتياز';
      else if (grade >= 75) honors = 'بتقدير جيد جداً';
      else if (grade >= 70) honors = 'بتقدير جيد';
      
      if (honors) {
        ctx.fillText(honors, canvas.width / 2, 570);
      }
      
      ctx.fillText(`الدرجة: ${grade}%`, canvas.width / 2, honors ? 620 : 570);
    }

    // Date and certificate number
    const bottomY = canvas.height - 120;
    ctx.font = '24px serif';
    ctx.textAlign = 'left';
    ctx.fillText(`التاريخ: ${date}`, 80, bottomY);
    ctx.textAlign = 'right';
    ctx.fillText(`رقم الشهادة: ${certificateNumber}`, canvas.width - 80, bottomY);

    // Draw placeholder seal
    ctx.fillStyle = template.borderColor || '#d4af37';
    ctx.beginPath();
    ctx.arc(canvas.width - 150, bottomY - 30, 50, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = template.textColor || '#000000';
    ctx.font = 'bold 18px serif';
    ctx.textAlign = 'center';
    ctx.fillText('ختم', canvas.width - 150, bottomY - 35);
    ctx.fillText('الجامعة', canvas.width - 150, bottomY - 15);
  };

  const downloadCertificate = () => {
    console.log('Download certificate clicked', { templateData, studentName, courseName });
    
    if (!templateData) {
      console.error('No template data available for download');
      alert('غير قادر على تحميل الشهادة. لا يوجد قالب متاح.');
      return;
    }

    try {
      generateCertificateWithTemplate(templateData);
      
      // Small delay to ensure canvas is rendered
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
          console.error('Canvas not found');
          alert('خطأ في إنشاء الشهادة');
          return;
        }

        try {
          // Try to export the canvas with external images
          const link = document.createElement('a');
          link.download = `certificate-${certificateNumber}.png`;
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();
          
          console.log('Certificate download initiated:', link.download);
        } catch (taintError) {
          console.warn('Canvas is tainted, creating clean version:', taintError);
          
          // Create a clean certificate without external images
          generateCleanCertificate(templateData);
          
          // Small delay for clean certificate to render
          setTimeout(() => {
            try {
              const link = document.createElement('a');
              link.download = `certificate-${certificateNumber}.png`;
              link.href = canvas.toDataURL('image/png', 1.0);
              link.click();
              
              console.log('Clean certificate download initiated:', link.download);
            } catch (cleanError) {
              console.error('Failed to export clean certificate:', cleanError);
              alert('خطأ في تحميل الشهادة. يرجى المحاولة مرة أخرى.');
            }
          }, 100);
        }
      }, 100);
    } catch (error) {
      console.error('Error in downloadCertificate:', error);
      alert('خطأ في تحميل الشهادة');
    }
  };

  // Function to generate certificate on server and download as PDF
  const generateCertificateOnServer = async () => {
    console.log('Generate certificate on server clicked', { certificateId, templateData });
    
    const canvas = canvasRef.current;
    if (!canvas || !certificateId) {
      console.error('Canvas or certificateId not available', { canvas: !!canvas, certificateId });
      alert('غير قادر على إنشاء الشهادة على الخادم');
      return;
    }

    if (!templateData) {
      console.error('No template data available for server generation');
      alert('لا يوجد قالب للشهادة. سيتم استخدام التحميل العادي.');
      downloadCertificate();
      return;
    }

    try {
      // Generate certificate with template
      generateCertificateWithTemplate(templateData);

      // Small delay to ensure canvas is rendered
      setTimeout(async () => {
        try {
          // Get API base URL
          const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
          console.log('Using API base URL:', API_BASE_URL);

          // Test server connectivity first
          try {
            const healthCheck = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });
            console.log('Server health check:', healthCheck.status);
          } catch (healthError) {
            console.warn('Server health check failed:', healthError);
            throw new Error('Cannot connect to server. Please make sure the server is running on port 5000.');
          }

          // Get canvas data as base64 with taint error handling
          let canvasData: string;
          try {
            canvasData = canvas.toDataURL('image/png', 1.0);
            console.log('Canvas data generated successfully, length:', canvasData.length);
          } catch (taintError) {
            console.warn('Canvas is tainted, generating clean version for server:', taintError);
            
            // Generate clean certificate without external images
            generateCleanCertificate(templateData);
            
            // Wait for clean certificate to render
            await new Promise(resolve => setTimeout(resolve, 100));
            
            try {
              canvasData = canvas.toDataURL('image/png', 1.0);
              console.log('Clean canvas data generated, length:', canvasData.length);
            } catch (cleanError) {
              console.error('Failed to generate clean canvas data:', cleanError);
              throw new Error('Unable to generate certificate image due to security restrictions');
            }
          }

          // Prepare certificate data
          const certificateData = {
            studentName,
            courseName,
            grade,
            date,
            certificateNumber,
            generatedAt: new Date().toISOString()
          };

          console.log('Sending certificate data to server:', certificateData);

          // Get auth token
          const authToken = localStorage.getItem('authToken') || localStorage.getItem('token');
          console.log('Auth token available:', !!authToken);
          
          if (!authToken) {
            throw new Error('No authentication token found. Please log in again.');
          }

          // Send to backend to generate and save certificate image
          const response = await fetch(`${API_BASE_URL}/certificates/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
              certificateId,
              templateId: templateData.id,
              canvasData,
              certificateData
            })
          });

          console.log('Server response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Server response error:', errorText);
            throw new Error(`Server error: ${response.status} - ${errorText}`);
          }

          const result = await response.json();
          console.log('Server generation result:', result);

          // Download as PDF if available, otherwise fallback to PNG
          if (result.certificateImage && result.certificateImage.id) {
            const downloadResponse = await fetch(`${API_BASE_URL}/certificates/${certificateId}/download/${result.certificateImage.id}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${authToken}`
              }
            });

            console.log('Download response status:', downloadResponse.status);

            if (downloadResponse.ok) {
              const blob = await downloadResponse.blob();
              console.log('Download blob size:', blob.size);
              
              // Create download link
              const downloadUrl = window.URL.createObjectURL(blob);
              const downloadLink = document.createElement('a');
              downloadLink.href = downloadUrl;
              downloadLink.download = `certificate-${certificateNumber}.pdf`;
              downloadLink.click();
              
              // Cleanup
              window.URL.revokeObjectURL(downloadUrl);
              console.log('PDF download completed');
            } else {
              console.warn('PDF download failed, falling back to PNG');
              downloadCertificate();
            }
          } else {
            console.warn('No certificate image in result, falling back to PNG');
            downloadCertificate();
          }
        } catch (error) {
          console.error('Error in server generation:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          alert(`خطأ في إنشاء الشهادة على الخادم: ${errorMessage}`);
          // Fallback to PNG download
          downloadCertificate();
        }
      }, 200);
    } catch (error) {
      console.error('Error in generateCertificateOnServer:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert(`خطأ في تحميل الشهادة: ${errorMessage}`);
    }
  };

  // Effect to generate certificate when template data is available
  useEffect(() => {
    if (templateData) {
      // Generate certificate preview
      generateCertificateWithTemplate(templateData);
    }
  }, [templateData, studentName, courseName, grade, date, certificateNumber]);

  return (
    <div className="space-y-4">
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }} 
        width={1800} 
        height={1200}
      />
      <div className="flex gap-2">
        <Button onClick={generateCertificateOnServer} className="btn-primary">
          <i className="fas fa-file-pdf ml-1"></i>
          تحميل الشهادة
        </Button>
        <Button onClick={downloadCertificate} variant="outline">
          <i className="fas fa-download ml-1"></i>
          حفظ كصورة
        </Button>
      </div>
      {/* Debug information */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-2">
          Template ID: {templateId || 'None'} | Certificate ID: {certificateId || 'None'}
          {templateData ? ` | Template: ${templateData.title}` : ' | No template data'}
        </div>
      )}
    </div>
  );
}
