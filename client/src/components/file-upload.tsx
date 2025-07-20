import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in MB
  buttonText?: string;
  currentFileName?: string;
}

export function FileUpload({ 
  onFileSelect, 
  accept = ".pdf,.doc,.docx", 
  maxSize = 10,
  buttonText = "رفع ملف",
  currentFileName
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const validateAndSelectFile = (file: File) => {
    // Check file size (in MB)
    if (file.size > maxSize * 1024 * 1024) {
      alert(`حجم الملف يجب أن يكون أقل من ${maxSize} ميجابايت`);
      return;
    }

    // Check file type
    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isValidType = allowedTypes.some(type => 
      type === fileExtension || 
      file.type.startsWith(type.replace('*', ''))
    );

    if (!isValidType) {
      alert(`نوع الملف غير مدعوم. الأنواع المسموحة: ${accept}`);
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          isDragOver
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={openFileDialog}
      >
        <div className="space-y-2">
          <i className="fas fa-cloud-upload-alt text-3xl text-gray-400"></i>
          <div>
            <p className="text-sm text-gray-600">
              اسحب الملف هنا أو انقر للاختيار
            </p>
            <p className="text-xs text-gray-500">
              الأنواع المدعومة: {accept} | الحد الأقصى: {maxSize}MB
            </p>
          </div>
        </div>
      </div>

      {/* Current File Display */}
      {currentFileName && (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
          <div className="flex items-center space-x-reverse space-x-2">
            <i className="fas fa-file-alt text-blue-500"></i>
            <span className="text-sm text-gray-700">{currentFileName}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={openFileDialog}
          >
            <i className="fas fa-sync-alt ml-1"></i>
            استبدال
          </Button>
        </div>
      )}

      {/* Upload Button */}
      <Button 
        onClick={openFileDialog}
        variant="outline" 
        className="w-full"
      >
        <i className="fas fa-upload ml-2"></i>
        {buttonText}
      </Button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}