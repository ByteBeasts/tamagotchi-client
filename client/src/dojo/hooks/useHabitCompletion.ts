// ================================================================
// USE HABIT COMPLETION HOOK
// Handles habit completion logic with rewards and blockchain sync
// ================================================================

import { useState } from 'react';
import { habitService } from '../../services/habitService';
import { STREAK_BONUSES } from '../../constants/habitTemplates';
import useAppStore from '../../zustand/store';
import toast from 'react-hot-toast';
import type { HabitDifficulty, HabitCompletionResult } from '../../types/habit.types';
import { calculateHabitReward, getRewardDisplayText, isMagicFood } from '../../utils/habitRewardCalculator';
import { useHabitReward } from './useHabitReward';
import { FOOD_ASSETS } from '../../constants/feed.constants';

export const useHabitCompletion = () => {
  const [isCompleting, setIsCompleting] = useState(false);
  const cavosWallet = useAppStore(state => state.cavos.wallet);
  const { grantReward } = useHabitReward();

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

      // Calculate rewards using new reward calculator
      const reward = calculateHabitReward(difficulty);
      let { coins, gems, foodId } = reward;

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

      console.log('🎁 [HabitCompletion] Rewards calculated:', {
        difficulty,
        coins,
        gems,
        foodId,
        streak: newStreak,
        streakBonus: streakBonus?.bonus
      });

      // Save completion to Supabase FIRST (before blockchain)
      const completion = await habitService.completeHabit(
        habitId,
        cavosWallet.address,
        { coins, gems },
        newStreak
      );

      // Grant rewards via blockchain
      const rewardResult = await grantReward({ ...reward, coins, gems });

      if (!rewardResult.success) {
        throw new Error(rewardResult.error || 'Failed to grant blockchain rewards');
      }

      // Build success message
      const rewardTexts = getRewardDisplayText({ ...reward, coins, gems });
      const streakMessage = streakBonus ? ` • ${streakBonus.bonus}` : '';
      const streakText = newStreak > 1 ? ` 🔥 ${newStreak}-day streak!` : '';

      // Add food name if food was won
      let foodText = '';
      if (foodId !== null) {
        const foodName = FOOD_ASSETS[foodId as keyof typeof FOOD_ASSETS]?.name || 'Food';
        const foodEmoji = isMagicFood(foodId) ? '✨' : '🍎';
        foodText = `\n+1 ${foodName} ${foodEmoji}`;
      }

      toast.success(
        `Habit completed! 🎉\n${rewardTexts.join(', ')}${foodText}${streakText}${streakMessage}`,
        { duration: 5000 }
      );

      return {
        success: true,
        completion,
        rewards: { coins, gems, foodId },
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
