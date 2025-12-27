import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({
  product,
  isOpen,
  onClose
}: QuickViewModalProps) => {
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState(0);
  const { addToCart } = useCart();

  // Combine main image with gallery images
  const allImages = useMemo(() => {
    const images: string[] = [];
    if (product.image) images.push(product.image);
    if (product.galleryImages && product.galleryImages.length > 0) {
      images.push(...product.galleryImages);
    }
    return images;
  }, [product.image, product.galleryImages]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-DZ').format(price) + ' دج';
  };

  const handleAddToCart = () => {
    addToCart(product, selectedColor);
    toast.success('تمت الإضافة إلى السلة');
    onClose();
  };

  const handlePrevImage = () => {
    setSlideDirection(-1);
    setCurrentImageIndex((prev) => 
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setSlideDirection(1);
    setCurrentImageIndex((prev) => 
      prev === allImages.length - 1 ? 0 : prev + 1
    );
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-start md:items-center justify-center p-4 overflow-y-auto overscroll-contain"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card border-2 border-primary/30 rounded-lg max-w-4xl w-full md:max-h-[90vh] max-h-[90dvh] overflow-y-auto overscroll-contain"
            style={{ WebkitOverflowScrolling: 'touch' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
              {/* Image Section */}
              <div className="relative aspect-square max-h-[50vh] md:max-h-none bg-secondary overflow-hidden touch-pan-y">
                <AnimatePresence initial={false} custom={slideDirection} mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={allImages[currentImageIndex] || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover absolute inset-0 cursor-grab active:cursor-grabbing"
                    style={{ touchAction: allImages.length > 1 ? 'pan-y' : 'auto' }}
                    custom={slideDirection}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    drag={allImages.length > 1 ? "x" : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => {
                      if (allImages.length <= 1) return;
                      const threshold = 50;
                      if (info.offset.x > threshold) {
                        handlePrevImage();
                      } else if (info.offset.x < -threshold) {
                        handleNextImage();
                      }
                    }}
                  />
                </AnimatePresence>
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-background/80 border border-primary/30 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-background/80 border border-primary/30 rounded-full text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    {/* Image indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setSlideDirection(index > currentImageIndex ? 1 : -1);
                            setCurrentImageIndex(index);
                          }}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentImageIndex
                              ? 'bg-primary scale-110'
                              : 'bg-foreground/30 hover:bg-foreground/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Content Section */}
              <div className="p-6 md:p-8 pb-8 flex flex-col" dir="rtl">
                <button
                  onClick={onClose}
                  className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <p className="text-muted-foreground">{product.brand}</p>
                <h2 className="font-display text-3xl mt-2">{product.name}</h2>
                <p className="text-primary text-2xl font-bold mt-4">
                  {formatPrice(product.price)}
                </p>

                <p className="text-muted-foreground mt-4 leading-relaxed">
                  {product.description}
                </p>

                {product.colors && product.colors.length > 0}

                <div className="mt-auto pt-6 space-y-3">
                  <button onClick={handleAddToCart} className="btn-luxury w-full text-center">
                    إضافة إلى السلة
                  </button>
                  <Link
                    to={`/product/${product.id}`}
                    className="btn-luxury-outline w-full text-center block"
                    onClick={onClose}
                  >
                    عرض التفاصيل الكاملة ↗
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;