import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-[800px] mx-auto prose prose-invert"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Terms and Conditions
            </h1>
            
            <p className="text-muted-foreground italic mb-8">
              Last Updated: December 2025
            </p>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                1. Introduction & Academic Disclaimer
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Welcome to <strong className="text-foreground">TIMELESS</strong>. By accessing this website, you agree to these terms.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">IMPORTANT NOTICE:</strong> This website is a{' '}
                <strong className="text-foreground">university project</strong> for the Marketing Department at the University of El Oued. 
                No actual commercial transactions take place, and no physical goods will be shipped.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                2. Product Information
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to display the colors and images of our products (Rolex, Patek Philippe, etc.) as accurately as possible. 
                However, we cannot guarantee that your monitor's display of any color will be accurate.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                3. Pricing and Currency
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                All prices are displayed in <strong className="text-foreground">Algerian Dinar (DZD)</strong>. 
                Prices are for demonstration purposes only and do not reflect the actual market value of these luxury items.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                4. Orders and Cancellation
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to refuse any order (simulated) you place with us. In a real-world scenario, 
                we would reserve the right to limit quantities purchased per person.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                5. Intellectual Property
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                All content on this site, including text, graphics, logos, and images, is the property of the project creators 
                (Mohammed, Islam, Ammar, Aymen) or used for educational fair use.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                6. Governing Law
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                These Terms shall be governed by and defined following the laws of{' '}
                <strong className="text-foreground">Algeria</strong>.
              </p>
            </section>
          </motion.article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TermsConditions;
