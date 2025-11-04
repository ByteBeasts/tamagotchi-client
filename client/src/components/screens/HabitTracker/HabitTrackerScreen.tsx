// ================================================================
// HABIT TRACKER SCREEN
// Main screen for managing and completing daily habits
// ================================================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useHabits } from '../../../dojo/hooks/useHabits';
import { useHabitCompletion } from '../../../dojo/hooks/useHabitCompletion';
import { habitService } from '../../../services/habitService';
import useAppStore from '../../../zustand/store';

// Components
import { TamagotchiTopBar } from '../../layout/TopBar';
import BackButton from '../../shared/BackButton';
import MagicalSparkleParticles from '../../shared/MagicalSparkleParticles';
import { HabitCard } from './components/HabitCard';
import { HabitCreationModal } from './components/HabitCreationModal';
import { HabitCompletionAnimation } from './components/HabitCompletionAnimation';

// Types
import type { Screen } from '../../types/screens';
import type { HabitCategory, HabitDifficulty, HabitRewards } from '../../../types/habit.types';

// Assets
import forestBackground from '../../../assets/backgrounds/bg-home.webp';

interface HabitTrackerScreenProps {
  onNavigation: (screen: Screen) => void;
}

export const HabitTrackerScreen = ({ onNavigation }: HabitTrackerScreenProps) => {
  const [isCreationModalOpen, setIsCreationModalOpen] = useState(false);
  const [completionAnimation, setCompletionAnimation] = useState<{
    isOpen: boolean;
    habitName: string;
    rewards: HabitRewards;
    streak: number;
  }>({
    isOpen: false,
    habitName: '',
    rewards: { coins: 0, gems: 0 },
    streak: 0
  });

  // Hooks
  const { habitsWithCompletion, isLoading, refetch } = useHabits();
  const { completeHabit, isCompleting } = useHabitCompletion();

  // Store
  const cavosWallet = useAppStore(state => state.cavos.wallet);
  const player = useAppStore(state => state.player);

  // Calculate today's progress
  const completedToday = habitsWithCompletion.filter(h => h.completedToday).length;
  const totalHabits = habitsWithCompletion.length;
  const completionPercentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

  // Handle habit completion
  const handleCompleteHabit = async (habitId: string, difficulty: HabitDifficulty) => {
    const habit = habitsWithCompletion.find(h => h.id === habitId);
    if (!habit) return;

    const result = await completeHabit(habitId, difficulty);

    if (result.success && result.rewards && result.streak !== undefined) {
      // Show celebration animation
      setCompletionAnimation({
        isOpen: true,
        habitName: habit.name,
        rewards: result.rewards,
        streak: result.streak
      });

      // Trigger refetch (realtime subscription will also auto-update)
      refetch();
    }
  };

  // Handle create habit
  const handleCreateHabit = async (habitData: {
    name: string;
    description?: string;
    category: HabitCategory;
    difficulty: HabitDifficulty;
  }) => {
    if (!cavosWallet?.address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      await habitService.createHabit({
        player_id: cavosWallet.address,
        ...habitData
      });

      setIsCreationModalOpen(false);
      toast.success('Habit created successfully! 🎉');

      // Trigger refetch (realtime subscription will also auto-update)
      refetch();
    } catch (error) {
      console.error('[HabitTracker] Failed to create habit:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create habit');
    }
  };

  // Handle delete habit
  const handleDeleteHabit = async (habitId: string) => {
    try {
      await habitService.deleteHabit(habitId);
      toast.success('Habit deleted');

      // Trigger refetch (realtime subscription will also auto-update)
      refetch();
    } catch (error) {
      console.error('[HabitTracker] Failed to delete habit:', error);
      toast.error('Failed to delete habit');
    }
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden font-rubik pb-20"
      style={{
        backgroundImage: `url(${forestBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <MagicalSparkleParticles />

      {/* Back Button */}
      <BackButton onClick={() => onNavigation('home')} className="top-12 left-4" />

      {/* Top Bar */}
      <TamagotchiTopBar
        coins={player?.total_coins || 0}
        gems={player?.total_gems || 0}
        onNavigateToGemShop={() => onNavigation('gemShop')}
      />

      {/* Header Banner */}
      <motion.div
        className="relative mt-12 mb-3"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Icon */}
        <motion.div
          className="absolute -top-11 right-3 z-10 w-40 h-40 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
        >
          <span className="text-8xl">🎯</span>
        </motion.div>

        {/* Banner */}
        <div className="bg-gold-gradient py-4 px-4 mx-4 relative rounded-[10px] shadow-md">
          <h2 className="font-luckiest text-cream text-xl sm:text-2xl lg:text-3xl drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] tracking-wide text-left">
            Daily Habits
          </h2>
          <p className="text-cream/90 text-sm mt-1 font-rubik">
            Complete habits to earn rewards
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 px-4 pb-24 space-y-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
        {/* Combined Progress Card + Create Button */}
        <motion.div
          className="bg-cream rounded-xl p-5 border border-gold/20 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Progress Section */}
          {totalHabits > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-luckiest text-base text-gray-800">Today's Progress</p>
                  <p className="font-rubik text-xs text-gray-600">
                    {completedToday} of {totalHabits} completed
                  </p>
                </div>
                <p className="font-luckiest text-3xl text-gray-800">{completionPercentage}%</p>
              </div>

              {/* Progress bar with gold gradient */}
              <div className="w-full backdrop-blur-sm bg-white/20 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  className="bg-gold-gradient h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Create Habit Button */}
          <motion.button
            onClick={() => setIsCreationModalOpen(true)}
            className="w-full bg-gold-gradient text-gray-800 font-luckiest text-base py-3.5 rounded-lg
              shadow-[0_2px_0_rgba(0,0,0,0.1)] hover:shadow-[0_1px_0_rgba(0,0,0,0.1)]
              active:shadow-none active:translate-y-0.5 transition-all duration-150
              flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="text-xl">➕</span>
            <span>Create New Habit</span>
          </motion.button>
        </motion.div>

        {/* Habits List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
            <p className="text-white font-rubik">Loading your habits...</p>
          </div>
        ) : habitsWithCompletion.length === 0 ? (
          <motion.div
            className="bg-cream/80 rounded-xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-6xl mb-4">📋</div>
            <h3 className="font-luckiest text-xl text-gray-800 mb-2">No Habits Yet</h3>
            <p className="font-rubik text-cream mb-4">
              Create your first habit to start tracking your progress!
            </p>
            <motion.button
              onClick={() => setIsCreationModalOpen(true)}
              className="bg-gold text-gray-800 font-luckiest text-base py-2 px-6 rounded-xl
                shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {habitsWithCompletion.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onComplete={handleCompleteHabit}
                isCompleting={isCompleting}
                onDelete={handleDeleteHabit}
              />
            ))}
          </div>
        )}

        {/* Motivational message */}
        {totalHabits > 0 && completedToday === totalHabits && (
          <motion.div
            className="bg-gradient-to-r from-green-100 to-emerald-50 rounded-xl p-4 border-2 border-green-300/50 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-luckiest text-lg text-green-700">All habits completed!</p>
            <p className="font-rubik text-sm text-green-600">You crushed it today! 💪</p>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <HabitCreationModal
        isOpen={isCreationModalOpen}
        onClose={() => setIsCreationModalOpen(false)}
        onSubmit={handleCreateHabit}
      />

      <HabitCompletionAnimation
        isOpen={completionAnimation.isOpen}
        habitName={completionAnimation.habitName}
        rewards={completionAnimation.rewards}
        streak={completionAnimation.streak}
        onClose={() =>
          setCompletionAnimation({
            isOpen: false,
            habitName: '',
            rewards: { coins: 0, gems: 0 },
            streak: 0
          })
        }
      />
    </div>
  );
};
