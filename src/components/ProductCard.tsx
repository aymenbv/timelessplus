import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { Eye } from 'lucide-react';
import QuickViewModal from './QuickViewModal';

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
          <div className="relative aspect-square overflow-hidden bg-secondary">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>

          <div className="p-2 sm:p-4">
            <p className="text-muted-foreground text-xs sm:text-sm">{product.brand}</p>
            <h3 className="font-display text-sm sm:text-lg mt-1 line-clamp-1">{product.name}</h3>
            <p className="text-primary font-semibold mt-1 sm:mt-2 text-sm sm:text-base">{formatPrice(product.price)}</p>
          </div>
        </Link>

        <div className="px-2 sm:px-4 pb-3 sm:pb-4">
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
              className="btn-luxury flex-1 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 px-2 sm:px-4"
            >
              <span className="hidden sm:inline">أضف إلى السلة</span>
              <span className="sm:hidden">أضف</span>
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowQuickView(true);
              }}
              className="btn-luxury-outline p-2"
            >
              <Eye className="w-4 h-4" />
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