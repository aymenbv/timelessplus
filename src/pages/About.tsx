import { motion } from 'framer-motion';
import { User } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const teamMembers = [
  { name: 'قرباتي محمد', role: 'Co-Founder' },
  { name: 'مبروكي اسلام', role: 'Co-Founder' },
  { name: 'حامدي عمار', role: 'Co-Founder' },
  { name: 'لحباكي ايمن', role: 'Co-Founder' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="font-display text-5xl md:text-7xl text-primary mb-6">
                رؤيتنا
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                نسعى لسد الفجوة بين الأناقة الخالدة والتكنولوجيا الحديثة.
                <br />
                مشروع وُلد من التميز الأكاديمي.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Decorative Divider */}
        <div className="flex justify-center">
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Team Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl md:text-5xl text-primary mb-4">
                المؤسسون
              </h2>
              <p className="text-muted-foreground text-lg">
                الفريق الذي يقف وراء هذا المشروع
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="group"
                >
                  <div className="bg-card border border-border/50 rounded-xl p-8 text-center transition-all duration-500 hover:border-primary hover:shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                    {/* Avatar Placeholder */}
                    <div className="w-28 h-28 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center border-2 border-border group-hover:border-primary transition-colors">
                      <User className="w-14 h-14 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    
                    {/* Name */}
                    <h3 className="font-display text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                      {member.name}
                    </h3>
                    
                    {/* Role */}
                    <p className="text-sm text-primary/80 tracking-wider uppercase">
                      {member.role}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Decorative Divider */}
        <div className="flex justify-center">
          <div className="w-48 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        {/* Supervisor Section */}
        <section className="py-24 px-4">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center"
            >
              <p className="text-muted-foreground text-lg mb-8 tracking-wide">
                تحت الإشراف المميز لـ
              </p>
              
              <div className="bg-card border border-primary/30 rounded-2xl p-12 shadow-[0_0_60px_rgba(212,175,55,0.1)]">
                {/* Supervisor Avatar */}
                <div className="w-32 h-32 mx-auto mb-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-2 border-primary">
                  <User className="w-16 h-16 text-primary" />
                </div>
                
                {/* Supervisor Name */}
                <h3 className="font-display text-3xl md:text-4xl text-primary mb-4">
                  د. ثامر محمد البشير
                </h3>
                
                {/* Supervisor Role */}
                <p className="text-muted-foreground text-lg">
                  المشرف الأكاديمي والمستشار
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Academic Note */}
        <section className="py-12 px-4 border-t border-border/50">
          <div className="container mx-auto text-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-muted-foreground text-sm tracking-wide"
            >
              مشروع جامعي - قسم التسويق - 2025
            </motion.p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
