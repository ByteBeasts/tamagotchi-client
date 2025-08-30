import React, { useEffect, useRef } from 'react';
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
  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Handle Google login click
  const handleGoogleClick = () => {
    // Try to click the hidden Cavos button directly
    const cavosButton = googleButtonRef.current?.querySelector('button');
    if (cavosButton) {
      cavosButton.click();
    } else {
      // Fallback to the original method
      onGoogleLogin();
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store original values
      const originalOverflow = document.body.style.overflow;
      const originalTouchAction = document.body.style.touchAction;
      
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      return () => {
        // Restore original values or use CSS default
        document.body.style.overflow = originalOverflow || 'hidden'; // Keep original CSS setting
        document.body.style.touchAction = originalTouchAction || 'manipulation'; // Keep original CSS setting
      };
    }
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
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 overflow-hidden"
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
        className="bg-cream w-full max-w-md rounded-2xl shadow-[0_8px_0_rgba(0,0,0,0.2)] overflow-hidden border-4 border-gold/30 mx-4"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        style={{ touchAction: 'auto', maxHeight: '80vh' }}
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
              <div className="w-full">
                {/* Cavos Component for OAuth handling - positioned off-screen */}
                <div ref={googleButtonRef} style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden' }}>
                  <SignInWithGoogle
                    appId={import.meta.env.VITE_CAVOS_APP_ID || ""}
                    network={import.meta.env.VITE_CAVOS_DEFAULT_NETWORK || "mainnet"}
                    finalRedirectUri={`${window.location.origin}/auth/callback`}
                    text="Continue with Google"
                  />
                </div>
                
                {/* Custom Styled Button */}
                <motion.button
                  onClick={handleGoogleClick}
                  className="btn-cr-yellow w-full text-gray-800 text-lg py-3 px-6 focus:outline-none -translate-y-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  <div className="flex items-center justify-center gap-3">
                    {/* Google Icon */}
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="flex-shrink-0"
                    >
                      <path 
                        fill="#4285F4" 
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path 
                        fill="#34A853" 
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path 
                        fill="#FBBC05" 
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path 
                        fill="#EA4335" 
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)] translate-y-[3px]">
                      CONTINUE WITH GOOGLE
                    </span>
                  </div>
                </motion.button>
              </div>
            ) : (
              <div className="w-full bg-gold/20 rounded-xl p-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-800/30 border-t-gray-800 mr-3"></div>
                <span className="text-gray-800 font-rubik">Processing authentication...</span>
              </div>
            )}
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