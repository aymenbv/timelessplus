import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Star, Shield, Award, Truck, ChevronRight, Quote, Plus, User, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCart } from '@/context/CartContext';
import { Product, Review } from '@/types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { isVideoUrl } from '@/lib/mediaUtils';
import ColorSelector from '@/components/ColorSelector';
const ProductDetails = () => {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const {
    addToCart
  } = useCart();

  // Scroll to top when product id changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Fetch reviews from database
  const {
    data: reviews = []
  } = useQuery({
    queryKey: ['reviews', id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('reviews').select('*').eq('product_id', id).order('created_at', {
        ascending: false
      });
      if (error) throw error;
      return data as Review[];
    },
    enabled: !!id
  });

  // Calculate average rating
  const averageRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length).toFixed(1) : '0';

  // Mutation to add a review
  const addReviewMutation = useMutation({
    mutationFn: async (newReview: {
      product_id: string;
      user_name: string;
      rating: number;
      comment: string;
    }) => {
      const {
        error
      } = await supabase.from('reviews').insert(newReview);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['reviews', id]
      });
      toast({
        title: 'شكراً لك!',
        description: 'تم إرسال تقييمك بنجاح'
      });
      setIsReviewDialogOpen(false);
      setReviewName('');
      setReviewRating(5);
      setReviewComment('');
    },
    onError: () => {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء إرسال التقييم',
        variant: 'destructive'
      });
    }
  });
  const handleSubmitReview = () => {
    if (!reviewName.trim() || !reviewComment.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول',
        variant: 'destructive'
      });
      return;
    }
    if (!id) return;
    addReviewMutation.mutate({
      product_id: id,
      user_name: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim()
    });
  };
  const {
    data: product,
    isLoading,
    error
  } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('Product not found');
      return {
        id: data.id,
        name: data.name,
        brand: data.brand,
        price: data.price,
        image: data.image || '/placeholder.svg',
        galleryImages: data.gallery_images || [],
        category: data.category,
        movement: data.movement,
        material: data.material,
        description: data.description || '',
        colors: data.colors || [],
        inStock: data.in_stock ?? true
      } as Product;
    },
    enabled: !!id
  });

  // Fetch related products
  const {
    data: relatedProducts
  } = useQuery({
    queryKey: ['related-products', id],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from('products').select('*').neq('id', id).limit(4);
      if (error) throw error;
      return data.map(item => ({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        image: item.image || '/placeholder.svg',
        galleryImages: item.gallery_images || [],
        category: item.category,
        movement: item.movement,
        material: item.material,
        description: item.description || '',
        colors: item.colors || [],
        inStock: item.in_stock ?? true
      })) as Product[];
    },
    enabled: !!id
  });
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-DZ').format(price) + ' دج';
  };

  // Scarcity logic - generate consistent "stock" based on product ID
  const getScarcityData = (productId: string) => {
    // Use product ID to generate consistent random values
    const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const stockLeft = (hash % 5) + 1; // 1-5 pieces left
    const soldPercentage = 75 + (hash % 20); // 75-94% sold
    const isLowStock = stockLeft <= 3;
    return { stockLeft, soldPercentage, isLowStock };
  };

  const scarcityData = id ? getScarcityData(id) : null;
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, selectedColor || undefined);
      toast({
        title: 'تمت الإضافة للسلة',
        description: `تم إضافة ${product.name} إلى سلة التسوق`
      });
    }
  };
  const handleBuyNow = () => {
    if (product) {
      addToCart(product, selectedColor || undefined);
      navigate('/cart');
    }
  };
  const renderStars = (rating: number) => {
    return <div className="flex">
        {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-4 h-4 ${star <= rating ? 'fill-primary text-primary' : star - 0.5 <= rating ? 'fill-primary/50 text-primary' : 'text-muted-foreground'}`} />)}
      </div>;
  };

  // Build gallery images array - main image + gallery_images
  const allImages = product ? [product.image, ...(product.galleryImages || [])].filter(Boolean) : [];
  if (isLoading) {
    return <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <div className="flex gap-4">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <Skeleton className="w-20 h-20 rounded-lg" />
                <Skeleton className="w-20 h-20 rounded-lg" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>;
  }
  if (error || !product) {
    return <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-display mb-4">المنتج غير موجود</h1>
          <Link to="/products" className="btn-luxury">
            العودة للمنتجات
          </Link>
        </main>
        <Footer />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary transition-colors">الرئيسية</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-primary transition-colors">الساعات</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Images Gallery */}
          <motion.div initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.5
        }} className="space-y-4">
            {/* Main Image/Video */}
            <div 
              className="aspect-square overflow-hidden rounded-lg bg-secondary cursor-crosshair relative"
              onMouseMove={!isVideoUrl(allImages[selectedImage]) ? handleMouseMove : undefined}
              onMouseEnter={() => !isVideoUrl(allImages[selectedImage]) && setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
            >
              {isVideoUrl(allImages[selectedImage] || product.image) ? (
                <video 
                  src={allImages[selectedImage] || product.image} 
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img 
                  src={allImages[selectedImage] || product.image} 
                  alt={product.name} 
                  className="w-full h-full object-cover transition-transform duration-150 ease-out"
                  style={{
                    transform: isZooming ? 'scale(2.5)' : 'scale(1)',
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                  }}
                />
              )}
            </div>
            
            {/* Thumbnails - Horizontal Scrollable */}
            {allImages.length > 1 && <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-3 pb-2">
                  {allImages.map((img, index) => <button key={index} onClick={() => setSelectedImage(index)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-muted-foreground'}`}>
                      {isVideoUrl(img) ? (
                        <video src={img} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={img} alt={`${product.name} - ${index + 1}`} className="w-full h-full object-cover" />
                      )}
                    </button>)}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>}
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.5,
          delay: 0.1
        }} className="space-y-6">
            {/* Brand */}
            <p className="text-muted-foreground uppercase tracking-wider">{product.brand}</p>

            {/* Title */}
            <h1 className="font-display text-3xl lg:text-4xl">{product.name}</h1>

            {/* Star Rating */}
            <div className="flex items-center gap-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(star => <Star key={star} className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />)}
              </div>
              <span className="text-sm text-muted-foreground">
                ({averageRating}/5 بناءً على {reviews.length} تقييم)
              </span>
            </div>

            {/* Price */}
            <p className="text-3xl font-bold text-primary">{formatPrice(product.price)}</p>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description || 'ساعة فاخرة بتصميم عصري أنيق، تجمع بين الجودة العالية والأناقة الكلاسيكية. مثالية لجميع المناسبات.'}
            </p>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="py-4 border-y border-border">
                <ColorSelector
                  colors={product.colors}
                  selectedColor={selectedColor}
                  onColorSelect={setSelectedColor}
                  size="lg"
                />
              </div>
            )}

            {/* Scarcity Trigger */}
            {product.inStock && scarcityData?.isLowStock && (
              <div className="space-y-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75"></span>
                    <Flame className="relative w-5 h-5 text-destructive" />
                  </div>
                  <span className="text-destructive font-bold text-sm">
                    🔥 بقي {scarcityData.stockLeft} قطع فقط في المخزون!
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>تم البيع</span>
                    <span className="font-medium text-destructive">{scarcityData.soldPercentage}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${scarcityData.soldPercentage}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-destructive to-destructive/70 rounded-full"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={!product.inStock} className="btn-luxury flex-1 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed">
                {product.inStock ? 'أضف إلى السلة' : 'غير متوفر'}
              </button>
              <button onClick={handleBuyNow} disabled={!product.inStock} className="flex-1 py-4 text-lg bg-foreground text-background hover:bg-foreground/90 transition-colors rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                اشتر الآن
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div className="flex flex-col items-center text-center gap-2">
                <Shield className="w-8 h-8 text-primary" />
                <span className="text-xs text-muted-foreground">ضمان سنة</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Award className="w-8 h-8 text-primary" />
                <span className="text-xs text-muted-foreground">100% أصلي</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-8 h-8 text-primary" />
                <span className="text-xs text-muted-foreground">شحن سريع</span>
              </div>
            </div>

            {/* Technical Specifications Accordion */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="specs">
                <AccordionTrigger className="text-lg font-medium">
                  المواصفات التقنية
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">الحركة</span>
                      <span className="font-medium">
                        {product.movement === 'automatic' ? 'أوتوماتيكية' : 'كوارتز'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">مادة الهيكل</span>
                      <span className="font-medium">
                        {product.material === 'metal' ? 'معدن' : product.material === 'leather' ? 'جلد' : 'مطاط'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">مقاومة الماء</span>
                      <span className="font-medium">50 متر</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">الفئة</span>
                      <span className="font-medium">
                        {product.category === 'men' ? 'رجالي' : product.category === 'women' ? 'نسائي' : product.category === 'smart' ? 'ذكية' : 'إكسسوارات'}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted-foreground">الحالة</span>
                      <span className={`font-medium ${product.inStock ? 'text-green-500' : 'text-red-500'}`}>
                        {product.inStock ? 'متوفر' : 'غير متوفر'}
                      </span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {/* Customer Reviews Section */}
            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl">آراء العملاء</h2>
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Plus className="w-4 h-4" />
                      أضف تقييمك
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-center font-display text-xl">أضف تقييمك</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">اسمك</label>
                        <Input placeholder="أدخل اسمك" value={reviewName} onChange={e => setReviewName(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">التقييم</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => <button key={star} type="button" onClick={() => setReviewRating(star)} className="p-1 transition-transform hover:scale-110">
                              <Star className={`w-8 h-8 ${star <= reviewRating ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
                            </button>)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">رأيك</label>
                        <Textarea placeholder="شاركنا رأيك في المنتج..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={4} />
                      </div>
                      <Button onClick={handleSubmitReview} className="w-full">
                        إرسال التقييم
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-6">
                {reviews.length === 0 ? <p className="text-muted-foreground text-center py-8">لا توجد تقييمات بعد. كن أول من يقيّم هذا المنتج!</p> : reviews.map(review => <motion.div key={review.id} initial={{
                opacity: 0,
                y: 10
              }} whileInView={{
                opacity: 1,
                y: 0
              }} viewport={{
                once: true
              }} className="bg-secondary/30 rounded-lg p-4 relative">
                      <Quote className="absolute top-4 right-4 w-6 h-6 text-primary/20" />
                      <div className="flex items-center gap-3 mb-3">
                        {review.reviewer_image ? <img src={review.reviewer_image} alt={review.user_name} className="w-10 h-10 rounded-full object-cover" /> : <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>}
                        <div>
                          <p className="font-medium">{review.user_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(review.created_at), 'd MMMM yyyy', {
                        locale: ar
                      })}
                          </p>
                        </div>
                      </div>
                      {renderStars(Number(review.rating))}
                      <p className="mt-3 text-muted-foreground">{review.comment}</p>
                    </motion.div>)}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related Products Section */}
        {relatedProducts && relatedProducts.length > 0 && <section className="mt-20">
            <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} className="text-center mb-12">
              <h2 className="font-display text-3xl mb-4">قد يعجبك أيضاً</h2>
              <p className="text-muted-foreground">اكتشف المزيد من ساعاتنا الفاخرة</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(relatedProduct => <ProductCard key={relatedProduct.id} product={relatedProduct} />)}
            </div>
          </section>}
      </main>

      <Footer />
    </div>;
};
export default ProductDetails;