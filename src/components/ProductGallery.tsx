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
  
  // Mobile double-tap zoom state
  const [mobileZoom, setMobileZoom] = useState<{ index: number; zoomed: boolean; x: number; y: number } | null>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);

  // Track previous images length to only reset when truly needed
  const prevImagesLengthRef = useRef(images.length);
  
  // Only reset selected image if images array became shorter and current index is out of bounds
  useEffect(() => {
    if (selectedImage >= images.length && images.length > 0) {
      setSelectedImage(images.length - 1);
    }
    prevImagesLengthRef.current = images.length;
  }, [images.length, selectedImage]);

  // IntersectionObserver to detect which slide is visible - only update on user scroll
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    let scrollTimeout: NodeJS.Timeout;
    
    slideRefs.current.forEach((slide, index) => {
      if (!slide) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Only update if user is actually scrolling (not programmatic) and not navigating
            if (entry.isIntersecting && entry.intersectionRatio > 0.6 && !isNavigatingRef.current) {
              clearTimeout(scrollTimeout);
              scrollTimeout = setTimeout(() => {
                setSelectedImage(index);
              }, 100);
            }
          });
        },
        { threshold: 0.6 }
      );
      
      observer.observe(slide);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
      clearTimeout(scrollTimeout);
    };
  }, [images.length]); // Only re-observe when count changes, not content

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

  // Handle double-tap zoom on mobile
  const handleDoubleTap = useCallback((e: React.TouchEvent<HTMLDivElement>, index: number) => {
    const touch = e.touches[0] || e.changedTouches[0];
    const now = Date.now();
    const lastTap = lastTapRef.current;
    
    if (lastTap && now - lastTap.time < 300 && 
        Math.abs(touch.clientX - lastTap.x) < 30 && 
        Math.abs(touch.clientY - lastTap.y) < 30) {
      // Double tap detected
      e.preventDefault();
      
      if (mobileZoom?.index === index && mobileZoom.zoomed) {
        // Zoom out
        setMobileZoom(null);
      } else {
        // Zoom in at tap position
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((touch.clientX - rect.left) / rect.width) * 100;
        const y = ((touch.clientY - rect.top) / rect.height) * 100;
        setMobileZoom({ index, zoomed: true, x, y });
      }
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { time: now, x: touch.clientX, y: touch.clientY };
    }
  }, [mobileZoom]);

  // Handle touch move for panning when zoomed
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>, index: number) => {
    if (mobileZoom?.index === index && mobileZoom.zoomed) {
      e.preventDefault();
      const touch = e.touches[0];
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - rect.top) / rect.height) * 100;
      setMobileZoom(prev => prev ? { ...prev, x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) } : null);
    }
  }, [mobileZoom]);

  // Reset zoom when changing images
  useEffect(() => {
    setMobileZoom(null);
  }, [selectedImage]);

  const currentImage = images[selectedImage] || images[0];
  const isVideo = isVideoUrl(currentImage);

  return (
    <div className="space-y-3">
      {/* Mobile: Swipe Carousel */}
      <div className="md:hidden">
        <div
          dir="ltr"
          className={`flex overflow-x-auto snap-x snap-mandatory scrollbar-hide max-h-[60vh] overscroll-x-contain ${
            mobileZoom?.zoomed ? 'overflow-hidden' : ''
          }`}
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            touchAction: mobileZoom?.zoomed ? 'none' : 'pan-y pan-x',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {images.map((img, index) => {
            const isZoomedImage = mobileZoom?.index === index && mobileZoom.zoomed;
            return (
              <div
                key={index}
                ref={(el) => (slideRefs.current[index] = el)}
                className="flex-shrink-0 w-full snap-center snap-always aspect-[3/4] max-h-[60vh] bg-secondary rounded-lg overflow-hidden relative"
                onTouchStart={(e) => !isVideoUrl(img) && handleDoubleTap(e, index)}
                onTouchMove={(e) => handleTouchMove(e, index)}
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
                  <>
                    <img
                      src={img}
                      alt={`${productName} - ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-200 ease-out"
                      style={{
                        transform: isZoomedImage ? 'scale(2.5)' : 'scale(1)',
                        transformOrigin: isZoomedImage ? `${mobileZoom.x}% ${mobileZoom.y}%` : 'center',
                      }}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                    {/* Zoom indicator */}
                    {!isZoomedImage && (
                      <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                        اضغط مرتين للتكبير
                      </div>
                    )}
                    {isZoomedImage && (
                      <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none">
                        اضغط مرتين للتصغير
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination Dots */}
        {images.length > 1 && (
          <div dir="ltr" className="flex justify-center gap-2 mt-3">
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
              loading="eager"
              fetchPriority="high"
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
                className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index
                    ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 scale-105'
                    : 'border-border/50 hover:border-[#D4AF37]/50 opacity-70 hover:opacity-100'
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
