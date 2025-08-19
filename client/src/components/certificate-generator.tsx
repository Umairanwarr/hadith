import { useRef } from "react";
import { Button } from "@/components/ui/button";
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

  const downloadCertificate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = 1200;
    canvas.height = 800;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#2D6A4F');
    gradient.addColorStop(1, '#40916C');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Islamic pattern overlay
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#D4AF37';
    for (let x = 0; x < canvas.width; x += 50) {
      for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.arc(x + 12.5, y + 12.5, 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // Border
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

    // Inner border
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

    // Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 48px serif';
    ctx.textAlign = 'center';
    ctx.fillText('شهادة إتمام', canvas.width / 2, 150);

    // Decorative line
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(canvas.width / 2 - 80, 170, 160, 4);

    // Main text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '32px serif';
    ctx.fillText('يشهد بأن الطالب', canvas.width / 2, 250);

    // Student name
    ctx.font = 'bold 40px serif';
    ctx.fillText(studentName, canvas.width / 2, 320);

    // Course completion text
    ctx.font = '28px serif';
    ctx.fillText('قد أتم بنجاح دراسة مادة', canvas.width / 2, 380);

    // Course name
    ctx.font = 'bold 36px serif';
    ctx.fillText(courseName, canvas.width / 2, 450);

    // Grade and date
    ctx.font = '24px serif';
    ctx.textAlign = 'right';
    ctx.fillText(`التاريخ: ${date}`, canvas.width - 100, 580);
    ctx.fillText(`الدرجة: ${grade}%`, canvas.width - 100, 620);

    // University seal area (placeholder)
    ctx.fillStyle = '#D4AF37';
    ctx.beginPath();
    ctx.arc(canvas.width - 150, 680, 60, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px serif';
    ctx.textAlign = 'center';
    ctx.fillText('ختم', canvas.width - 150, 680);
    ctx.fillText('الجامعة', canvas.width - 150, 700);

    // Certificate number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px serif';
    ctx.textAlign = 'left';
    ctx.fillText(`رقم الشهادة: ${certificateNumber}`, 100, 750);

    // University name
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('جامعة الإمام الزُّهري لإعداد علماء الحديث المحدثين', canvas.width / 2, 720);

    // Download
    const link = document.createElement('a');
    link.download = `certificate-${certificateNumber}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  // Function to generate certificate on server and download as PDF
  const generateCertificateOnServer = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !certificateId) {
      console.error('Canvas or certificateId not available');
      return;
    }

    // Get available templates first
    let validTemplateId = templateId;
    if (!templateId || templateId === 1) {
      try {
        const templatesResponse = await fetch('/api/diploma-templates');
        if (templatesResponse.ok) {
          const templates = await templatesResponse.json();
          if (templates && templates.length > 0) {
            validTemplateId = templates[0].id; // Use first available template
          } else {
            // Fall back to PNG download
            downloadCertificate();
            return;
          }
        } else {
          // Fall back to PNG download
          downloadCertificate();
          return;
        }
      } catch (error) {
        // Fall back to PNG download
        downloadCertificate();
        return;
      }
    }

    try {
      // Generate the certificate on canvas first (but don't download)
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 1200;
      canvas.height = 800;

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, '#2D6A4F');
      gradient.addColorStop(1, '#40916C');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Islamic pattern overlay
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#D4AF37';
      for (let x = 0; x < canvas.width; x += 50) {
        for (let y = 0; y < canvas.height; y += 50) {
          ctx.beginPath();
          ctx.arc(x + 12.5, y + 12.5, 2, 0, 2 * Math.PI);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      // Border
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 8;
      ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);

      // Inner border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 48px serif';
      ctx.textAlign = 'center';
      ctx.fillText('شهادة إتمام', canvas.width / 2, 150);

      // Decorative line
      ctx.fillStyle = '#D4AF37';
      ctx.fillRect(canvas.width / 2 - 80, 170, 160, 4);

      // Main text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '32px serif';
      ctx.fillText('يشهد بأن الطالب', canvas.width / 2, 250);

      // Student name
      ctx.font = 'bold 40px serif';
      ctx.fillText(studentName, canvas.width / 2, 320);

      // Course completion text
      ctx.font = '28px serif';
      ctx.fillText('قد أتم بنجاح دراسة مادة', canvas.width / 2, 380);

      // Course name
      ctx.font = 'bold 36px serif';
      ctx.fillText(courseName, canvas.width / 2, 450);

      // Grade and date
      ctx.font = '24px serif';
      ctx.textAlign = 'right';
      ctx.fillText(`التاريخ: ${date}`, canvas.width - 100, 580);
      ctx.fillText(`الدرجة: ${grade}%`, canvas.width - 100, 620);

      // University seal area (placeholder)
      ctx.fillStyle = '#D4AF37';
      ctx.beginPath();
      ctx.arc(canvas.width - 150, 680, 60, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px serif';
      ctx.textAlign = 'center';
      ctx.fillText('ختم', canvas.width - 150, 680);
      ctx.fillText('الجامعة', canvas.width - 150, 700);

      // Certificate number
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px serif';
      ctx.textAlign = 'left';
      ctx.fillText(`رقم الشهادة: ${certificateNumber}`, 100, 750);

      // University name
      ctx.font = 'bold 20px serif';
      ctx.textAlign = 'center';
      ctx.fillText('جامعة الإمام الزُّهري لإعداد علماء الحديث المحدثين', canvas.width / 2, 720);

      // Get canvas data as base64
      const canvasData = canvas.toDataURL('image/png');

      // Prepare certificate data
      const certificateData = {
        studentName,
        courseName,
        grade,
        date,
        certificateNumber,
        generatedAt: new Date().toISOString()
      };

      // Send to backend to generate and save certificate image
      const response = await fetch('/api/certificates/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          certificateId,
          templateId: validTemplateId,
          canvasData,
          certificateData
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate certificate on server');
      }

      const result = await response.json();

      // Now download as PDF using the server's PDF conversion endpoint
      if (result.certificateImage && result.certificateImage.id) {
        const downloadResponse = await fetch(`/api/certificates/${certificateId}/download/${result.certificateImage.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });

        if (downloadResponse.ok) {
          const contentType = downloadResponse.headers.get('content-type');
          const blob = await downloadResponse.blob();
          
          // Create download link
          const downloadUrl = window.URL.createObjectURL(blob);
          const downloadLink = document.createElement('a');
          downloadLink.href = downloadUrl;
          
          // Set filename based on actual content type
          if (contentType?.includes('application/pdf')) {
            downloadLink.download = `certificate_${certificateNumber}.pdf`;
          } else {
            downloadLink.download = `certificate_${certificateNumber}.png`;
          }
          
          downloadLink.click();
          
          // Clean up
          window.URL.revokeObjectURL(downloadUrl);
        } else {
          throw new Error('Failed to download certificate');
        }
      }

    } catch (error) {
      // Silently fall back to PNG download
      downloadCertificate();
    }
  };

  return (
    <div className="space-y-4">
      <canvas 
        ref={canvasRef} 
        style={{ display: 'none' }} 
        width={1200} 
        height={800}
      />
      <div className="flex gap-2">
        {certificateId && (
          <Button onClick={generateCertificateOnServer} className="btn-primary">
            <i className="fas fa-file-pdf ml-1"></i>
            تحميل الشهادة
          </Button>
        )}
      </div>
    </div>
  );
}
