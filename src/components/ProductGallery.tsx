import { useState, useEffect, useCallback } from 'react';
import { isVideoUrl } from '@/lib/mediaUtils';
import useEmblaCarousel from 'embla-carousel-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
interface ProductGalleryProps {
  images: string[];
  productName: string;
}
const ProductGallery = ({
  images,
  productName
}: ProductGalleryProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [zoomPosition, setZoomPosition] = useState({
    x: 50,
    y: 50
  });
  const [isZooming, setIsZooming] = useState(false);
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  // Embla Carousel with infinite loop
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
    containScroll: false,
    watchDrag: !isZoomedIn // Disable drag when zoomed in
  });

  // Reset selected image when images array changes
  useEffect(() => {
    setSelectedImage(0);
    if (emblaApi) {
      emblaApi.scrollTo(0, true);
    }
  }, [images, emblaApi]);

  // Re-init embla when zoom state changes to enable/disable dragging
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit({
        loop: true,
        dragFree: false,
        containScroll: false,
        watchDrag: !isZoomedIn
      });
    }
  }, [isZoomedIn, emblaApi]);

  // Sync selected index with embla
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedImage(emblaApi.selectedScrollSnap());
  }, [emblaApi]);
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Scroll to specific slide
  const scrollToSlide = useCallback((index: number) => {
    if (emblaApi) {
      emblaApi.scrollTo(index);
    }
  }, [emblaApi]);
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width * 100;
    const y = (e.clientY - rect.top) / rect.height * 100;
    setZoomPosition({
      x,
      y
    });
  };
  const currentImage = images[selectedImage] || images[0];
  const isVideo = isVideoUrl(currentImage);
  return <div className="space-y-3">
      {/* Mobile: Embla Carousel with Pinch-to-Zoom */}
      <div className="md:hidden">
        <div className="overflow-hidden rounded-lg" ref={emblaRef}>
          <div className="flex">
            {images.map((img, index) => <div key={index} className="flex-shrink-0 w-full aspect-[3/4] max-h-[60vh] bg-secondary">
                {isVideoUrl(img) ? <video src={img} className="w-full h-full object-cover" controls autoPlay={index === selectedImage} muted loop playsInline /> : <TransformWrapper initialScale={1} minScale={1} maxScale={4} centerOnInit onZoomStart={() => setIsZoomedIn(true)} onZoomStop={ref => {
              if (ref.state.scale <= 1.1) {
                setIsZoomedIn(false);
              }
            }} onPanning={() => setIsZoomedIn(true)} onTransformed={(_, state) => {
              if (state.scale <= 1.1) {
                setIsZoomedIn(false);
              } else {
                setIsZoomedIn(true);
              }
            }} panning={{
              disabled: false
            }} pinch={{
              disabled: false
            }} doubleClick={{
              mode: 'toggle'
            }}>
                    {({
                resetTransform
              }) => <TransformComponent wrapperStyle={{
                width: '100%',
                height: '100%'
              }} contentStyle={{
                width: '100%',
                height: '100%'
              }}>
                        <img src={img} alt={`${productName} - ${index + 1}`} className="w-full h-full object-cover" loading={index === 0 ? 'eager' : 'lazy'} draggable={false} onDoubleClick={() => {
                  if (isZoomedIn) {
                    resetTransform();
                    setIsZoomedIn(false);
                  }
                }} />
                      </TransformComponent>}
                  </TransformWrapper>}
              </div>)}
          </div>
        </div>

        {/* Pagination Dots */}
        {images.length > 1 && <div className="flex justify-center gap-2 mt-3">
            {images.map((_, index) => <button key={index} onClick={() => scrollToSlide(index)} className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${index === selectedImage ? 'bg-[#D4AF37] scale-110' : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'}`} aria-label={`Go to image ${index + 1}`} />)}
          </div>}

        {/* Zoom hint */}
        {!isZoomedIn && images.length > 0 && !isVideoUrl(images[0])}
      </div>

      {/* Desktop: Main Image + Thumbnails */}
      <div className="hidden md:block space-y-4">
        {/* Main Image */}
        <div className="aspect-square overflow-hidden rounded-lg bg-secondary cursor-crosshair relative max-h-[70vh]" onMouseMove={!isVideo ? handleMouseMove : undefined} onMouseEnter={() => !isVideo && setIsZooming(true)} onMouseLeave={() => setIsZooming(false)}>
          {isVideo ? <video src={currentImage} className="w-full h-full object-cover" controls autoPlay muted loop playsInline /> : <img src={currentImage} alt={productName} className="w-full h-full object-cover transition-transform duration-150 ease-out" style={{
          transform: isZooming ? 'scale(2.5)' : 'scale(1)',
          transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
        }} />}
        </div>

        {/* Thumbnails Row */}
        {images.length > 1 && <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide" style={{
        scrollbarWidth: 'none'
      }}>
            {images.map((img, index) => <button key={index} onClick={() => setSelectedImage(index)} className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/30 scale-105' : 'border-border/50 hover:border-[#D4AF37]/50 opacity-70 hover:opacity-100'}`}>
                {isVideoUrl(img) ? <video src={img} className="w-full h-full object-cover" muted /> : <img src={img} alt={`${productName} - ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />}
              </button>)}
          </div>}
      </div>
    </div>;
};
export default ProductGallery;