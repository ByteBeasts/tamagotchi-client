import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import closeIcon from "../../assets/icons/extras/icon-close.webp";

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
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

  if (!isOpen) return null;

  const handleCloseClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onTouchStart={handleBackdropClick}
      style={{
        touchAction: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-cream w-[90%] max-w-md rounded-2xl shadow-[0_8px_0_rgba(0,0,0,0.2)] overflow-hidden border-4 border-gold/30"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{ touchAction: 'auto' }}
      >
        {/* Header */}
        <div className="bg-gold-gradient p-4 border-b-4 border-gold/40 flex justify-between items-center">
          <h2 className="text-gray-800 font-luckiest text-2xl tracking-wide drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
            IMPORTANT NOTICE
          </h2>
          <motion.button
            onClick={handleCloseClick}
            onTouchStart={handleCloseClick}
            className="transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gold/10 touch-manipulation"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <img src={closeIcon} alt="Close" className="w-8 h-8" />
          </motion.button>
        </div>

        {/* Body */}
        <div className="p-6 bg-gradient-to-b from-cream to-cream/80">
          <div className="mb-4 p-4 bg-orange-100 border-2 border-orange-300 rounded-xl">
            <div className="text-center mb-3">
              <span className="text-5xl">🔧</span>
            </div>
            <p className="text-orange-900 text-base font-rubik font-semibold text-center mb-2">
              We're experiencing technical difficulties
            </p>
            <p className="text-orange-800 text-sm font-rubik text-center leading-relaxed">
              ByteBeasts is currently experiencing some technical issues that are beyond our control.
              Our team is working hard to get everything back up and running as soon as possible!
            </p>
          </div>

          <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <p className="text-blue-900 text-sm font-rubik text-center leading-relaxed">
              <strong>Don't worry!</strong> Your ByteBeast and all your progress are safe and sound.
              Thank you for your patience while we fix things up!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gold/10 border-t-4 border-gold/30">
          <motion.button
            onClick={handleCloseClick}
            onTouchStart={handleCloseClick}
            className="bg-gold text-gray-800 w-full flex items-center justify-center gap-2 font-luckiest text-lg py-3 px-6 rounded-xl
              shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)]
              active:shadow-none active:translate-y-1
              transition-all duration-150 touch-manipulation"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">
              GOT IT!
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
