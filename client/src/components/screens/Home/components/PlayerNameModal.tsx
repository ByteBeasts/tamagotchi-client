import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import closeIcon from "../../../../assets/icons/extras/icon-close.webp";
import gemIcon from "../../../../assets/icons/gems/icon-gem-single.webp";

interface PlayerNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
  currentName?: string;
  playerGems?: number;
  error?: string | null;
}

export const PlayerNameModal = ({ isOpen, onClose, onSubmit, currentName, playerGems = 0, error: externalError }: PlayerNameModalProps) => {
  // Clean currentName to ensure no null/invisible characters
  const cleanedCurrentName = currentName?.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim() || "";
  
  const [name, setName] = useState(cleanedCurrentName);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      // Use cleaned name to avoid showing invisible characters
      const cleanName = currentName?.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim() || "";
      setName(cleanName);
      setError("");
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      // Focus input after a small delay to ensure keyboard opens on mobile
      setTimeout(() => {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input) {
          input.focus();
          // On iOS, we need to trigger the click event to open keyboard
          if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            input.click();
          }
        }
      }, 100);
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen, currentName]);
  
  // Update error when external error changes
  useEffect(() => {
    if (externalError) {
      setError(externalError);
    }
  }, [externalError]);

  const handleSubmit = () => {
    const trimmedName = name.trim();
    
    if (!trimmedName) {
      setError("Please enter a name");
      return;
    }
    
    if (trimmedName.length > 30) {
      setError("Name must be 30 characters or less");
      return;
    }
    
    if (playerGems < 5) {
      setError("Not enough gems (5 required)");
      return;
    }
    
    onSubmit(trimmedName);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      onClose();
    }
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

  if (!isOpen) return null;

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
            {currentName ? "RENAME PLAYER" : "NAME YOUR PLAYER"}
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
          <div className="mb-4 p-3">
            <div className="flex items-center gap-2">
              <p className="text-gray-800 text-sm font-rubik flex-1">
                {currentName 
                  ? `Renaming costs:`
                  : "Naming your player costs:"}
              </p>
              <div className="flex items-center gap-1">
                <img src={gemIcon} alt="Gem" className="w-4 h-4" />
                <span className="text-gray-800 font-bold">5</span>
              </div>
            </div>
            {playerGems < 5 && (
              <p className="text-red-600 text-xs mt-1">
                You have {playerGems} gems (need 5)
              </p>
            )}
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter a name..."
              maxLength={30}
              className="w-full bg-surface/20 rounded-xl p-4 text-gray-800 font-rubik 
                border-2 border-gold/30 shadow-inner backdrop-blur-sm
                placeholder:text-gray-500 text-sm focus:outline-none focus:border-gold/50"
              style={{ touchAction: 'manipulation' }}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck="false"
              inputMode="text"
            />
            
            <div className="flex justify-between items-center mt-2">
              {error && (
                <p className="text-red-600 text-sm font-rubik">{error}</p>
              )}
              <p className="text-gray-600 text-sm font-rubik ml-auto">
                {name.length}/30
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gold/10 border-t-4 border-gold/30 flex gap-3">
          <motion.button
            onClick={handleCloseClick}
            onTouchStart={handleCloseClick}
            className="bg-gray-300 text-gray-800 flex-1 font-luckiest text-lg py-3 px-6 rounded-xl
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
              CANCEL
            </span>
          </motion.button>
          
          <motion.button
            onClick={handleSubmit}
            onTouchStart={handleSubmit}
            className="bg-gold text-gray-800 flex-1 font-luckiest text-lg py-3 px-6 rounded-xl
              shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)] 
              active:shadow-none active:translate-y-1
              transition-all duration-150 touch-manipulation
              disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!name.trim() || playerGems < 5}
            style={{ 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">
              CONFIRM
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};