import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Smartphone, Wifi, Zap, CheckCircle2, Share, MoreVertical, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check platform
    const userAgent = navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
    }
    
    setDeferredPrompt(null);
  };

  const features = [
    {
      icon: Smartphone,
      title: 'تجربة تطبيق أصلي',
      description: 'استمتع بتجربة سلسة تشبه التطبيقات الأصلية مباشرة من متصفحك'
    },
    {
      icon: Wifi,
      title: 'العمل بدون إنترنت',
      description: 'تصفح المنتجات وعربة التسوق حتى بدون اتصال بالإنترنت'
    },
    {
      icon: Zap,
      title: 'تحميل فوري',
      description: 'تطبيق سريع البدء بفضل التخزين المؤقت الذكي'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <img 
                src="/pwa-192x192.png" 
                alt="Timeless App Icon" 
                className="w-16 h-16 rounded-2xl"
              />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ثبّت تطبيق Timeless
            </h1>
            
            <p className="text-muted-foreground text-lg mb-8">
              احصل على تجربة تسوق أفضل مع تطبيقنا المثبت على جهازك
            </p>

            {isInstalled ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="inline-flex items-center gap-2 bg-green-500/10 text-green-500 px-6 py-3 rounded-full"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">تم تثبيت التطبيق بنجاح!</span>
              </motion.div>
            ) : deferredPrompt ? (
              <Button
                onClick={handleInstall}
                size="lg"
                className="gap-2 px-8"
              >
                <Download className="w-5 h-5" />
                تثبيت التطبيق
              </Button>
            ) : (
              <div className="text-muted-foreground">
                اتبع الخطوات أدناه لتثبيت التطبيق
              </div>
            )}
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6 text-center"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Installation Instructions */}
          {!isInstalled && !deferredPrompt && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                كيفية التثبيت
              </h2>

              {isIOS ? (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">
                      iOS
                    </span>
                    لأجهزة iPhone و iPad
                  </h3>
                  <ol className="space-y-4 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">1</span>
                      <span>اضغط على زر المشاركة <Share className="w-4 h-4 inline mx-1" /> في شريط المتصفح</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">2</span>
                      <span>مرر للأسفل واضغط على "إضافة إلى الشاشة الرئيسية" <Plus className="w-4 h-4 inline mx-1" /></span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">3</span>
                      <span>اضغط "إضافة" في أعلى الشاشة</span>
                    </li>
                  </ol>
                </div>
              ) : isAndroid ? (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary text-sm font-bold">
                      🤖
                    </span>
                    لأجهزة Android
                  </h3>
                  <ol className="space-y-4 text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">1</span>
                      <span>اضغط على قائمة المتصفح <MoreVertical className="w-4 h-4 inline mx-1" /> (النقاط الثلاث)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">2</span>
                      <span>اضغط على "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية"</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">3</span>
                      <span>اضغط "تثبيت" للتأكيد</span>
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-4">لمتصفح Chrome</h3>
                    <ol className="space-y-3 text-muted-foreground text-sm">
                      <li className="flex items-start gap-3">
                        <span className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">1</span>
                        <span>اضغط على أيقونة التثبيت في شريط العنوان</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">2</span>
                        <span>أو اضغط على القائمة ← "تثبيت Timeless"</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="font-semibold text-foreground mb-4">لمتصفح Edge</h3>
                    <ol className="space-y-3 text-muted-foreground text-sm">
                      <li className="flex items-start gap-3">
                        <span className="w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">1</span>
                        <span>اضغط على القائمة ← "التطبيقات" ← "تثبيت هذا الموقع كتطبيق"</span>
                      </li>
                    </ol>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Install;
