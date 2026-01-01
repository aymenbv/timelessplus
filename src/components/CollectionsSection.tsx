import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import watchClassic from '@/assets/watch-classic.jpg';
import watchSmart from '@/assets/watch-smart.jpg';

const CollectionsSection = () => {
  return (
    <section className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Mobile: single column (grid-cols-1), Desktop: two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Luxury Collection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group overflow-hidden rounded-lg h-64 md:h-80"
          >
            <img
              src={watchClassic}
              alt="Luxury Collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">Luxury Collection</h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">Timeless Craftsmanship</p>
              <Link
                to="/products?category=men"
                className="btn-luxury mt-4 md:mt-6 inline-block w-fit"
              >
                تسوق الكلاسيكي
              </Link>
            </div>
          </motion.div>

          {/* Smart Tech */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative group overflow-hidden rounded-lg h-64 md:h-80"
          >
            <img
              src={watchSmart}
              alt="Smart Tech"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
            <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-center">
              <h2 className="font-display text-2xl md:text-3xl text-foreground">Smart Tech</h2>
              <p className="text-muted-foreground mt-2 text-sm md:text-base">Future of Innovation</p>
              <Link
                to="/products?category=smart"
                className="btn-luxury mt-4 md:mt-6 inline-block w-fit"
              >
                تسوق الحديث
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CollectionsSection;
