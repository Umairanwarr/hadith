import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface CourseImageGalleryProps {
  course: {
    id: string;
    title: string;
    thumbnailUrl?: string;
    imageUrl?: string;
  };
  className?: string;
}

export function CourseImageGallery({ course, className = "" }: CourseImageGalleryProps) {
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get all available images
  const images = [
    ...(course.thumbnailUrl ? [{ url: course.thumbnailUrl, type: 'thumbnail', label: 'الصورة المصغرة' }] : []),
    ...(course.imageUrl ? [{ url: course.imageUrl, type: 'additional', label: 'صورة إضافية' }] : [])
  ];

  if (images.length === 0) {
    return (
      <div className={`h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-800 ${className}`}>
        <div className="text-center">
          <i className="fas fa-book-open text-2xl mb-2"></i>
          <h4 className="font-amiri text-sm font-bold">{course.title}</h4>
        </div>
      </div>
    );
  }

  const handleImageClick = () => {
    if (images.length > 1) {
      setIsGalleryOpen(true);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const container = img.parentElement;
    if (container) {
      // Hide the failed image and show fallback
      img.style.display = 'none';
      const fallback = container.querySelector('.fallback-content') as HTMLElement;
      if (fallback) {
        fallback.style.display = 'flex';
      }
    }
  };

  return (
    <>
      {/* Main Image Display */}
      <div className={`relative overflow-hidden cursor-pointer group ${className}`} onClick={handleImageClick}>
        <img 
          src={images[0].url} 
          alt={course.title}
          className="w-full h-full object-contain bg-gray-50 transition-transform group-hover:scale-105"
          onError={handleImageError}
        />
        
        {/* Fallback content */}
        <div className="fallback-content absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-800" style={{ display: 'none' }}>
          <div className="text-center">
            <i className="fas fa-book-open text-2xl mb-2"></i>
            <h4 className="font-amiri text-sm font-bold">{course.title}</h4>
          </div>
        </div>

        {/* Image count indicator */}
        {images.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/70 text-white rounded-full px-2 py-1 text-xs flex items-center gap-1">
            <i className="fas fa-images"></i>
            <span>{images.length}</span>
          </div>
        )}

        {/* Image type badge */}
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-xs bg-white/90 text-gray-700">
            {images[0].label}
          </Badge>
        </div>

        {/* Hover overlay for multiple images */}
        {images.length > 1 && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-2">
              <i className="fas fa-expand text-gray-700"></i>
            </div>
          </div>
        )}
      </div>

      {/* Gallery Dialog */}
      {images.length > 1 && (
        <Dialog open={isGalleryOpen} onOpenChange={setIsGalleryOpen}>
          <DialogContent className="max-w-4xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>{course.title} - معرض الصور</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative">
                <img 
                  src={images[selectedImageIndex].url}
                  alt={`${course.title} - ${images[selectedImageIndex].label}`}
                  className="w-full h-96 object-contain bg-gray-50 rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y5ZmFmYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNmI3Mjg1Ij7YtdmI2LHYqSDYutmK2LEg2YXYqtin2K3YqTwvdGV4dD48L3N2Zz4=';
                  }}
                />
                <div className="absolute bottom-4 left-4">
                  <Badge className="bg-black/70 text-white">
                    {images[selectedImageIndex].label}
                  </Badge>
                </div>
              </div>

              {/* Thumbnail Navigation */}
              <div className="flex gap-2 justify-center overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={image.url}
                      alt={image.label}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const container = e.currentTarget.parentElement;
                        if (container) {
                          container.innerHTML = `
                            <div class="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                              <i class="fas fa-image"></i>
                            </div>
                          `;
                        }
                      }}
                    />
                    {selectedImageIndex === index && (
                      <div className="absolute inset-0 bg-blue-500/20"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImageIndex(Math.max(0, selectedImageIndex - 1))}
                  disabled={selectedImageIndex === 0}
                >
                  <i className="fas fa-chevron-right ml-2"></i>
                  السابق
                </Button>
                
                <span className="text-sm text-gray-500">
                  {selectedImageIndex + 1} من {images.length}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedImageIndex(Math.min(images.length - 1, selectedImageIndex + 1))}
                  disabled={selectedImageIndex === images.length - 1}
                >
                  التالي
                  <i className="fas fa-chevron-left mr-2"></i>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}