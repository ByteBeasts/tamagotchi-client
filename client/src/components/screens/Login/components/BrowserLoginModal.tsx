import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import closeIcon from "../../../../assets/icons/extras/icon-close.webp";

interface BrowserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (email: string, password: string) => void;
  isLoading?: boolean;
}

export const BrowserLoginModal: React.FC<BrowserLoginModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isValid, setIsValid] = useState(false);

  // Validate form
  useEffect(() => {
    const emailValid = email.includes('@') && email.includes('.') && email.length > 5;
    const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password);
    setIsValid(emailValid && passwordValid);
  }, [email, password]);

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

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setPassword('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid && !isLoading) {
      onSubmit(email, password);
    }
  };

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
            BROWSER LOGIN
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
        <form onSubmit={handleSubmit} className="p-6 bg-gradient-to-b from-cream to-cream/80">
          {/* Info message */}
          <div className="mb-6 text-center">
            <p className="text-gray-700 font-rubik text-base leading-relaxed">
              Create or login to your ByteBeasts account
            </p>
          </div>

          {/* Email field */}
          <div className="mb-4">
            <label className="block text-gray-800 font-luckiest text-sm mb-2 tracking-wide">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface/20 rounded-xl p-4 text-gray-800 font-rubik focus:outline-none 
                border-2 border-gold/30 focus:border-gold/60 shadow-inner backdrop-blur-sm
                placeholder:text-gray-500 text-sm disabled:opacity-50"
              placeholder="your-email@example.com"
              required
              style={{ touchAction: 'manipulation' }}
            />
          </div>

          {/* Password field */}
          <div className="mb-6">
            <label className="block text-gray-800 font-luckiest text-sm mb-2 tracking-wide">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full bg-surface/20 rounded-xl p-4 text-gray-800 font-rubik focus:outline-none 
                border-2 border-gold/30 focus:border-gold/60 shadow-inner backdrop-blur-sm
                placeholder:text-gray-500 text-sm disabled:opacity-50"
              placeholder="Min 8 chars, 1 upper & 1 lowercase"
              required
              minLength={8}
              style={{ touchAction: 'manipulation' }}
            />
          </div>

          {/* Validation indicator */}
          {(email || password) && (
            <div className="mb-4 space-y-1">
              <div className="flex items-center gap-2 text-sm font-rubik">
                <span className={email.includes('@') && email.includes('.') && email.length > 5 ? 'text-green-600' : 'text-gray-500'}>
                  {email.includes('@') && email.includes('.') && email.length > 5 ? '✅' : '⭕'} Valid email
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-rubik">
                <span className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                  {password.length >= 8 ? '✅' : '⭕'} 8+ characters
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-rubik">
                <span className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                  {/[A-Z]/.test(password) ? '✅' : '⭕'} 1 uppercase letter
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm font-rubik">
                <span className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                  {/[a-z]/.test(password) ? '✅' : '⭕'} 1 lowercase letter
                </span>
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 bg-gold/10 border-t-4 border-gold/30">
          <motion.button
            type="submit"
            onClick={handleSubmit}
            disabled={!isValid || isLoading}
            className="bg-gold text-gray-800 w-full flex items-center justify-center gap-2 font-luckiest text-lg py-3 px-6 rounded-xl
              shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] 
              active:shadow-none active:translate-y-1
              transition-all duration-150 touch-manipulation
              disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
            whileHover={isValid && !isLoading ? { scale: 1.02 } : {}}
            whileTap={isValid && !isLoading ? { scale: 0.98 } : {}}
            style={{ 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              cursor: isValid && !isLoading ? 'pointer' : 'not-allowed'
            }}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-800/30 border-t-gray-800"></div>
                <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">
                  CONNECTING...
                </span>
              </>
            ) : (
              <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">
                {isValid ? 'START YOUR JOURNEY' : 'FILL ALL FIELDS'}
              </span>
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};