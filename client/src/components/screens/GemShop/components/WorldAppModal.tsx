import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import closeIcon from "../../../../assets/icons/extras/icon-close.webp";

interface WorldAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorldAppModal: React.FC<WorldAppModalProps> = ({
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

  // Handlers with touch support
  const handleOpenWorldApp = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    window.open('https://world.org/es-la/ecosystem/app_93c36e3e23e473bd788e318679a786d9', '_blank', 'noopener,noreferrer');
  };

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
            WORLD APP REQUIRED
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
          {/* Main Message */}
          <div className="text-center space-y-4">
            <h3 className="text-gray-800 font-luckiest text-xl">
              Gem purchases require World App
            </h3>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-1 px-6 pb-6 bg-gold/10">
          <motion.button
            onClick={handleOpenWorldApp}
            onTouchStart={handleOpenWorldApp}
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
              OPEN IN WORLD APP
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};