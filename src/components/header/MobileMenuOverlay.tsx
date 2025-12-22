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
          {/* Opaque backdrop (no animation so the hero video never bleeds through) */}
          <div className="absolute inset-0 bg-[#0a0a0a]" />

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="relative h-full"
            role="dialog"
            aria-modal="true"
            aria-label="القائمة"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <img
                src="/logo.png"
                alt="Timeless"
                className="h-12 w-auto object-contain"
              />
              <button
                onClick={onClose}
                className="p-2 hover:text-primary transition-colors"
                aria-label="إغلاق القائمة"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Link
                    to={link.path}
                    onClick={onClose}
                    className="font-display text-2xl text-primary hover:text-gold-light transition-colors"
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
