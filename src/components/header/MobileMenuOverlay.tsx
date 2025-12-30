import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

type NavLink = { name: string; path: string };

type Props = {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
};

const MobileMenuOverlay = ({ open, onClose, navLinks }: Props) => {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Full-screen deep black background as requested (#0F0F0F) */}
          <div className="absolute inset-0 bg-[#0F0F0F]" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative h-full flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="القائمة"
          >
            {/* Header with logo and close button */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/30">
              <img
                src="/logo.png"
                alt="Timeless"
                className="h-10 w-auto object-contain"
              />
              <button
                onClick={onClose}
                className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:text-primary transition-colors"
                aria-label="إغلاق القائمة"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation links - full screen centered with 44px touch targets */}
            <nav className="flex-1 flex flex-col items-center justify-center gap-6 px-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="w-full text-center"
                >
                  <Link
                    to={link.path}
                    onClick={onClose}
                    className="font-display text-xl sm:text-2xl text-foreground hover:text-primary transition-colors block py-3 min-h-[44px]"
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default MobileMenuOverlay;
