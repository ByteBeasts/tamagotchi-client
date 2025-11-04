// ================================================================
// USE HABITS HOOK
// Manages habits data fetching and state
// ================================================================

import { useState, useEffect, useCallback } from 'react';
import { habitService } from '../../services/habitService';
import useAppStore from '../../zustand/store';
import type { Habit, HabitWithCompletion } from '../../types/habit.types';

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitsWithCompletion, setHabitsWithCompletion] = useState<HabitWithCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchTrigger, setFetchTrigger] = useState(0); // Used to force refetch
  const cavosWallet = useAppStore(state => state.cavos.wallet);

  // Fetch habits for current player
  const fetchHabits = useCallback(async () => {
    if (!cavosWallet?.address) {
      setHabits([]);
      setHabitsWithCompletion([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch habits
      const playerHabits = await habitService.getPlayerHabits(cavosWallet.address);
      setHabits(playerHabits);

      // Fetch today's completions
      const todayCompletions = await habitService.getTodayCompletions(
        cavosWallet.address
      );
      const completedHabitIds = new Set(
        todayCompletions.map(c => c.habit_id)
      );

      // Enrich habits with completion status and streaks
      const enrichedHabits = await Promise.all(
        playerHabits.map(async (habit) => {
          const completedToday = completedHabitIds.has(habit.id);
          const currentStreak = await habitService.calculateStreak(
            habit.id,
            cavosWallet.address
          );

          // Get last completion date
          const completions = await habitService.getHabitCompletions(habit.id);
          const lastCompleted = completions.length > 0
            ? completions[0].completion_date
            : undefined;

          return {
            ...habit,
            completedToday,
            currentStreak: completedToday ? currentStreak + 1 : currentStreak,
            lastCompleted
          } as HabitWithCompletion;
        })
      );

      setHabitsWithCompletion(enrichedHabits);
    } catch (err) {
      console.error('[useHabits] Error fetching habits:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch habits');
    } finally {
      setIsLoading(false);
    }
  }, [cavosWallet?.address]);

  // Fetch on mount, when wallet changes, or when manually triggered
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits, fetchTrigger]);

  // Subscribe to realtime changes for habits
  useEffect(() => {
    if (!cavosWallet?.address) return;

    // Subscribe to habits table changes
    const habitsChannel = habitService.subscribeToHabits(
      cavosWallet.address,
      fetchHabits
    );

    // Subscribe to habit_completions table changes
    const completionsChannel = habitService.subscribeToCompletions(
      cavosWallet.address,
      fetchHabits
    );

    // Cleanup subscriptions
    return () => {
      habitsChannel.unsubscribe();
      completionsChannel.unsubscribe();
    };
  }, [cavosWallet?.address, fetchHabits]);

  // Refetch function for manual refresh
  const refetch = useCallback(async () => {
    if (!cavosWallet?.address) return;

    // Trigger re-fetch via useEffect
    setFetchTrigger(prev => prev + 1);
  }, [cavosWallet?.address]);

  return {
    habits,
    habitsWithCompletion,
    isLoading,
    error,
    refetch
  };
};
