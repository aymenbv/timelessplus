import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';
import { z } from 'zod';

const productSchema = z.object({
  name: z.string().min(2, 'اسم المنتج مطلوب'),
  brand: z.string().min(2, 'الماركة مطلوبة'),
  price: z.number().min(1, 'السعر يجب أن يكون أكبر من 0'),
  category: z.enum(['men', 'women', 'smart', 'accessories']),
  movement: z.enum(['automatic', 'quartz']),
  material: z.enum(['leather', 'metal', 'rubber']),
  description: z.string().optional(),
});

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  onSuccess: () => void;
}

const ProductFormModal = ({ isOpen, onClose, product, onSuccess }: ProductFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    price: 0,
    category: 'men' as 'men' | 'women' | 'smart' | 'accessories',
    movement: 'automatic' as 'automatic' | 'quartz',
    material: 'metal' as 'leather' | 'metal' | 'rubber',
    description: '',
    colors: [] as string[],
    inStock: true,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        brand: product.brand,
        price: product.price,
        category: product.category,
        movement: product.movement,
        material: product.material,
        description: product.description || '',
        colors: product.colors || [],
        inStock: product.inStock,
      });
      // Combine main image and gallery images for existing images
      const allImages: string[] = [];
      if (product.image) allImages.push(product.image);
      if ((product as any).galleryImages) {
        allImages.push(...(product as any).galleryImages);
      }
      setExistingImages(allImages);
      setImagePreviews([]);
    } else {
      setFormData({
        name: '',
        brand: '',
        price: 0,
        category: 'men',
        movement: 'automatic',
        material: 'metal',
        description: '',
        colors: [],
        inStock: true,
      });
      setExistingImages([]);
      setImagePreviews([]);
    }
    setImageFiles([]);
    setErrors({});
  }, [product, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles((prev) => [...prev, ...files]);
      
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews((prev) => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeNewImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = productSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Upload new images
      const newImageUrls: string[] = [];
      for (const file of imageFiles) {
        const url = await uploadImage(file);
        newImageUrls.push(url);
      }

      // Combine existing and new images
      const allImages = [...existingImages, ...newImageUrls];
      const mainImage = allImages[0] || null;
      const galleryImages = allImages.slice(1);

      const productData = {
        name: formData.name,
        brand: formData.brand,
        price: formData.price,
        category: formData.category,
        movement: formData.movement,
        material: formData.material,
        description: formData.description || null,
        colors: formData.colors,
        in_stock: formData.inStock,
        image: mainImage,
        gallery_images: galleryImages,
      };

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
        toast.success('تم تحديث المنتج بنجاح');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('تم إضافة المنتج بنجاح');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('حدث خطأ أثناء حفظ المنتج');
    } finally {
      setIsLoading(false);
    }
  };

  const categoryOptions = [
    { value: 'men', label: 'رجالي' },
    { value: 'women', label: 'نسائي' },
    { value: 'smart', label: 'ذكي' },
    { value: 'accessories', label: 'إكسسوارات' },
  ];

  const movementOptions = [
    { value: 'automatic', label: 'أوتوماتيك' },
    { value: 'quartz', label: 'كوارتز' },
  ];

  const materialOptions = [
    { value: 'leather', label: 'جلد' },
    { value: 'metal', label: 'معدن' },
    { value: 'rubber', label: 'مطاط' },
  ];

  const allPreviews = [...existingImages, ...imagePreviews];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-card border border-border/50 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="font-display text-xl">
                {product ? 'تعديل المنتج' : 'إضافة منتج جديد'}
              </h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Multi-Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">صور المنتج (يمكن رفع عدة صور)</label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  {allPreviews.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-3">
                        {existingImages.map((img, index) => (
                          <div key={`existing-${index}`} className="relative aspect-square">
                            <img
                              src={img}
                              alt={`Image ${index + 1}`}
                              className={`w-full h-full object-cover rounded-lg ${index === 0 ? 'ring-2 ring-primary' : ''}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground p-1 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {index === 0 && (
                              <span className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                                رئيسية
                              </span>
                            )}
                          </div>
                        ))}
                        {imagePreviews.map((img, index) => (
                          <div key={`new-${index}`} className="relative aspect-square">
                            <img
                              src={img}
                              alt={`New Image ${index + 1}`}
                              className={`w-full h-full object-cover rounded-lg ${existingImages.length === 0 && index === 0 ? 'ring-2 ring-primary' : ''}`}
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
                              className="absolute -top-2 -left-2 bg-destructive text-destructive-foreground p-1 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            {existingImages.length === 0 && index === 0 && (
                              <span className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                                رئيسية
                              </span>
                            )}
                          </div>
                        ))}
                        <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                          <Plus className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground mt-1">إضافة</span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        الصورة الأولى ستكون الصورة الرئيسية للمنتج
                      </p>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">اضغط لرفع صور المنتج</span>
                      <span className="text-xs text-muted-foreground mt-1">يمكن اختيار عدة صور</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">اسم المنتج</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  />
                  {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الماركة</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  />
                  {errors.brand && <p className="text-destructive text-sm mt-1">{errors.brand}</p>}
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium mb-2">السعر (دج)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                />
                {errors.price && <p className="text-destructive text-sm mt-1">{errors.price}</p>}
              </div>

              {/* Category, Movement, Material */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">الفئة</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as typeof formData.category })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الحركة</label>
                  <select
                    value={formData.movement}
                    onChange={(e) => setFormData({ ...formData, movement: e.target.value as typeof formData.movement })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  >
                    {movementOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">الخامة</label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value as typeof formData.material })}
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  >
                    {materialOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              {/* In Stock */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-5 h-5 rounded border-border accent-primary"
                />
                <label htmlFor="inStock" className="text-sm">متوفر في المخزون</label>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-luxury disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {product ? 'حفظ التعديلات' : 'إضافة المنتج'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductFormModal;