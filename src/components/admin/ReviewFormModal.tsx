import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useProducts } from '@/hooks/useProducts';

interface ReviewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewFormModal = ({ isOpen, onClose, onSuccess }: ReviewFormModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const { data: products = [] } = useProducts();
  
  const [formData, setFormData] = useState({
    product_id: '',
    user_name: '',
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        product_id: '',
        user_name: '',
        rating: 5,
        comment: '',
      });
      setImageFile(null);
      setImagePreview('');
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('review-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('review-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_id || !formData.user_name.trim() || !formData.comment.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);

    try {
      let reviewerImageUrl = '';

      if (imageFile) {
        reviewerImageUrl = await uploadImage(imageFile);
      }

      const { error } = await supabase.from('reviews').insert({
        product_id: formData.product_id,
        user_name: formData.user_name.trim(),
        rating: formData.rating,
        comment: formData.comment.trim(),
        reviewer_image: reviewerImageUrl || null,
      });

      if (error) throw error;
      
      toast.success('تم إضافة التقييم بنجاح');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving review:', error);
      toast.error('حدث خطأ أثناء حفظ التقييم');
    } finally {
      setIsLoading(false);
    }
  };

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
            className="bg-card border border-border/50 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <div className="flex items-center justify-between p-6 border-b border-border/50">
              <h2 className="font-display text-xl">إضافة تقييم جديد</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Product Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">المنتج *</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  required
                >
                  <option value="">اختر المنتج</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.brand} - {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reviewer Name */}
              <div>
                <label className="block text-sm font-medium mb-2">اسم المُقيّم *</label>
                <input
                  type="text"
                  value={formData.user_name}
                  onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  placeholder="أدخل اسم العميل"
                  required
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium mb-2">التقييم</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= formData.rating
                            ? 'fill-primary text-primary'
                            : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium mb-2">التعليق *</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows={4}
                  className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary resize-none"
                  placeholder="أدخل تعليق العميل"
                  required
                />
              </div>

              {/* Reviewer Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">صورة المُقيّم (اختياري)</label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  {imagePreview ? (
                    <div className="relative flex justify-center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-full"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview('');
                        }}
                        className="absolute top-0 right-1/2 translate-x-12 -translate-y-2 bg-destructive text-destructive-foreground p-1 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-24 cursor-pointer">
                      <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">اضغط لرفع صورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 btn-luxury disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  إضافة التقييم
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

export default ReviewFormModal;
