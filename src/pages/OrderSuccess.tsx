import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Check, Printer, MessageCircle, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

const LAST_ORDER_KEY = 'timeless_last_order';
const WHATSAPP_NUMBER = '213562341417';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  selectedColor?: string;
}

interface OrderData {
  orderId: string;
  customerName: string;
  phone: string;
  wilaya: string;
  commune: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}

const loadOrderFromStorage = (): OrderData | null => {
  try {
    const stored = localStorage.getItem(LAST_ORDER_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load order from localStorage:', e);
  }
  return null;
};

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Try to get order from navigation state first, then fallback to localStorage
  const stateData = location.state as OrderData | null;
  const orderData = stateData || loadOrderFromStorage();

  if (!orderData) {
    return <Navigate to="/" replace />;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('ar-DZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const itemsList = orderData.items
      .map((item) => `- ${item.name} (x${item.quantity})`)
      .join('\n');

    const message = `Hello, I just placed order ${orderData.orderId}. Here are my details...

📦 Order Confirmation

Name: ${orderData.customerName}
Phone: ${orderData.phone}
Address: ${orderData.wilaya}, ${orderData.commune}

----------------
Items:
${itemsList}
----------------

Total: ${formatPrice(orderData.total)} DZD
Order ID: ${orderData.orderId}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4 print:bg-white print:py-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        {/* Receipt Card */}
        <div className="bg-card border-2 border-dashed border-primary rounded-2xl overflow-hidden shadow-2xl print:border-solid print:border-foreground/20">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 text-center border-b border-dashed border-primary/50">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Check className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground mb-2">شكراً لطلبك!</h1>
            <p className="text-muted-foreground text-sm">تم استلام طلبك بنجاح</p>
          </div>

          {/* Order Reference */}
          <div className="p-6 border-b border-dashed border-primary/30">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">رقم الطلب</span>
              <span className="font-mono font-bold text-primary text-lg">{orderData.orderId}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-muted-foreground text-sm">التاريخ</span>
              <span className="text-foreground text-sm">{formatDate(orderData.createdAt)}</span>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-6 border-b border-dashed border-primary/30">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">معلومات العميل</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الاسم</span>
                <span className="text-foreground font-medium">{orderData.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الهاتف</span>
                <span className="text-foreground font-medium" dir="ltr">{orderData.phone}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-6 border-b border-dashed border-primary/30">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">عنوان الشحن</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">الولاية</span>
                <span className="text-foreground font-medium">{orderData.wilaya}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">البلدية</span>
                <span className="text-foreground font-medium">{orderData.commune}</span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="p-6 border-b border-dashed border-primary/30">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wider">المنتجات</h3>
            <div className="space-y-3">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className="text-foreground font-medium text-sm">{item.name}</p>
                    {item.selectedColor && (
                      <p className="text-muted-foreground text-xs">اللون: {item.selectedColor}</p>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-muted-foreground text-xs">x{item.quantity}</p>
                    <p className="text-foreground font-medium text-sm">{formatPrice(item.price * item.quantity)} د.ج</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="p-6 bg-gradient-to-br from-primary/10 to-transparent">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-foreground">المجموع الكلي</span>
              <span className="text-2xl font-bold text-primary">{formatPrice(orderData.total)} د.ج</span>
            </div>
          </div>

          {/* Decorative Bottom Edge */}
          <div className="h-4 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-3 print:hidden">
          <button
            onClick={handlePrint}
            className="w-full flex items-center justify-center gap-3 bg-card border border-border hover:border-primary text-foreground py-3 px-6 rounded-xl transition-all duration-300 hover:bg-primary/5"
          >
            <Printer className="w-5 h-5" />
            <span>طباعة الفاتورة</span>
          </button>

          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-6 rounded-xl transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5" />
            <span>إرسال عبر واتساب</span>
          </button>

          <button
            onClick={() => navigate('/products')}
            className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary/90 text-primary-foreground py-3 px-6 rounded-xl transition-all duration-300"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>العودة للمتجر</span>
          </button>
        </div>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 text-center text-sm text-muted-foreground">
          <p>شكراً لتسوقكم معنا</p>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
