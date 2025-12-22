import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
const Footer = () => {
  return <footer className="bg-card border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Social Links */}
          <div className="flex items-center gap-6">
            <img src="/logo.png" alt="Timeless" className="h-10 w-auto object-contain" />
            <div className="flex items-center gap-4">
              <a href="#" className="p-2 hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div className="flex items-center gap-2">
            <input type="email" placeholder="اشترك في النشرة البريدية" className="bg-background border border-border rounded-sm px-4 py-2 text-sm focus:outline-none focus:border-primary w-64" dir="rtl" />
            <button className="btn-luxury text-xs px-4 py-2">
              اشتراك
            </button>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2025 Timeless Watches. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors">
              سياسة الخصوصية
            </Link>
            <Link to="/terms-conditions" className="hover:text-primary transition-colors">
              الشروط والأحكام
            </Link>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;