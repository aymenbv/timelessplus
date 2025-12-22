import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useState, useRef, useCallback } from 'react';
import heroImage from '@/assets/hero-watch.jpg';

const HeroSection = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    
    setTilt({
      x: y * 10,
      y: -x * 15,
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* Spotlight Background */}
      <div className="absolute inset-0 spotlight-bg" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--gold) / 0.3) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--gold) / 0.3) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
          {/* Watch Image with Floating Animation */}
          <motion.div
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative cursor-pointer"
            style={{ perspective: '1000px' }}
          >
            <motion.div
              className="floating-luxury watch-glow"
              animate={{
                rotateX: tilt.x,
                rotateY: tilt.y,
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <img
                src={heroImage}
                alt="Luxury Rolex Watch"
                className="w-[300px] md:w-[400px] lg:w-[500px] h-auto object-contain"
              />
            </motion.div>
            
            {/* Reflection effect */}
            <div 
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-gradient-to-t from-primary/20 to-transparent rounded-full blur-2xl"
            />
          </motion.div>

          {/* Text Content */}
          <div className="text-center lg:text-right">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="font-display text-5xl md:text-7xl lg:text-8xl text-foreground mb-6"
            >
              <span className="text-gradient-gold">Elegance</span>
              <br />
              on Your Wrist
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto lg:mx-0 lg:ml-auto mb-8"
            >
              اكتشف مجموعتنا الحصرية من أرقى الساعات العالمية
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              <Link to="/products" className="btn-luxury inline-block glow-gold">
                استكشف الآن
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
