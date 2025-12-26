import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import watchClassic from '@/assets/watch-classic.jpg';
import watchSmart from '@/assets/watch-smart.jpg';

const CollectionsSection = () => {
  return (
    <section className="pt-32 sm:pt-28 pb-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Luxury Collection */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group overflow-hidden rounded-lg h-80"
          >
            <img
              src={watchClassic}
              alt="Luxury Collection"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-center">
              <h3 className="font-display text-3xl text-foreground">Luxury Collection</h3>
              <p className="text-muted-foreground mt-2">Timeless Craftsmanship</p>
              <Link
                to="/products?category=men"
                className="btn-luxury mt-6 inline-block w-fit"
              >
                تسوق الكلاسيكي
              </Link>
            </div>
          </motion.div>

          {/* Smart Tech */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative group overflow-hidden rounded-lg h-80"
          >
            <img
              src={watchSmart}
              alt="Smart Tech"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-center">
              <h3 className="font-display text-3xl text-foreground">Smart Tech</h3>
              <p className="text-muted-foreground mt-2">Future of Innovation</p>
              <Link
                to="/products?category=smart"
                className="btn-luxury mt-6 inline-block w-fit"
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
