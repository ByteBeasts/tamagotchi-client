// ================================================================
// HABIT SERVICE - Supabase CRUD operations
// ================================================================

import { supabase } from '../lib/supabaseClient';
import type {
  Habit,
  HabitCompletion,
  CreateHabitDto,
  UpdateHabitDto
} from '../types/habit.types';

// ========================================
// UTILITY - Get local date in YYYY-MM-DD format (respects user's timezone)
// ========================================
const getLocalDate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const habitService = {
  // ========================================
  // CREATE
  // ========================================
  async createHabit(habit: CreateHabitDto): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .insert(habit)
      .select()
      .single();

    if (error) {
      console.error('Error creating habit:', error);
      throw new Error(error.message || 'Failed to create habit');
    }

    return data as Habit;
  },

  // ========================================
  // READ
  // ========================================
  async getPlayerHabits(playerId: string): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('player_id', playerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[habitService] Error fetching habits:', error);
      throw new Error(error.message || 'Failed to fetch habits');
    }

    return data as Habit[];
  },

  async getHabitById(habitId: string): Promise<Habit | null> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('id', habitId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('Error fetching habit:', error);
      throw new Error(error.message || 'Failed to fetch habit');
    }

    return data as Habit;
  },

  async getHabitsByCategory(playerId: string, category: string): Promise<Habit[]> {
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('player_id', playerId)
      .eq('category', category)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching habits by category:', error);
      throw new Error(error.message || 'Failed to fetch habits');
    }

    return data as Habit[];
  },

  // ========================================
  // UPDATE
  // ========================================
  async updateHabit(habitId: string, updates: UpdateHabitDto): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', habitId)
      .select()
      .single();

    if (error) {
      console.error('Error updating habit:', error);
      throw new Error(error.message || 'Failed to update habit');
    }

    return data as Habit;
  },

  // ========================================
  // DELETE (soft delete)
  // ========================================
  async deleteHabit(habitId: string): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .update({ is_active: false })
      .eq('id', habitId)
      .select()
      .single();

    if (error) {
      console.error('Error deleting habit:', error);
      throw new Error(error.message || 'Failed to delete habit');
    }

    return data as Habit;
  },

  // ========================================
  // COMPLETIONS - READ
  // ========================================
  async getTodayCompletions(playerId: string): Promise<HabitCompletion[]> {
    const today = getLocalDate();

    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('player_id', playerId)
      .eq('completion_date', today);

    if (error) {
      console.error('[habitService] Error fetching today completions:', error);
      throw new Error(error.message || 'Failed to fetch completions');
    }

    return data as HabitCompletion[];
  },

  async getCompletionHistory(
    playerId: string,
    days: number = 30
  ): Promise<HabitCompletion[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateString = getLocalDate(startDate);

    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('player_id', playerId)
      .gte('completion_date', startDateString)
      .order('completion_date', { ascending: false });

    if (error) {
      console.error('Error fetching completion history:', error);
      throw new Error(error.message || 'Failed to fetch completion history');
    }

    return data as HabitCompletion[];
  },

  async getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
    const { data, error } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .order('completion_date', { ascending: false });

    if (error) {
      console.error('Error fetching habit completions:', error);
      throw new Error(error.message || 'Failed to fetch habit completions');
    }

    return data as HabitCompletion[];
  },

  // ========================================
  // COMPLETIONS - CREATE
  // ========================================
  async completeHabit(
    habitId: string,
    playerId: string,
    rewards: { coins: number; gems: number },
    streak: number
  ): Promise<HabitCompletion> {
    const today = getLocalDate();

    // Check if already completed today
    const { data: existing } = await supabase
      .from('habit_completions')
      .select('*')
      .eq('habit_id', habitId)
      .eq('completion_date', today)
      .single();

    if (existing) {
      throw new Error('Habit already completed today');
    }

    // Insert completion
    const { data, error } = await supabase
      .from('habit_completions')
      .insert({
        habit_id: habitId,
        player_id: playerId,
        completion_date: today,
        reward_coins: rewards.coins,
        reward_gems: rewards.gems,
        streak_count: streak
      })
      .select()
      .single();

    if (error) {
      console.error('[habitService] Error completing habit:', error);
      throw new Error(error.message || 'Failed to complete habit');
    }

    return data as HabitCompletion;
  },

  // ========================================
  // STREAK CALCULATION
  // ========================================
  async calculateStreak(habitId: string, playerId: string): Promise<number> {
    // Get all completions for this habit, ordered by date DESC
    const { data, error } = await supabase
      .from('habit_completions')
      .select('completion_date')
      .eq('habit_id', habitId)
      .eq('player_id', playerId)
      .order('completion_date', { ascending: false });

    if (error) {
      console.error('Error calculating streak:', error);
      return 0;
    }

    if (!data || data.length === 0) {
      return 0;
    }

    // Calculate streak by checking consecutive days
    let streak = 0;
    let checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - 1); // Start from yesterday

    for (const completion of data) {
      // Parse completion date in local timezone
      const completionDate = new Date(completion.completion_date + 'T00:00:00');
      const checkDateString = getLocalDate(checkDate);
      const completionDateString = getLocalDate(completionDate);

      if (completionDateString === checkDateString) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1); // Check previous day
      } else {
        break; // Streak broken
      }
    }

    return streak;
  },

  // ========================================
  // UTILITY - Check if habit completed today
  // ========================================
  async isCompletedToday(habitId: string, playerId: string): Promise<boolean> {
    const today = getLocalDate();

    const { data, error } = await supabase
      .from('habit_completions')
      .select('id')
      .eq('habit_id', habitId)
      .eq('player_id', playerId)
      .eq('completion_date', today)
      .single();

    if (error) {
      // PGRST116 means not found, which is expected
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error('Error checking if completed today:', error);
      return false;
    }

    return !!data;
  },

  // ========================================
  // REALTIME SUBSCRIPTIONS
  // ========================================
  subscribeToHabits(playerId: string, callback: () => void) {
    const channel = supabase
      .channel(`habits:${playerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habits',
          filter: `player_id=eq.${playerId}`
        },
        callback
      )
      .subscribe();

    return channel;
  },

  subscribeToCompletions(playerId: string, callback: () => void) {
    const channel = supabase
      .channel(`completions:${playerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'habit_completions',
          filter: `player_id=eq.${playerId}`
        },
        callback
      )
      .subscribe();

    return channel;
  }
};
