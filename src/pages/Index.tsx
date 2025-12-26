import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CollectionsSection from '@/components/CollectionsSection';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type TabFilter = 'all' | 'men' | 'women' | 'new';

const tabs: { key: TabFilter; label: string }[] = [
  { key: 'all', label: 'جميع الساعات' },
  { key: 'men', label: 'رجالي' },
  { key: 'women', label: 'نسائي' },
  { key: 'new', label: 'وصل حديثاً' },
];

const Index = () => {
  const { data: products = [], isLoading } = useProducts();
  const [activeTab, setActiveTab] = useState<TabFilter>('all');

  // Featured products: show featured ones, fallback to latest 4
  const featuredProducts = useMemo(() => {
    const featured = products.filter((p) => p.isFeatured);
    return featured.length > 0 ? featured.slice(0, 4) : products.slice(0, 4);
  }, [products]);

  // Filtered products for tabs
  const filteredProducts = useMemo(() => {
    switch (activeTab) {
      case 'men':
        return products.filter((p) => p.category === 'men');
      case 'women':
        return products.filter((p) => p.category === 'women');
      case 'new':
        // Latest 8 products by created_at (already sorted desc)
        return products.slice(0, 8);
      default:
        return products;
    }
  }, [products, activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        <HeroSection />
        
        <CollectionsSection />

        {/* Featured Products */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-4xl md:text-5xl text-foreground">
                المنتجات المميزة
              </h2>
              <p className="text-muted-foreground mt-4">
                اكتشف أحدث إصداراتنا من الساعات الفاخرة
              </p>
            </motion.div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Shop Section with Tabs */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-8"
            >
              <h2 className="font-display text-4xl md:text-5xl text-foreground">
                تسوق الآن
              </h2>
            </motion.div>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-10">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">
                لا توجد منتجات في هذه الفئة
              </p>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
