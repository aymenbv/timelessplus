import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';

const PrivacyPolicy = () => {
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
              Privacy Policy
            </h1>
            
            <p className="text-muted-foreground italic mb-8">
              Last Updated: December 2025
            </p>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                1. Important Disclaimer
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                <strong className="text-foreground">TIMELESS</strong> is a concept e-commerce project created for{' '}
                <strong className="text-foreground">academic purposes</strong> at the University of El Oued. 
                This is not a live commercial entity. No real payments are processed, and no real products 
                are shipped. Any personal data entered is for demonstration purposes only.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                2. Information We Collect
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                We collect information to simulate the e-commerce experience, including:
              </p>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>Name and Contact Information (Email, Phone Number).</li>
                <li>Shipping Address (Province, City).</li>
                <li>Order Details and Preferences.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                3. How We Use Your Information
              </h2>
              <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                <li>To process simulated orders.</li>
                <li>To improve our store's functionality.</li>
                <li>To communicate with you via WhatsApp or Email regarding your order.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                4. Cookies
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies to enhance your browsing experience, such as keeping items in your 
                shopping cart and remembering your login status.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                5. Third-Party Services
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                We use <strong className="text-foreground">Supabase</strong> for secure data storage. 
                We do not share your personal data with advertisers.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold text-primary mb-4">
                6. Contact Us
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this project or our privacy practices, please contact 
                us via the <a href="/contact" className="text-primary hover:underline font-medium">Contact Us</a> page.
              </p>
            </section>
          </motion.article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
