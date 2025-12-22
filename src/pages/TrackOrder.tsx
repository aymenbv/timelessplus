import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, CheckCircle2, Truck, Home, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TrackingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'active' | 'pending';
  date?: string;
}

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [isTracking, setIsTracking] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const trackingSteps: TrackingStep[] = [
    {
      id: 1,
      title: 'تم استلام الطلب',
      description: 'تم تأكيد طلبك بنجاح',
      icon: <Package className="w-5 h-5" />,
      status: 'completed',
      date: '20 ديسمبر 2025 - 10:30 ص'
    },
    {
      id: 2,
      title: 'قيد المعالجة',
      description: 'يتم تجهيز طلبك للشحن',
      icon: <CheckCircle2 className="w-5 h-5" />,
      status: 'completed',
      date: '20 ديسمبر 2025 - 02:15 م'
    },
    {
      id: 3,
      title: 'تم الشحن',
      description: 'طلبك في الطريق إليك',
      icon: <Truck className="w-5 h-5" />,
      status: 'active',
      date: '21 ديسمبر 2025 - 09:00 ص'
    },
    {
      id: 4,
      title: 'تم التوصيل',
      description: 'تم تسليم الطلب بنجاح',
      icon: <Home className="w-5 h-5" />,
      status: 'pending'
    }
  ];

  const handleTrack = () => {
    if (!orderId.trim()) return;
    setIsTracking(true);
    // Simulate loading
    setTimeout(() => {
      setIsTracking(false);
      setShowResult(true);
    }, 1500);
  };

  const getStepStyles = (status: TrackingStep['status']) => {
    switch (status) {
      case 'completed':
        return {
          dot: 'bg-primary border-primary',
          line: 'bg-primary',
          icon: 'text-primary-foreground',
          title: 'text-foreground',
          description: 'text-muted-foreground'
        };
      case 'active':
        return {
          dot: 'bg-green-500 border-green-500',
          line: 'bg-border',
          icon: 'text-white',
          title: 'text-foreground font-bold',
          description: 'text-green-600 dark:text-green-400'
        };
      case 'pending':
        return {
          dot: 'bg-secondary border-border',
          line: 'bg-border',
          icon: 'text-muted-foreground',
          title: 'text-muted-foreground',
          description: 'text-muted-foreground/70'
        };
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <Header />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Truck className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">تتبع طلبك</h1>
            <p className="text-muted-foreground">أدخل رقم الطلب لمعرفة حالة الشحن</p>
          </motion.div>

          {/* Search Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-lg mb-8"
          >
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="أدخل رقم الطلب (مثال: #ORD-8842)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                  className="pr-10 h-12 text-base"
                />
              </div>
              <Button 
                onClick={handleTrack}
                disabled={isTracking || !orderId.trim()}
                className="h-12 px-6"
              >
                {isTracking ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full"
                  />
                ) : (
                  'تتبع'
                )}
              </Button>
            </div>
          </motion.div>

          {/* Result Section */}
          <AnimatePresence>
            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="space-y-6"
              >
                {/* Order Info Card */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                    <div>
                      <p className="text-sm text-muted-foreground">رقم الطلب</p>
                      <p className="text-lg font-bold text-foreground">#{orderId.replace('#', '').toUpperCase() || 'ORD-8842'}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                      </span>
                      <span className="text-sm font-medium">قيد التوصيل</span>
                    </div>
                  </div>

                  {/* Status Message */}
                  <div className="flex items-start gap-3 bg-primary/5 rounded-xl p-4 mb-6">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-foreground font-medium">طلبك حاليًا مع مندوب التوصيل</p>
                      <p className="text-muted-foreground text-sm">سيتم توصيله إلى ولاية الجزائر خلال 24 ساعة</p>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="relative">
                    {trackingSteps.map((step, index) => {
                      const styles = getStepStyles(step.status);
                      const isLast = index === trackingSteps.length - 1;

                      return (
                        <div key={step.id} className="relative flex gap-4">
                          {/* Timeline Line & Dot */}
                          <div className="flex flex-col items-center">
                            <motion.div 
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.15 }}
                              className={`relative z-10 w-10 h-10 rounded-full border-2 flex items-center justify-center ${styles.dot}`}
                            >
                              {step.status === 'active' && (
                                <span className="absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-30 animate-ping"></span>
                              )}
                              <span className={styles.icon}>{step.icon}</span>
                            </motion.div>
                            {!isLast && (
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: 60 }}
                                transition={{ delay: index * 0.15 + 0.1 }}
                                className={`w-0.5 ${styles.line}`}
                              />
                            )}
                          </div>

                          {/* Content */}
                          <motion.div 
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15 }}
                            className={`pb-8 ${isLast ? 'pb-0' : ''}`}
                          >
                            <h3 className={`text-base ${styles.title}`}>{step.title}</h3>
                            <p className={`text-sm ${styles.description}`}>{step.description}</p>
                            {step.date && (
                              <p className="text-xs text-muted-foreground/60 mt-1">{step.date}</p>
                            )}
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Help Section */}
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">
                    هل لديك استفسار؟{' '}
                    <a href="/contact" className="text-primary hover:underline">تواصل معنا</a>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackOrder;
