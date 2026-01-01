import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { MessageCircle, Phone, MapPin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import Seo from '@/components/Seo';
import { seoConfig } from '@/config/seo';

const Contact = () => {
  const whatsappUrl = "https://api.whatsapp.com/send?phone=%2B213562341417";

  return (
    <div className="min-h-screen bg-background relative">
      <Seo 
        title={seoConfig.pages.contact.title}
        description={seoConfig.pages.contact.description}
        canonical="/contact"
      />
      {/* Video Background */}
      <div className="fixed inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/contact-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      <Header />
      
      <main className="pt-24 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              تواصل معنا
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              نحن هنا لمساعدتك. تواصل معنا عبر واتساب للحصول على استجابة سريعة
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* WhatsApp Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-card rounded-2xl p-8 shadow-lg border border-border"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageCircle className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  تواصل عبر واتساب
                </h2>
                <p className="text-muted-foreground mb-6">
                  أسرع طريقة للتواصل معنا. سنرد عليك في أقرب وقت ممكن
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white gap-2 w-full"
                >
                  <a 
                    href={whatsappUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="w-5 h-5" />
                    ابدأ المحادثة
                  </a>
                </Button>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-card rounded-xl p-6 shadow-md border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">الهاتف</h3>
                    <p className="text-muted-foreground" dir="ltr">+213 562 341 417</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-md border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">البريد الإلكتروني</h3>
                    <p className="text-muted-foreground">contact@timeless.dz</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-xl p-6 shadow-md border border-border">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">الموقع</h3>
                    <p className="text-muted-foreground">الجزائر</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
};

export default Contact;
