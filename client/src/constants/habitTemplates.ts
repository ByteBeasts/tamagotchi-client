// ================================================================
// HABIT TEMPLATES - Pre-configured habits for quick setup
// ================================================================

import type { HabitTemplate } from '../types/habit.types';

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // ========================================
  // HEALTH & FITNESS
  // ========================================
  {
    name: 'Drink 8 glasses of water',
    description: 'Stay hydrated throughout the day',
    category: 'health',
    difficulty: 1,
    icon: '💧',
    color: '#3B82F6'
  },
  {
    name: 'Exercise 30 minutes',
    description: 'Get your body moving',
    category: 'health',
    difficulty: 2,
    icon: '💪',
    color: '#EF4444'
  },
  {
    name: 'Sleep 8 hours',
    description: 'Get quality rest',
    category: 'health',
    difficulty: 2,
    icon: '😴',
    color: '#6366F1'
  },
  {
    name: 'Take vitamins',
    description: 'Daily vitamin supplement',
    category: 'health',
    difficulty: 1,
    icon: '💊',
    color: '#10B981'
  },
  {
    name: 'Stretch 10 minutes',
    description: 'Improve flexibility',
    category: 'health',
    difficulty: 1,
    icon: '🧘‍♀️',
    color: '#8B5CF6'
  },

  // ========================================
  // LEARNING
  // ========================================
  {
    name: 'Read 30 minutes',
    description: 'Read books or articles',
    category: 'learning',
    difficulty: 1,
    icon: '📚',
    color: '#10B981'
  },
  {
    name: 'Learn new language 30min',
    description: 'Practice a new language',
    category: 'learning',
    difficulty: 2,
    icon: '🌍',
    color: '#8B5CF6'
  },
  {
    name: 'Watch educational video',
    description: 'Learn something new',
    category: 'learning',
    difficulty: 1,
    icon: '🎓',
    color: '#F59E0B'
  },
  {
    name: 'Practice coding 1 hour',
    description: 'Build your programming skills',
    category: 'learning',
    difficulty: 2,
    icon: '💻',
    color: '#EC4899'
  },

  // ========================================
  // WORK & PRODUCTIVITY
  // ========================================
  {
    name: 'Deep work 2 hours',
    description: 'Focused work without distractions',
    category: 'work',
    difficulty: 3,
    icon: '💼',
    color: '#F59E0B'
  },
  {
    name: 'Inbox Zero',
    description: 'Clear all emails',
    category: 'work',
    difficulty: 2,
    icon: '📧',
    color: '#EC4899'
  },
  {
    name: 'Plan tomorrow',
    description: 'Set goals for next day',
    category: 'work',
    difficulty: 1,
    icon: '📝',
    color: '#14B8A6'
  },
  {
    name: 'Review weekly goals',
    description: 'Check progress on goals',
    category: 'work',
    difficulty: 1,
    icon: '🎯',
    color: '#F97316'
  },

  // ========================================
  // CREATIVITY
  // ========================================
  {
    name: 'Write 500 words',
    description: 'Creative or professional writing',
    category: 'creativity',
    difficulty: 2,
    icon: '✍️',
    color: '#14B8A6'
  },
  {
    name: 'Draw or sketch',
    description: 'Practice visual arts',
    category: 'creativity',
    difficulty: 2,
    icon: '🎨',
    color: '#EC4899'
  },
  {
    name: 'Play music 30min',
    description: 'Practice an instrument',
    category: 'creativity',
    difficulty: 2,
    icon: '🎵',
    color: '#8B5CF6'
  },
  {
    name: 'Take creative photos',
    description: 'Practice photography',
    category: 'creativity',
    difficulty: 1,
    icon: '📸',
    color: '#3B82F6'
  },

  // ========================================
  // MINDFULNESS
  // ========================================
  {
    name: 'Meditate 10 minutes',
    description: 'Practice mindfulness',
    category: 'mindfulness',
    difficulty: 1,
    icon: '🧘',
    color: '#A78BFA'
  },
  {
    name: 'Journal before bed',
    description: 'Reflect on your day',
    category: 'mindfulness',
    difficulty: 1,
    icon: '📔',
    color: '#F472B6'
  },
  {
    name: 'Gratitude practice',
    description: 'Write 3 things you\'re grateful for',
    category: 'mindfulness',
    difficulty: 1,
    icon: '🙏',
    color: '#FCD34D'
  },
  {
    name: 'Morning affirmations',
    description: 'Start day with positive thoughts',
    category: 'mindfulness',
    difficulty: 1,
    icon: '☀️',
    color: '#FBBF24'
  },

  // ========================================
  // LIFE ADMIN
  // ========================================
  {
    name: 'Make bed',
    description: 'Start the day right',
    category: 'life',
    difficulty: 1,
    icon: '🛏️',
    color: '#6B7280'
  },
  {
    name: 'Clean workspace',
    description: 'Organize your environment',
    category: 'life',
    difficulty: 1,
    icon: '🧹',
    color: '#9CA3AF'
  },
  {
    name: 'Cook healthy meal',
    description: 'Prepare nutritious food',
    category: 'life',
    difficulty: 2,
    icon: '🍳',
    color: '#F59E0B'
  },
  {
    name: 'Call family/friends',
    description: 'Stay connected',
    category: 'life',
    difficulty: 1,
    icon: '📞',
    color: '#10B981'
  }
];

// ================================================================
// REWARD CALCULATION CONSTANTS
// Updated to match goal_tracker_product_spec.md (line 131-152)
// ================================================================

export const HABIT_REWARDS = {
  1: { coins: 50, gemChance: 0.1, foodChance: 5 },    // Easy: 50 coins, 0.1% gem chance, 5% food
  2: { coins: 100, gemChance: 5, foodChance: 10 },    // Medium: 100 coins, 5% gem chance, 10% food
  3: { coins: 150, gemChance: 10, foodChance: 15 }    // Hard: 150 coins, 10% gem chance, 15% food
} as const;

// ================================================================
// CATEGORY METADATA
// ================================================================

export const CATEGORY_INFO = {
  health: {
    label: 'Health',
    icon: '💪',
    color: '#EF4444',
    description: 'Physical wellness and exercise'
  },
  learning: {
    label: 'Learning',
    icon: '📚',
    color: '#10B981',
    description: 'Education and skill development'
  },
  work: {
    label: 'Productivity',
    icon: '💼',
    color: '#F59E0B',
    description: 'Professional tasks and goals'
  },
  creativity: {
    label: 'Creativity',
    icon: '🎨',
    color: '#EC4899',
    description: 'Artistic and creative pursuits'
  },
  mindfulness: {
    label: 'Mindfulness',
    icon: '🧘',
    color: '#A78BFA',
    description: 'Mental wellness and reflection'
  },
  life: {
    label: 'Life',
    icon: '🏠',
    color: '#6B7280',
    description: 'Daily tasks and organization'
  }
} as const;

// ================================================================
// STREAK BONUSES
// ================================================================

export const STREAK_BONUSES = {
  7: { coinsMultiplier: 2, bonus: 'Double coins for 24h!' },
  14: { bonusGems: 1, bonus: '+1 gem bonus' },
  30: { bonusGems: 5, bonus: '+5 gems + achievement' },
  100: { bonusGems: 20, bonus: '+20 gems + legendary badge' }
} as const;
