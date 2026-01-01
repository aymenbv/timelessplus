import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
const HeroSection = () => {
  // Cache-bust the hero video so browsers fetch the latest uploaded file
  const heroVideoSrc = useMemo(() => `/hero-video.mp4?v=${Date.now()}`, []);
  return <section className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Video Background with Poster for LCP optimization */}
      <div className="absolute inset-0 z-0">
        <video autoPlay muted loop playsInline preload="auto" poster="/hero-poster.webp" className="w-full h-full object-cover">
          {/* WebM for better compression, MP4 as fallback */}
          <source src="/hero-video.webm" type="video/webm" />
          <source src={heroVideoSrc} type="video/mp4" />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background/60" />
      </div>

      {/* Content - with proper padding to prevent edge touching */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center">
          {/* Mobile-first typography: small base, scales up */}
          <motion.h1 initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl text-foreground mb-4 sm:mb-6 leading-tight">
            <span className="text-gradient-gold">أناقة</span>
            <br />
            على معصمك
          </motion.h1>
          
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.4
        }} className="text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mx-auto mb-8 sm:mb-12 text-yellow-500">
            اكتشف مجموعتنا الحصرية من أرقى الساعات العالمية
          </motion.p>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.6
        }}>
            <Link to="/products" className="btn-luxury inline-flex items-center gap-2 glow-gold min-h-[44px]">
              استكشف الآن
            </Link>
          </motion.div>
        </div>
      </div>
    </section>;
};
export default HeroSection;