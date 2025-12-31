import { useState, useRef, useEffect, useCallback } from 'react';
import { isVideoUrl } from '@/lib/mediaUtils';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isNavigatingRef = useRef(false);

  // Reset selected image when images array changes
  useEffect(() => {
    setSelectedImage(0);
  }, [images]);

  // IntersectionObserver to detect which slide is visible
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio > 0.5 && !isNavigatingRef.current) {
              setSelectedImage(index);
            }
          });
        },
        { threshold: 0.5 }
      );
      
      observer.observe(slide);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [images]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Scroll to image on dot click using scrollIntoView (RTL-safe)
  const scrollToImage = useCallback((index: number) => {
    if (index === selectedImage) return;
    
    isNavigatingRef.current = true;
    setSelectedImage(index);
    
    const slide = slideRefs.current[index];
    if (slide) {
      slide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      // Reset navigation flag after animation
      setTimeout(() => {
        isNavigatingRef.current = false;
      }, 400);
    }
  }, [selectedImage]);

  const currentImage = images[selectedImage] || images[0];
  const isVideo = isVideoUrl(currentImage);

  return (
    <div className="space-y-3">
      {/* Mobile: Swipe Carousel */}
      <div className="md:hidden">
        <div
          dir="ltr"
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide max-h-[60vh] touch-pan-x overscroll-x-contain"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {images.map((img, index) => (
            <div
              key={index}
              ref={(el) => (slideRefs.current[index] = el)}
              className="flex-shrink-0 w-full snap-center aspect-[3/4] max-h-[60vh] bg-secondary rounded-lg overflow-hidden"
            >
              {isVideoUrl(img) ? (
                <video
                  src={img}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay={index === selectedImage}
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={img}
                  alt={`${productName} - ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                />
              )}
            </div>
          ))}
        </div>

        {/* Pagination Dots */}
        {images.length > 1 && (
          <div className="flex justify-center gap-2 mt-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToImage(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                  index === selectedImage
                    ? 'bg-[#D4AF37] scale-110'
                    : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Main Image + Thumbnails */}
      <div className="hidden md:block space-y-4">
        {/* Main Image */}
        <div
          className="aspect-square overflow-hidden rounded-lg bg-secondary cursor-crosshair relative max-h-[70vh]"
          onMouseMove={!isVideo ? handleMouseMove : undefined}
          onMouseEnter={() => !isVideo && setIsZooming(true)}
          onMouseLeave={() => setIsZooming(false)}
        >
          {isVideo ? (
            <video
              src={currentImage}
              className="w-full h-full object-cover"
              controls
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={currentImage}
              alt={productName}
              className="w-full h-full object-cover transition-transform duration-150 ease-out"
              style={{
                transform: isZooming ? 'scale(2.5)' : 'scale(1)',
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
              }}
            />
          )}
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all aspect-square ${
                  selectedImage === index
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-transparent hover:border-muted-foreground'
                }`}
              >
                {isVideoUrl(img) ? (
                  <video src={img} className="w-full h-full object-cover" muted />
                ) : (
                  <img
                    src={img}
                    alt={`${productName} - ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
