import { motion, AnimatePresence } from 'framer-motion';
import { GameOverModalProps } from '../../../../types/play.types';
import { useEffect, useMemo } from 'react';
import closeIcon from "../../../../../assets/icons/extras/icon-close.webp";
import coinIcon from "../../../../../assets/icons/coins/icon-coin-single.webp";
import gemIcon from "../../../../../assets/icons/gems/icon-gem-single.webp";

export const GameOverModal = ({
  isOpen,
  gameResult,
  onPlayAgain,
  onExitGame,
  gameName
}: GameOverModalProps) => {
  
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

  // Generate tweet message for minigame (same logic as ShareModal)
  const tweetMessage = useMemo(() => {
    if (!gameResult) return '';
    
    const getGameResultText = (score: number) => {
      if (score >= 50) return "🔥 BEAST MODE!";
      if (score >= 30) return "⚡ Crushing it!";
      if (score >= 15) return "📈 Getting stronger!";
      if (score >= 5) return "🎯 Making progress!";
      return "🐣 Just started!";
    };

    return `🎮 I just played ${gameName} mini-game in ByteBeasts Tamagotchi\n\n` +
      `${getGameResultText(gameResult.score)} Score: ${gameResult.score} 🏆\n\n` +
      `Think you can beat it? Bring it on! 🔥\n` +
      `👉 https://www.bytebeasts.io\n` +
      `\n` +
      `@0xByteBeasts`;
  }, [gameName, gameResult]);

  if (!isOpen || !gameResult) return null;

  const { score, rewards } = gameResult;
  const { coins, gems } = rewards;

  // Handlers with touch support
  const handlePlayAgainClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onPlayAgain();
  };

  const handleShareClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const tweetText = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetMessage)}`;
    window.open(tweetText, '_blank', 'noopener,noreferrer');
  };

  const handleBackdropClick = (e: React.MouseEvent | React.TouchEvent) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      e.preventDefault();
      onExitGame();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
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
                GAME OVER!
              </h2>
              <motion.button 
                onClick={onExitGame}
                onTouchStart={onExitGame}
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
              {/* Game Name */}
              <div className="text-center mb-6">
                <p className="text-gray-600 font-rubik text-lg">{gameName}</p>
              </div>

              {/* Score */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-800 mb-2">{score}</div>
                <div className="text-gray-600 font-rubik">Final Score</div>
              </div>

              {/* Rewards Earned */}
              <div className="text-center mb-6">
                <h3 className="text-gray-800 font-semibold mb-4 font-rubik">Rewards Earned</h3>
                
                <div className="flex justify-center gap-12">
                  {/* Coins */}
                  <div className="text-center">
                    <div className="mb-2">
                      <img src={coinIcon} alt="Coins" className="w-12 h-12 mx-auto" />
                    </div>
                    <div className="text-lg font-bold text-yellow-600">
                      +{coins}
                    </div>
                    <div className="text-xs text-gray-600 font-rubik">Coins</div>
                  </div>

                  {/* Gems */}
                  <div className="text-center">
                    <div className="mb-2">
                      <img src={gemIcon} alt="Gems" className="w-12 h-12 mx-auto" />
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      +{gems}
                    </div>
                    <div className="text-xs text-gray-600 font-rubik">Gems</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gold/10 border-t-4 border-gold/30">
              <div className="flex gap-3">
                <motion.button
                  onClick={handlePlayAgainClick}
                  onTouchStart={handlePlayAgainClick}
                  className="flex-1 bg-gold text-gray-800 font-luckiest text-lg py-3 px-6 rounded-xl
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
                    PLAY AGAIN
                  </span>
                </motion.button>
                <motion.button
                  onClick={handleShareClick}
                  onTouchStart={handleShareClick}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-luckiest text-lg py-3 px-6 rounded-xl
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
                    SHARE ON X
                  </span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};