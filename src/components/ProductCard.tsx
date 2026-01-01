import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Eye } from 'lucide-react';
import QuickViewModal from './QuickViewModal';
import { isVideoUrl } from '@/lib/mediaUtils';
import ColorIndicators from './ColorIndicators';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [showQuickView, setShowQuickView] = useState(false);
  const { addToCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-DZ').format(price) + ' دج';
  };

  return (
    <>
      <motion.div
        className="card-luxury group cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Link to={`/product/${product.id}`}>
          {/* Fixed height on mobile for consistent vertical scrolling, aspect-square on larger screens */}
          <div className="relative h-48 sm:h-auto sm:aspect-square overflow-hidden bg-secondary">
            {isVideoUrl(product.image) ? (
              <video
                src={product.image}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                muted
                loop
                autoPlay
                playsInline
              />
            ) : (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}
          </div>

          <div className="p-3 sm:p-4">
            <p className="text-muted-foreground text-xs sm:text-sm">{product.brand}</p>
            <h3 className="font-display text-sm sm:text-lg mt-1 line-clamp-1">{product.name}</h3>
            <div className="flex items-center justify-between mt-2">
              <p className="text-primary font-semibold text-sm sm:text-base">{formatPrice(product.price)}</p>
              <ColorIndicators colors={product.colors || []} colorImages={product.colorImages} maxShow={4} size="xs" />
            </div>
          </div>
        </Link>

        {/* Touch-optimized buttons with 44px minimum height */}
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                const defaultColor = product.colors?.[0];
                addToCart(product, defaultColor);
              }}
              className="btn-luxury flex-1 flex items-center justify-center gap-2 text-xs sm:text-sm min-h-[44px]"
            >
              <span className="hidden sm:inline">أضف إلى السلة</span>
              <span className="sm:hidden">أضف للسلة</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="btn-luxury-outline p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={`معاينة سريعة لـ ${product.name}`}
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.div>

      <QuickViewModal
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};

export default ProductCard;