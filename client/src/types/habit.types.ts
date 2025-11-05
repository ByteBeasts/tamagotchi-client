// ================================================================
// HABIT TYPES - Phase 1 MVP
// ================================================================

export type HabitCategory =
  | 'health'
  | 'learning'
  | 'work'
  | 'creativity'
  | 'mindfulness'
  | 'life';

export type HabitDifficulty = 1 | 2 | 3; // Easy, Medium, Hard

export interface Habit {
  id: string;
  player_id: string;
  name: string;
  description?: string | null;
  category: HabitCategory;
  difficulty: HabitDifficulty;
  is_active: boolean;
  created_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  player_id: string;
  completed_at: string;
  completion_date: string; // Format: YYYY-MM-DD
  reward_coins: number;
  reward_gems: number;
  streak_count: number;
}

export interface CreateHabitDto {
  player_id: string;
  name: string;
  description?: string;
  category: HabitCategory;
  difficulty: HabitDifficulty;
}

export interface UpdateHabitDto {
  name?: string;
  description?: string;
  category?: HabitCategory;
  difficulty?: HabitDifficulty;
  is_active?: boolean;
}

export interface HabitRewards {
  coins: number;
  gems: number;
  foodId?: number | null; // Food ID if won (1-20)
}

export interface HabitCompletionResult {
  success: boolean;
  completion?: HabitCompletion;
  rewards?: HabitRewards;
  streak?: number;
  error?: string;
}

// UI Types
export interface HabitWithCompletion extends Habit {
  completedToday: boolean;
  currentStreak: number;
  lastCompleted?: string;
}

export interface HabitTemplate {
  name: string;
  description?: string;
  category: HabitCategory;
  difficulty: HabitDifficulty;
  icon: string;
  color: string;
}
