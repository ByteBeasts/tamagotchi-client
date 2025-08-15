import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useBeastShareData } from '../../../../dojo/hooks/useBeastsShareData';
import closeIcon from "../../../../assets/icons/extras/icon-close.png";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'beast' | 'minigame';
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
  minigameData,
}) => {
  const [tweetMsg, setTweetMsg] = useState("");
  const [isDataReady, setIsDataReady] = useState(false);

  // get real-time beast data automatically
  const { beastDataForShare, shareMetadata } = useBeastShareData();

  // Memoize the tweet message to prevent infinite re-renders
  const tweetMessage = useMemo(() => {
    if (type === 'beast' && beastDataForShare) {
      // tweet generation with real-time feel
      if (shareMetadata && shareMetadata.hasValidData) {
        const { mood, emoji, needsAttention } = shareMetadata;
        
        const attentionText = needsAttention.length > 0 
          ? `\nNeeds: ${needsAttention.join(", ")} 📝` 
          : `\nAll stats perfect! 💯`;

        return `🎮 My ByteBeast is ${mood}! ${emoji}\n\n` +
          `📊 Day ${beastDataForShare.age} Status:\n` +
          `⚡ Energy: ${beastDataForShare.energy}%\n` +
          `🍖 Hunger: ${beastDataForShare.hunger}%\n` +
          `😊 Happiness: ${beastDataForShare.happiness}%\n` +
          `🛁 Cleanliness: ${beastDataForShare.cleanliness}%${attentionText}\n\n` +
          `Join the ByteBeasts Tamagotchi adventure! 🚀\n` +
          `👉 https://www.bytebeasts.io\n` +
          `@0xByteBeasts`;
      } else {
        // New beast or loading state - shorter
        return `🎮 Just started my ByteBeasts Tamagotchi journey!\n\n` +
          `My virtual beast is just getting started... 🐣\n\n` +
          `Stay tuned for updates on how it grows! 📈\n\n` +
          `Ready to raise your own Beast? 🚀\n` +
          `👉 https://www.bytebeasts.io\n` +
          `@0xByteBeasts`;
      }
      
    } else if (type === 'minigame' && minigameData) {
      // 🎮 MINIGAME Logic - shorter but engaging
      const getGameResultText = (score: number) => {
        if (score >= 50) return "🔥 BEAST MODE!";
        if (score >= 30) return "⚡ Crushing it!";
        if (score >= 15) return "📈 Getting stronger!";
        if (score >= 5) return "🎯 Making progress!";
        return "🐣 Just started!";
      };

      return `🎮 I just played ${minigameData.name} mini-game in ByteBeasts Tamagotchi\n\n` +
        `${getGameResultText(minigameData.score)} Score: ${minigameData.score} 🏆\n\n` +
        `Think you can beat it? Bring it on! 🔥\n` +
        `👉 https://www.bytebeasts.io\n` +
        `@0xByteBeasts`;
    } else {
      // 🎮 FALLBACK: shorter but intriguing
      return `🎮 Playing ByteBeasts Tamagotchi!\n\n` +
        `Join me in raising virtual creatures on the blockchain! 🌟\n\n` +
        `👉 https://www.bytebeasts.io\n` +
        `@0xByteBeasts`;
    }
  }, [
    type,
    beastDataForShare?.age,
    beastDataForShare?.energy,
    beastDataForShare?.hunger,
    beastDataForShare?.happiness,
    beastDataForShare?.cleanliness,
    shareMetadata?.mood,
    shareMetadata?.emoji,
    shareMetadata?.hasValidData,
    shareMetadata?.needsAttention?.join(','),
    minigameData?.name,
    minigameData?.score
  ]);

  // Set the tweet message and data ready state
  useEffect(() => {
    setTweetMsg(tweetMessage);
    setIsDataReady(
      (type === 'beast' && shareMetadata?.hasValidData) || 
      (type === 'minigame' && !!minigameData)
    );
  }, [tweetMessage, type, shareMetadata?.hasValidData, minigameData]);

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
        <div className="bg-gold-gradient p-4 border-b-4 border-gold/40 flex justify-between items-center">
          <h2 className="text-gray-800 font-luckiest text-2xl tracking-wide drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)]">
            SHARE ON X
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
          {/* Status indicators */}
          {type === 'beast' && !isDataReady && (
            <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded-lg">
              <p className="text-blue-800 text-sm font-rubik">
                🐣 Your ByteBeast is just getting started! The tweet will show your journey beginning.
              </p>
            </div>
          )}
          
          <div className="relative">
            <textarea
              value={tweetMsg}
              readOnly={true} // 🔒 READ-ONLY: Users cannot edit the message
              rows={8}
              className="w-full bg-surface/20 rounded-xl p-4 text-gray-800 font-rubik resize-none focus:outline-none 
                border-2 border-gold/30 shadow-inner backdrop-blur-sm
                placeholder:text-gray-500 text-sm cursor-default" 
              style={{ touchAction: 'manipulation' }}
              placeholder="Generated message will appear here..."
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
              transition-all duration-150 touch-manipulation
              disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={tweetMsg.length > 280}
            style={{ 
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">
              {tweetMsg.length > 280 ? 'MESSAGE TOO LONG' : 'SHARE ON X'}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};