import { Link } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
const Footer = () => {
  return (
    <footer className="bg-card border-t border-border/50 py-8 md:py-12">
      <div className="container mx-auto px-4">
        {/* Mobile: Stack vertically, Desktop: Row layout */}
        <div className="grid grid-cols-1 gap-6 md:gap-8">
          {/* Logo & Social Links */}
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <img src="/logo.png" alt="Timeless" className="h-10 w-auto object-contain" />
            <div className="flex items-center gap-4">
              <a href="#" className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Newsletter - Stack on mobile */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 w-full">
            <input 
              type="email" 
              placeholder="اشترك في النشرة البريدية" 
              className="bg-background border border-border rounded-sm px-4 py-3 min-h-[44px] text-sm focus:outline-none focus:border-primary w-full sm:w-64" 
              dir="rtl" 
            />
            <button className="btn-luxury text-xs w-full sm:w-auto">
              اشتراك
            </button>
          </div>
        </div>

        {/* Bottom links - Stack on mobile */}
        <div className="border-t border-border/50 mt-6 md:mt-8 pt-6 md:pt-8 flex flex-col items-center gap-4 md:flex-row md:justify-between text-sm text-muted-foreground">
          <p className="text-center">© 2025 Timeless Watches. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy-policy" className="hover:text-primary transition-colors min-h-[44px] flex items-center">
              سياسة الخصوصية
            </Link>
            <Link to="/terms-conditions" className="hover:text-primary transition-colors min-h-[44px] flex items-center">
              الشروط والأحكام
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;