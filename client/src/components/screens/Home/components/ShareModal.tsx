import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'beast' | 'minigame';
  beastData?: {
    age: number;
    energy: number;
    hunger: number;
    happiness: number;
    cleanliness: number;
  };
  minigameData?: {
    name: string;
    score: number;
  };
  account?: any;
  client?: any;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  type,
  beastData,
  minigameData,
}) => {
  const [tweetMsg, setTweetMsg] = useState("");

  useEffect(() => {
    if (type === 'beast' && beastData) {
      setTweetMsg(
        `🎮 Playing ByteBeasts Tamagotchi, and here is my Beast's progress:\n\n` +
        `🕰️ Age: ${beastData.age} ${beastData.age === 1 ? 'day' : 'days'}\n` +
        `⚡ Energy: ${beastData.energy}\n` +
        `🍖 Hunger: ${beastData.hunger}\n` +
        `😊 Happiness: ${beastData.happiness}\n` +
        `🛁 Cleanliness: ${beastData.cleanliness}\n\n` +
        `These are my current values! 🌟\n\n` +
        `Ready to raise your own Beast? 🚀\n` +
        `👉 https://www.bytebeasts.games\n` +
        `@0xByteBeasts`
      );
    } else if (type === 'minigame' && minigameData) {
      setTweetMsg(
        `🎮 I just played ${minigameData.name} mini-game in ByteBeasts Tamagotchi\n\n` +
        `My score: ${minigameData.score} 🏆\n\n` +
        `Think you can beat it? Bring it on! 🔥\n` +
        `👉 https://www.bytebeasts.games\n` +
        `@0xByteBeasts`
      );
    }
  }, [type, beastData, minigameData]);

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

  const tweetText = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetMsg)}`;

  // Handlers with touch support
  const handleShareClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    window.open(tweetText, '_blank', 'noopener,noreferrer');
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
        <div className="bg-gold/20 p-4 border-b-4 border-gold/40 flex justify-between items-center">
          <h2 className="text-gray-800 font-luckiest text-2xl tracking-wide drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
            SHARE ON X
          </h2>
          <motion.button 
            onClick={handleCloseClick}
            onTouchStart={handleCloseClick}
            className="text-gray-800 transition-colors font-luckiest text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gold/10 touch-manipulation"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            style={{ 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            ×
          </motion.button>
        </div>

        {/* Body */}
        <div className="p-6 bg-gradient-to-b from-cream to-cream/80">
          <div className="relative">
            <textarea
              value={tweetMsg}
              onChange={(e) => setTweetMsg(e.target.value)}
              rows={6}
              className="w-full bg-surface/20 rounded-xl p-4 text-gray-800 font-rubik resize-none focus:outline-none 
                border-2 border-gold/30 shadow-inner backdrop-blur-sm
                placeholder:text-gray-500"
              style={{ touchAction: 'manipulation' }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gold/10 border-t-4 border-gold/30">
          <motion.button
            onClick={handleShareClick}
            onTouchStart={handleShareClick}
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
            <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">SHARE ON X</span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};