import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { SignInWithGoogle } from 'cavos-service-sdk';
import closeIcon from "../../../../assets/icons/extras/icon-close.webp";

interface BrowserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => void;
  isLoading?: boolean;
}

export const BrowserLoginModal: React.FC<BrowserLoginModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
  isLoading = false
}) => {
  // Handle Google login click
  const handleGoogleClick = () => {
    onGoogleLogin();
  };

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
    if (!isLoading) {
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
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
            SIGN IN
          </h2>
          {!isLoading && (
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
          )}
        </div>

        {/* Body */}
        <div className="p-6 bg-gradient-to-b from-cream to-cream/80">
          {/* Info message */}
          <div className="mb-8 text-center">
            <p className="text-gray-800 font-luckiest text-lg mb-2">
              Welcome to ByteBeasts!
            </p>
            <p className="text-gray-700 font-rubik text-base leading-relaxed">
              Sign in with your Google account to start your adventure
            </p>
          </div>

          {/* Google Sign In Button */}
          <div className="flex flex-col items-center space-y-4">
            {!isLoading ? (
              <div className="w-full" onClick={handleGoogleClick}>
                <SignInWithGoogle
                  appId={import.meta.env.VITE_CAVOS_APP_ID || ""}
                  network={import.meta.env.VITE_CAVOS_DEFAULT_NETWORK || "mainnet"}
                  finalRedirectUri={`${window.location.origin}/auth/callback`}
                  text="Continue with Google"
                />
              </div>
            ) : (
              <div className="w-full bg-gold/20 rounded-xl p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-800/30 border-t-gray-800 mr-3"></div>
                <span className="text-gray-800 font-rubik">Processing authentication...</span>
              </div>
            )}
          </div>

          {/* Additional info */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 font-rubik text-sm">
              Your wallet will be automatically created and managed by ByteBeasts
            </p>
          </div>
        </div>

        {/* Footer - Privacy note */}
        <div className="p-4 bg-gold/10 border-t-4 border-gold/30">
          <p className="text-center text-xs text-gray-600 font-rubik">
            By signing in, you agree to ByteBeasts' Terms of Service and Privacy Policy
          </p>
        </div>
      </motion.div>
    </div>
  );
};