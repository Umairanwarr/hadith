import { useState } from "react";

interface ImagePreviewProps {
  src?: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function ImagePreview({ src, alt, className = "", fallback }: ImagePreviewProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!src || imageError) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        {fallback || (
          <div className="text-center text-gray-400">
            <i className="fas fa-image text-2xl mb-2"></i>
            <p className="text-xs">{alt}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <i className="fas fa-spinner fa-spin text-gray-400"></i>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-contain ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setImageLoading(false)}
        onError={() => {
          setImageError(true);
          setImageLoading(false);
        }}
      />
    </div>
  );
}