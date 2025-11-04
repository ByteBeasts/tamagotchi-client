// ================================================================
// USE HABIT COMPLETION HOOK
// Handles habit completion logic with rewards and blockchain sync
// ================================================================

import { useState } from 'react';
import { habitService } from '../../services/habitService';
import { HABIT_REWARDS, STREAK_BONUSES } from '../../constants/habitTemplates';
import useAppStore from '../../zustand/store';
import toast from 'react-hot-toast';
import type { HabitDifficulty, HabitCompletionResult } from '../../types/habit.types';

export const useHabitCompletion = () => {
  const [isCompleting, setIsCompleting] = useState(false);
  const cavosWallet = useAppStore(state => state.cavos.wallet);
  const player = useAppStore(state => state.player);
  const setPlayer = useAppStore(state => state.setPlayer);

  const completeHabit = async (
    habitId: string,
    difficulty: HabitDifficulty
  ): Promise<HabitCompletionResult> => {
    if (!cavosWallet?.address) {
      toast.error('Please connect your wallet');
      return { success: false, error: 'Wallet not connected' };
    }

    setIsCompleting(true);

    try {
      // Calculate current streak
      const currentStreak = await habitService.calculateStreak(
        habitId,
        cavosWallet.address
      );
      const newStreak = currentStreak + 1;

      // Calculate base rewards from difficulty
      const baseReward = HABIT_REWARDS[difficulty];
      let coins = baseReward.coins;
      let gems = 0;

      // Random gem drop based on difficulty
      if (Math.random() < baseReward.gemChance) {
        gems = difficulty === 3 ? Math.floor(Math.random() * 2) + 1 : 1;
      }

      // Apply streak bonuses
      const streakBonus = STREAK_BONUSES[newStreak as keyof typeof STREAK_BONUSES];
      if (streakBonus) {
        if ('coinsMultiplier' in streakBonus) {
          coins *= streakBonus.coinsMultiplier;
        }
        if ('bonusGems' in streakBonus) {
          gems += streakBonus.bonusGems;
        }
      }

      // Save completion to Supabase
      const completion = await habitService.completeHabit(
        habitId,
        cavosWallet.address,
        { coins, gems },
        newStreak
      );

      // Update player balance (optimistic update)
      if (player) {
        setPlayer({
          ...player,
          total_coins: (player.total_coins || 0) + coins,
          total_gems: (player.total_gems || 0) + gems
        });
      }

      // TODO: Sync to blockchain when smart contracts are integrated

      // Show success notification
      const streakMessage = streakBonus ? ` • ${streakBonus.bonus}` : '';
      const gemText = gems > 0 ? `, +${gems} gems ✨` : '';
      const streakText = newStreak > 1 ? ` 🔥 ${newStreak}-day streak!` : '';

      toast.success(
        `Habit completed! 🎉\n+${coins} coins${gemText}${streakText}${streakMessage}`,
        { duration: 4000 }
      );

      return {
        success: true,
        completion,
        rewards: { coins, gems },
        streak: newStreak
      };
    } catch (error) {
      console.error('[useHabitCompletion] Error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to complete habit';
      toast.error(errorMessage, { duration: 3000 });

      return { success: false, error: errorMessage };
    } finally {
      setIsCompleting(false);
    }
  };

  return {
    completeHabit,
    isCompleting
  };
};
