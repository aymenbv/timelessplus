import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { useProducts } from '@/hooks/useProducts';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Loader2, SlidersHorizontal, X } from 'lucide-react';

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const { data: products = [], isLoading } = useProducts();

  const [filters, setFilters] = useState({
    brand: '',
    movement: '',
    material: '',
    priceRange: [0, 5000000] as [number, number],
  });

  const [openSection, setOpenSection] = useState<string | null>('brand');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const brands = [...new Set(products.map((p) => p.brand))];
  const movements = ['automatic', 'quartz'];
  const materials = ['leather', 'metal', 'rubber'];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if (categoryFilter && product.category !== categoryFilter) return false;
      if (filters.brand && product.brand !== filters.brand) return false;
      if (filters.movement && product.movement !== filters.movement) return false;
      if (filters.material && product.material !== filters.material) return false;
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1])
        return false;
      return true;
    });
  }, [products, filters, categoryFilter]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-DZ').format(price);
  };

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: string;
    sectionKey: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-border/50 pb-4">
      <button
        onClick={() => setOpenSection(openSection === sectionKey ? null : sectionKey)}
        className="flex items-center justify-between w-full py-2 text-foreground font-medium"
      >
        {title}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            openSection === sectionKey ? 'rotate-180' : ''
          }`}
        />
      </button>
      {openSection === sectionKey && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  );

  const FiltersContent = () => (
    <>
      <FilterSection title="العلامة التجارية" sectionKey="brand">
        {brands.map((brand) => (
          <label key={brand} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.brand === brand}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  brand: prev.brand === brand ? '' : brand,
                }))
              }
              className="accent-primary"
            />
            <span className="text-sm text-muted-foreground">{brand}</span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="الحركة" sectionKey="movement">
        {movements.map((movement) => (
          <label key={movement} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.movement === movement}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  movement: prev.movement === movement ? '' : movement,
                }))
              }
              className="accent-primary"
            />
            <span className="text-sm text-muted-foreground capitalize">
              {movement === 'automatic' ? 'أوتوماتيك' : 'كوارتز'}
            </span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="المادة" sectionKey="material">
        {materials.map((material) => (
          <label key={material} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.material === material}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  material: prev.material === material ? '' : material,
                }))
              }
              className="accent-primary"
            />
            <span className="text-sm text-muted-foreground capitalize">
              {material === 'leather'
                ? 'جلد'
                : material === 'metal'
                ? 'معدن'
                : 'مطاط'}
            </span>
          </label>
        ))}
      </FilterSection>

      <FilterSection title="نطاق السعر" sectionKey="price">
        <div className="space-y-4">
          <input
            type="range"
            min="0"
            max="5000000"
            step="50000"
            value={filters.priceRange[1]}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                priceRange: [prev.priceRange[0], parseInt(e.target.value)],
              }))
            }
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatPrice(filters.priceRange[0])} دج</span>
            <span>{formatPrice(filters.priceRange[1])} دج</span>
          </div>
        </div>
      </FilterSection>
    </>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Mobile Filter Button */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="flex items-center gap-2 bg-card border border-border/50 rounded-lg px-4 py-3 text-foreground w-full justify-center"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>الفلاتر</span>
            </button>
          </div>

          {/* Mobile Filters Drawer */}
          <AnimatePresence>
            {mobileFiltersOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 lg:hidden overflow-y-auto"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-display text-xl text-foreground">الفلاتر</h3>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 hover:text-primary transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <FiltersContent />
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="btn-luxury w-full mt-6"
                  >
                    تطبيق الفلاتر
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block lg:w-64 shrink-0">
              <div className="sticky top-24 bg-card border border-border/50 rounded-lg p-6">
                <h3 className="font-display text-xl mb-6 text-foreground">الفلاتر</h3>
                <FiltersContent />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6"
                >
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </motion.div>
              )}

              {!isLoading && filteredProducts.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-muted-foreground text-lg">
                    لا توجد منتجات مطابقة للفلاتر المحددة
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
