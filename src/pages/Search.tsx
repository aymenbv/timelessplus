import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<Product[]> => {
      if (!query.trim()) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`);

      if (error) throw error;
      
      return (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        price: Number(p.price),
        image: p.image || '',
        category: p.category as Product['category'],
        movement: p.movement as Product['movement'],
        material: p.material as Product['material'],
        description: p.description || '',
        colors: p.colors || [],
        inStock: p.in_stock ?? true,
      }));
    },
    enabled: !!query.trim(),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Search Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <SearchIcon className="w-6 h-6 text-primary" />
              <h1 className="font-display text-2xl md:text-3xl text-foreground">
                نتائج البحث
              </h1>
            </div>
            {query && (
              <p className="text-muted-foreground">
                البحث عن: <span className="text-primary font-medium">"{query}"</span>
              </p>
            )}
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {/* Results Grid */}
          {!isLoading && products.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}

          {/* No Results */}
          {!isLoading && query && products.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <SearchIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
              <h2 className="font-display text-xl text-foreground mb-2">
                لا توجد نتائج لـ "{query}"
              </h2>
              <p className="text-muted-foreground mb-6">
                جرب البحث بكلمات مختلفة أو تصفح جميع المنتجات
              </p>
              <Button asChild>
                <Link to="/products">عرض جميع المنتجات</Link>
              </Button>
            </motion.div>
          )}

          {/* No Query */}
          {!query && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <SearchIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
              <h2 className="font-display text-xl text-foreground mb-2">
                ابحث عن منتجاتك المفضلة
              </h2>
              <p className="text-muted-foreground mb-6">
                أدخل اسم المنتج أو العلامة التجارية للبحث
              </p>
              <Button asChild>
                <Link to="/products">تصفح المنتجات</Link>
              </Button>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Search;
