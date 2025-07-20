import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  label: string;
  accept?: string;
}

export function ImageUpload({ onImageUpload, currentImage, label, accept = "image/*" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage || "");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "نوع الملف غير مدعوم",
        description: "يرجى اختيار ملف صورة صحيح",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "حجم الملف كبير",
        description: "يرجى اختيار صورة أصغر من 5 ميجابايت",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      // Upload to server
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      const imageUrl = data.url;

      // Update preview and notify parent
      setPreviewUrl(imageUrl);
      onImageUpload(imageUrl);

      toast({
        title: "تم رفع الصورة",
        description: "تم رفع الصورة بنجاح",
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "خطأ في رفع الصورة",
        description: "حدث خطأ أثناء رفع الصورة",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlInput = (url: string) => {
    setPreviewUrl(url);
    onImageUpload(url);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>
      
      {/* Preview */}
      {previewUrl && (
        <div className="relative w-32 h-32 border-2 border-gray-200 rounded-lg overflow-hidden">
          <img 
            src={previewUrl} 
            alt={label}
            className="w-full h-full object-contain"
            onError={() => setPreviewUrl("")}
          />
          <button
            onClick={() => {
              setPreviewUrl("");
              onImageUpload("");
            }}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Upload Options */}
      <div className="flex flex-col gap-2">
        {/* File Upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <i className="fas fa-spinner fa-spin ml-2"></i>
                جاري الرفع...
              </>
            ) : (
              <>
                <i className="fas fa-upload ml-2"></i>
                رفع صورة من الجهاز
              </>
            )}
          </Button>
        </div>

        {/* URL Input */}
        <div>
          <input
            type="url"
            placeholder="أو أدخل رابط الصورة"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            value={previewUrl}
            onChange={(e) => handleUrlInput(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}