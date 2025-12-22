import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCart } from '@/context/CartContext';
import { useCreateOrder } from '@/hooks/useOrders';
import WilayaSelect from '@/components/WilayaSelect';
import { Trash2, Plus, Minus, Truck, CreditCard, ShieldCheck, Loader2, Tag, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { z } from 'zod';

const VALID_PROMO_CODE = 'TIMELESS2025';
const PROMO_DISCOUNT = 0.10; // 10%

const CUSTOMER_INFO_KEY = 'timeless_customer_info';
const LAST_ORDER_KEY = 'timeless_last_order';

interface CustomerInfo {
  customerName: string;
  phone: string;
  wilaya: string;
  commune: string;
}

const loadCustomerInfo = (): CustomerInfo | null => {
  try {
    const stored = localStorage.getItem(CUSTOMER_INFO_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load customer info:', e);
  }
  return null;
};

const saveCustomerInfo = (info: CustomerInfo) => {
  try {
    localStorage.setItem(CUSTOMER_INFO_KEY, JSON.stringify(info));
  } catch (e) {
    console.error('Failed to save customer info:', e);
  }
};

const orderSchema = z.object({
  customerName: z.string().trim().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  phone: z.string().trim().regex(/^\+?213[0-9]{9}$/, 'رقم الهاتف غير صالح'),
  wilaya: z.string().trim().min(1, 'اختر الولاية'),
  commune: z.string().trim().min(2, 'البلدية مطلوبة').max(100),
});

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const createOrder = useCreateOrder();
  
  // Load saved customer info on mount
  const savedInfo = loadCustomerInfo();
  const [customerName, setCustomerName] = useState(savedInfo?.customerName || '');
  const [phone, setPhone] = useState(savedInfo?.phone || '+213');
  const [wilaya, setWilaya] = useState(savedInfo?.wilaya || '');
  const [commune, setCommune] = useState(savedInfo?.commune || '');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [isCheckout, setIsCheckout] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState('');

  const discount = promoApplied ? total * PROMO_DISCOUNT : 0;
  const finalTotal = total - discount;

  const handleApplyPromo = () => {
    setPromoError('');
    if (promoCode.trim().toUpperCase() === VALID_PROMO_CODE) {
      setPromoApplied(true);
      toast.success('تم تطبيق الكوبون: -10%');
    } else {
      setPromoApplied(false);
      setPromoError('كود غير صالح');
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setPromoApplied(false);
    setPromoError('');
  };

  // Save customer info as they type
  useEffect(() => {
    if (customerName || phone !== '+213' || wilaya || commune) {
      saveCustomerInfo({ customerName, phone, wilaya, commune });
    }
  }, [customerName, phone, wilaya, commune]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-DZ').format(price) + ' دج';
  };

  const generateOrderId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    return `#ORD-${year}-${random}`;
  };

  const handleSubmitOrder = async () => {
    const validation = orderSchema.safeParse({ customerName, phone, wilaya, commune });
    
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

    setErrors({});
    
    try {
      await createOrder.mutateAsync({
        customerName,
        phone,
        wilaya,
        commune,
        paymentMethod,
        total: finalTotal,
        items,
      });
      
      // Prepare order data for success page
      const orderData = {
        orderId: generateOrderId(),
        customerName,
        phone,
        wilaya,
        commune,
        items: items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          selectedColor: item.selectedColor,
        })),
        total: finalTotal,
        discount: promoApplied ? discount : 0,
        createdAt: new Date().toISOString(),
      };
      
      // Save order to localStorage for persistence
      localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(orderData));
      
      clearCart();
      
      // Navigate to success page with order data
      navigate('/order-success', { state: orderData });
    } catch {
      toast.error('فشل إنشاء الطلب');
    }
  };

  if (items.length === 0 && !isCheckout) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-32 pb-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl text-foreground mb-4">سلة التسوق</h1>
            <p className="text-muted-foreground">سلة التسوق فارغة</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Tabs */}
          <div className="flex justify-center gap-8 mb-12">
            <button
              onClick={() => setIsCheckout(false)}
              className={`font-display text-xl transition-colors ${
                !isCheckout ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              السلة
            </button>
            <button
              onClick={() => items.length > 0 && setIsCheckout(true)}
              className={`font-display text-xl transition-colors ${
                isCheckout ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              إتمام الشراء
            </button>
          </div>

          <div className="grid lg:grid-cols-3 gap-8" dir="rtl">
            {/* Form / Cart Items */}
            <div className="lg:col-span-2">
              {!isCheckout ? (
                <div className="space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-card border border-border/50 rounded-lg p-4 flex gap-4"
                    >
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-display text-lg">{item.product.name}</h3>
                        <p className="text-muted-foreground text-sm">{item.product.brand}</p>
                        <p className="text-primary font-semibold mt-2">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2 bg-secondary rounded">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-2 hover:text-primary transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-2 hover:text-primary transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-card border border-border/50 rounded-lg p-6">
                  <h2 className="font-display text-2xl mb-6">تفاصيل الشحن والدفع</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm mb-2">الاسم الكامل</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                        maxLength={100}
                      />
                      {errors.customerName && (
                        <p className="text-destructive text-sm mt-1">{errors.customerName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm mb-2">رقم الهاتف (+213)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                        dir="ltr"
                      />
                      {errors.phone && (
                        <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm mb-2">الولاية</label>
                      <WilayaSelect
                        value={wilaya}
                        onChange={setWilaya}
                        error={errors.wilaya}
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-2">Commune / البلدية</label>
                      <input
                        type="text"
                        value={commune}
                        onChange={(e) => setCommune(e.target.value)}
                        placeholder="اكتب اسم البلدية"
                        className="w-full bg-background border border-border rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                        maxLength={100}
                      />
                      {errors.commune && (
                        <p className="text-destructive text-sm mt-1">{errors.commune}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                      <button
                        onClick={() => setPaymentMethod('cod')}
                        className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
                          paymentMethod === 'cod'
                            ? 'border-primary bg-primary/10'
                            : 'border-border'
                        }`}
                      >
                        <Truck className="w-8 h-8 text-primary" />
                        <span>الدفع عند الاستلام</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('card')}
                        className={`p-6 rounded-lg border-2 transition-all flex flex-col items-center gap-3 ${
                          paymentMethod === 'card'
                            ? 'border-primary bg-primary/10'
                            : 'border-border'
                        }`}
                      >
                        <CreditCard className="w-8 h-8 text-primary" />
                        <span>CIB / Edahabia</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border/50 rounded-lg p-6 sticky top-24">
                <h2 className="font-display text-2xl mb-6">ملخص الطلب</h2>

                <div className="space-y-4 max-h-64 overflow-auto">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-muted-foreground text-xs">الكمية: {item.quantity}</p>
                      </div>
                      <p className="text-primary text-sm">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Promo Code Section */}
                <div className="border-t border-border/50 mt-6 pt-6">
                  <label className="block text-sm mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    كود الخصم
                  </label>
                  {promoApplied ? (
                    <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3">
                      <div className="flex items-center gap-2 text-green-500">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">تم تطبيق الكوبون: -10%</span>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setPromoError('');
                        }}
                        placeholder="أدخل كود الخصم"
                        className="flex-1 bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary text-sm"
                        dir="ltr"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                      >
                        تطبيق
                      </button>
                    </div>
                  )}
                  {promoError && (
                    <p className="text-destructive text-sm mt-2">{promoError}</p>
                  )}
                </div>

                <div className="border-t border-border/50 mt-6 pt-6 space-y-3">
                  <div className="flex justify-between text-muted-foreground">
                    <span>المجموع الفرعي</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  {promoApplied && (
                    <div className="flex justify-between text-green-500">
                      <span>الخصم (10%)</span>
                      <span>- {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>الشحن</span>
                    <span className="text-green-500">(مجاني)</span>
                  </div>
                  <div className="flex justify-between text-xl font-display pt-3 border-t border-border/50">
                    <span>الإجمالي:</span>
                    <span className="text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                <button
                  onClick={isCheckout ? handleSubmitOrder : () => setIsCheckout(true)}
                  disabled={createOrder.isPending}
                  className="btn-luxury w-full mt-6 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {createOrder.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isCheckout ? (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      تأكيد الطلب
                    </>
                  ) : (
                    'متابعة الشراء'
                  )}
                </button>

                {isCheckout && (
                  <p className="text-center text-muted-foreground text-xs mt-4 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    ضمان الأصالة
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
