// ================================================================
// HABIT COMPLETION ANIMATION
// Celebration animation with confetti (adapted from FoodPurchaseAnimation)
// ================================================================

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import type { Engine, Container, IOptions, RecursivePartial } from '@tsparticles/engine';
import { MoveDirection } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import type { HabitRewards } from '../../../../types/habit.types';
import gemIcon from '../../../../assets/icons/gems/icon-gem-single.webp';
import coinIcon from '../../../../assets/icons/coins/icon-coin-single.webp';
import { FOOD_ASSETS } from '../../../../constants/feed.constants';
import { isMagicFood } from '../../../../utils/habitRewardCalculator';

interface HabitCompletionAnimationProps {
  isOpen: boolean;
  habitName: string;
  rewards: HabitRewards;
  streak: number;
  onClose: () => void;
}

export const HabitCompletionAnimation = ({
  isOpen,
  habitName,
  rewards,
  streak,
  onClose
}: HabitCompletionAnimationProps) => {
  const [engineLoaded, setEngineLoaded] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => setEngineLoaded(true));
  }, []);

  // Auto-close after 3.5 seconds
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Play success sound
  useEffect(() => {
    if (isOpen) {
      const audio = new Audio('/purchase-success.mp3');
      audio.volume = 0.5;
      audio.play().catch((err) => console.log('Audio play failed:', err));
      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [isOpen]);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log('Habit completion confetti loaded', container);
  };

  // Confetti particles config (green/gold theme for success)
  const options = useMemo<RecursivePartial<IOptions>>(
    () => ({
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
            width: 1920,
            height: 1080
          }
        },
        color: {
          value: ['#10B981', '#F59E0B', '#FFD700', '#34D399', '#FBBF24']
        },
        shape: {
          type: 'circle'
        },
        opacity: {
          value: { min: 0.1, max: 0.9 },
          animation: {
            enable: true,
            speed: 1,
            startValue: 'max',
            destroy: 'min'
          }
        },
        size: {
          value: { min: 3, max: 8 },
          animation: {
            enable: false
          }
        },
        move: {
          enable: true,
          speed: 6,
          direction: MoveDirection.none,
          random: true,
          straight: false,
          outModes: {
            default: 'destroy',
            bottom: 'destroy',
            left: 'destroy',
            right: 'destroy',
            top: 'destroy'
          },
          attract: {
            enable: false
          }
        },
        life: {
          duration: {
            sync: false,
            value: 3
          },
          count: 1
        }
      },
      detectRetina: true,
      background: {
        color: 'transparent'
      },
      interactivity: {
        detectsOn: 'window',
        events: {
          resize: {
            enable: true,
            delay: 0.5
          }
        }
      },
      emitters: {
        direction: 'top',
        life: {
          count: 0,
          duration: 0.1,
          delay: 0.1
        },
        rate: {
          delay: 0.05,
          quantity: 6
        },
        size: {
          width: 50,
          height: 0
        },
        position: {
          x: 50,
          y: 100
        }
      }
    }),
    []
  );

  if (!isOpen || !engineLoaded) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
    >
      {/* Particle background */}
      <Particles
        id="habitCompletionParticles"
        className="absolute inset-0 z-0"
        options={options}
        particlesLoaded={particlesLoaded}
      />

      {/* Main card */}
      <motion.div
        className="bg-cream w-[90%] max-w-sm rounded-3xl shadow-2xl border-4 border-gold/50 overflow-hidden z-10"
        initial={{ scale: 0.8, y: 20 }}
        animate={{
          scale: 1,
          y: 0,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 15
          }
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 p-6 relative overflow-hidden">
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
            className="text-center relative z-10"
          >
            <div className="text-6xl mb-2">🎉</div>
            <h2 className="font-luckiest text-2xl text-white drop-shadow-lg">
              HABIT COMPLETED!
            </h2>
          </motion.div>
        </div>

        {/* Body */}
        <div className="p-6 bg-gradient-to-b from-cream to-cream/80 space-y-4">
          {/* Habit name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <p className="text-sm text-gray-600 font-rubik mb-1">You completed:</p>
            <h3 className="font-luckiest text-xl text-gray-800">{habitName}</h3>
          </motion.div>

          {/* Rewards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl p-4 border-2 border-yellow-300/50"
          >
            <p className="text-xs text-gray-600 font-rubik text-center mb-2">
              REWARDS EARNED
            </p>
            <div className="space-y-2">
              {/* Coins */}
              <div className="flex items-center justify-center gap-2">
                <img src={coinIcon} alt="Coin" className="w-8 h-8" />
                <span className="font-luckiest text-2xl text-yellow-700">
                  +{rewards.coins}
                </span>
              </div>

              {/* Gems (if any) */}
              {rewards.gems > 0 && (
                <div className="flex items-center justify-center gap-2">
                  <img src={gemIcon} alt="Gem" className="w-6 h-6" />
                  <span className="font-luckiest text-2xl text-purple-700">
                    +{rewards.gems}
                  </span>
                </div>
              )}

              {/* Food (if any) */}
              {rewards.foodId && (
                <div className="flex items-center justify-center gap-2">
                  <div className="relative">
                    <img
                      src={FOOD_ASSETS[rewards.foodId as keyof typeof FOOD_ASSETS]?.img}
                      alt={FOOD_ASSETS[rewards.foodId as keyof typeof FOOD_ASSETS]?.name || 'Food'}
                      className="w-10 h-10"
                    />
                    {isMagicFood(rewards.foodId) && (
                      <span className="absolute -top-1 -right-1 text-lg">✨</span>
                    )}
                  </div>
                  <div className="text-left">
                    <span className="font-luckiest text-lg text-green-700 block">
                      +1 {FOOD_ASSETS[rewards.foodId as keyof typeof FOOD_ASSETS]?.name || 'Food'}
                    </span>
                    {isMagicFood(rewards.foodId) && (
                      <span className="text-xs text-purple-600 font-rubik font-medium">
                        Magic Item!
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Streak (if > 1) */}
          {streak > 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', bounce: 0.6 }}
              className="bg-gradient-to-br from-orange-100 to-red-50 rounded-xl p-4 border-2 border-orange-300/50 text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-3xl">🔥</span>
                <div>
                  <p className="font-luckiest text-2xl text-orange-700">
                    {streak}-DAY STREAK!
                  </p>
                  <p className="text-xs text-gray-600 font-rubik">Keep it going!</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Special milestone messages */}
          {streak === 7 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-xs text-purple-600 font-rubik font-medium"
            >
              ✨ 2x coins bonus active for 24h!
            </motion.p>
          )}
          {streak === 14 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-xs text-purple-600 font-rubik font-medium"
            >
              ✨ Bonus gem earned!
            </motion.p>
          )}
          {streak === 30 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-xs text-purple-600 font-rubik font-medium"
            >
              🏆 Legendary 30-day streak! +5 bonus gems!
            </motion.p>
          )}
        </div>

        {/* Footer button */}
        <div className="p-4 bg-gold/10 border-t-4 border-gold/30">
          <motion.button
            onClick={onClose}
            className="w-full bg-gold-gradient text-gray-800 font-luckiest text-lg py-3 rounded-xl
              shadow-[0_4px_0_rgba(0,0,0,0.2)] hover:shadow-[0_2px_0_rgba(0,0,0,0.2)]
              active:shadow-none active:translate-y-1 transition-all duration-150"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)]">AWESOME!</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
