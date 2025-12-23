import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const HeroSection = () => {
  // Cache-bust the hero video so browsers fetch the latest uploaded file
  const heroVideoSrc = useMemo(() => `/hero-video.mp4?v=${Date.now()}`, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={heroVideoSrc} type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-background/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6">
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-foreground mb-4 sm:mb-6"
          >
            <span className="text-gradient-gold">أناقة</span>
            <br />
            على معصمك
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-6 sm:mb-8 px-2"
          >
            اكتشف مجموعتنا الحصرية من أرقى الساعات العالمية
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center"
          >
            <Link to="/products" className="btn-luxury inline-block glow-gold w-full sm:w-auto text-center">
              استكشف الآن
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
