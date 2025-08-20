import { motion, AnimatePresence } from 'framer-motion';
import { GameOverModalProps } from '../../../../types/play.types';
import { useEffect } from 'react';

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

  if (!isOpen || !gameResult) return null;

  const { score, rewards, isNewHighScore, gameData } = gameResult;
  const { coins, gems, range } = rewards;

  // Handlers
  const handlePlayAgainClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onPlayAgain();
  };

  const handleExitClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onExitGame();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      e.stopPropagation();
      e.preventDefault();
      onExitGame();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleBackdropClick}
            style={{ 
              touchAction: 'none',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
          >
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 max-w-sm w-full mx-auto shadow-2xl border border-slate-700"
              onClick={(e) => e.stopPropagation()}
              style={{ touchAction: 'auto' }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Game Over!</h2>
                <p className="text-slate-300 text-sm">{gameName}</p>
              </div>

              {/* Score Section */}
              <div className="text-center mb-6">
                <div className="mb-4">
                  <div className="text-3xl font-bold text-white mb-1">
                    {score}
                  </div>
                  <div className="text-slate-400 text-sm">Final Score</div>
                </div>

                {/* New High Score Badge */}
                {isNewHighScore && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring", damping: 15 }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-4"
                  >
                    <span>🏆</span>
                    New High Score!
                  </motion.div>
                )}

                {/* Tier Badge */}
                <div className="inline-block bg-slate-700 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {range.label} Tier
                </div>
              </div>

              {/* Rewards Section */}
              <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
                <h3 className="text-white font-semibold mb-3 text-center">Rewards Earned</h3>
                
                <div className="flex justify-center gap-6">
                  {/* Coins */}
                  <div className="text-center">
                    <div className="text-2xl mb-1">🪙</div>
                    <div className="text-lg font-bold text-yellow-400">
                      +{coins}
                    </div>
                    <div className="text-xs text-slate-400">Coins</div>
                  </div>

                  {/* Gems */}
                  <div className="text-center">
                    <div className="text-2xl mb-1">💎</div>
                    <div className="text-lg font-bold text-blue-400">
                      +{gems}
                    </div>
                    <div className="text-xs text-slate-400">Gems</div>
                  </div>
                </div>

                {/* Progress to Next Tier */}
                {rewards.percentage < 100 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Progress to next tier</span>
                      <span>{rewards.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${rewards.percentage}%` }}
                        transition={{ delay: 0.5, duration: 1 }}
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Game Stats */}
              {gameData && (
                <div className="bg-slate-800/30 rounded-lg p-3 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-white">{gameData.tier}</div>
                      <div className="text-xs text-slate-400">Achievement Tier</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-white">{gameData.accuracy}%</div>
                      <div className="text-xs text-slate-400">Accuracy</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handlePlayAgainClick}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 touch-manipulation"
                  style={{ 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  Play Again
                </button>
                <button
                  onClick={handleExitClick}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 touch-manipulation"
                  style={{ 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  Exit
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={handleExitClick}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors touch-manipulation"
                style={{ 
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};