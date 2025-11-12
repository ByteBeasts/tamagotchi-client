// ================================================================
// ANNOUNCEMENT MODAL
// Reusable modal component for feature announcements and updates
// ================================================================

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import closeIcon from '../../assets/icons/extras/icon-close.webp';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: string;
  children: React.ReactNode;
  ctaText?: string;
  onCtaClick?: () => void;
}

export const AnnouncementModal = ({
  isOpen,
  onClose,
  title,
  icon = '🎉',
  children,
  ctaText,
  onCtaClick
}: AnnouncementModalProps) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);

  const handleClose = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  const handleCtaClick = () => {
    if (onCtaClick) {
      onCtaClick();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={handleBackdropClick}
        onTouchStart={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-cream w-full max-w-lg rounded-3xl shadow-2xl border-4 border-gold overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with animated gradient background */}
          <div className="bg-gold-gradient p-6 border-b-4 border-gold/50 relative overflow-hidden">
            {/* Animated shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-transparent to-yellow-400/20 animate-shimmer" />

            {/* Close button */}
            <motion.button
              onClick={handleClose}
              onTouchStart={handleClose}
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full
                hover:bg-black/10 active:bg-black/20 transition-colors z-10"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <img src={closeIcon} alt="Close" className="w-8 h-8" />
            </motion.button>

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="w-20 h-20 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full border-4 border-white/50">
                <span className="text-5xl">{icon}</span>
              </div>
            </motion.div>

            {/* Title */}
            <h2 className="text-gray-800 font-luckiest text-2xl sm:text-3xl text-center drop-shadow-md relative z-10">
              {title}
            </h2>
          </div>

          {/* Content */}
          <div className="p-6 bg-gradient-to-b from-cream to-cream/90">
            <div className="text-gray-700 font-rubik text-base leading-relaxed space-y-4">
              {children}
            </div>
          </div>

          {/* Footer with CTA button */}
          <div className="p-6 bg-cream/50 border-t border-gold/20 flex gap-3">
            {ctaText && onCtaClick ? (
              <>
                <motion.button
                  onClick={handleClose}
                  className="flex-1 bg-gray-300 text-gray-800 font-luckiest text-base py-3 px-6 rounded-xl
                    shadow-[0_4px_0_rgba(0,0,0,0.15)] hover:shadow-[0_2px_0_rgba(0,0,0,0.15)]
                    active:shadow-none active:translate-y-1 transition-all duration-150"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  CLOSE
                </motion.button>

                <motion.button
                  onClick={handleCtaClick}
                  className="flex-1 bg-gold-gradient text-gray-800 font-luckiest text-base py-3 px-6 rounded-xl
                    shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)]
                    active:shadow-none active:translate-y-1 transition-all duration-150"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {ctaText}
                </motion.button>
              </>
            ) : (
              <motion.button
                onClick={handleClose}
                className="w-full bg-gold-gradient text-gray-800 font-luckiest text-base py-3 px-6 rounded-xl
                  shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)]
                  active:shadow-none active:translate-y-1 transition-all duration-150"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                GOT IT!
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
