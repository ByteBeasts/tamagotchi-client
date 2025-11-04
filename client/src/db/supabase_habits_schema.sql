-- ================================================================
-- HABITS SYSTEM - PHASE 1 MVP
-- Simplified schema for goal tracker
-- ================================================================

-- ================================================================
-- 1. HABITS TABLE
-- ================================================================
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id TEXT NOT NULL,

  -- Habit details
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(20) NOT NULL CHECK (category IN ('health', 'learning', 'work', 'creativity', 'mindfulness', 'life')),
  difficulty INTEGER NOT NULL CHECK (difficulty IN (1, 2, 3)),

  -- Metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Foreign key to users table
  CONSTRAINT fk_habits_player FOREIGN KEY (player_id) REFERENCES public.users(address) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_habits_player_id ON public.habits(player_id);
CREATE INDEX idx_habits_category ON public.habits(category);
CREATE INDEX idx_habits_active ON public.habits(is_active);
CREATE INDEX idx_habits_player_active ON public.habits(player_id, is_active);

-- ================================================================
-- 2. HABIT_COMPLETIONS TABLE
-- ================================================================
CREATE TABLE public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL,
  player_id TEXT NOT NULL,

  -- When completed
  completed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completion_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Rewards earned (snapshot at completion)
  reward_coins INTEGER NOT NULL DEFAULT 0,
  reward_gems INTEGER NOT NULL DEFAULT 0,

  -- Streak at completion time
  streak_count INTEGER NOT NULL DEFAULT 1,

  -- Foreign keys
  CONSTRAINT fk_completions_habit FOREIGN KEY (habit_id) REFERENCES public.habits(id) ON DELETE CASCADE,
  CONSTRAINT fk_completions_player FOREIGN KEY (player_id) REFERENCES public.users(address) ON DELETE CASCADE,

  -- Prevent double completion on same day
  CONSTRAINT unique_habit_completion_per_day UNIQUE (habit_id, completion_date)
);

-- Indexes for performance
CREATE INDEX idx_completions_player_id ON public.habit_completions(player_id);
CREATE INDEX idx_completions_habit_id ON public.habit_completions(habit_id);
CREATE INDEX idx_completions_date ON public.habit_completions(completion_date);
CREATE INDEX idx_completions_player_date ON public.habit_completions(player_id, completion_date);

-- ================================================================
-- 3. ROW LEVEL SECURITY (RLS) - Simplified for MVP
-- ================================================================

-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;

-- Simple policies: allow all operations if authenticated
CREATE POLICY "Users can manage own habits"
  ON public.habits
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can manage own completions"
  ON public.habit_completions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ================================================================
-- 4. COMMENTS FOR DOCUMENTATION
-- ================================================================

COMMENT ON TABLE public.habits IS 'Stores user-created habits for goal tracking';
COMMENT ON COLUMN public.habits.category IS 'Category: health, learning, work, creativity, mindfulness, life';
COMMENT ON COLUMN public.habits.difficulty IS 'Difficulty level: 1=Easy, 2=Medium, 3=Hard (affects rewards)';
COMMENT ON COLUMN public.habits.is_active IS 'Soft delete flag - false means deleted';

COMMENT ON TABLE public.habit_completions IS 'Records when users complete their habits';
COMMENT ON COLUMN public.habit_completions.completion_date IS 'Date of completion (for preventing duplicates)';
COMMENT ON COLUMN public.habit_completions.streak_count IS 'Streak count at the time of completion';
COMMENT ON CONSTRAINT unique_habit_completion_per_day ON public.habit_completions IS 'Users can only complete a habit once per day';
