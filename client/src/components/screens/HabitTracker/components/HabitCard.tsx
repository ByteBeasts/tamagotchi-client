// ================================================================
// HABIT CARD COMPONENT
// Individual habit display with checkbox and streak counter
// ================================================================

import { motion } from 'framer-motion';
import { useState } from 'react';
import type { HabitWithCompletion, HabitDifficulty } from '../../../../types/habit.types';
import { CATEGORY_INFO } from '../../../../constants/habitTemplates';

interface HabitCardProps {
  habit: HabitWithCompletion;
  onComplete: (habitId: string, difficulty: HabitDifficulty) => void;
  isCompleting: boolean;
  onEdit?: (habitId: string) => void;
  onDelete?: (habitId: string) => void;
}

export const HabitCard = ({ habit, onComplete, isCompleting, onEdit, onDelete }: HabitCardProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const categoryInfo = CATEGORY_INFO[habit.category];

  const getDifficultyColor = () => {
    return 'text-gray-700';
  };

  const getDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty);
  };

  const handleCheckboxClick = () => {
    if (!habit.completedToday && !isCompleting) {
      onComplete(habit.id, habit.difficulty);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: habit.completedToday ? 0.7 : 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`relative bg-cream rounded-xl border shadow-md transition-all overflow-hidden
        ${habit.completedToday
          ? 'border-gold/20'
          : 'border-gold/30 hover:border-gold/50'
        }`}
    >
      <div className="p-4 relative z-10">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <motion.button
            onClick={handleCheckboxClick}
            disabled={habit.completedToday || isCompleting}
            className={`flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center transition-all
              ${habit.completedToday
                ? 'bg-gold border-gold cursor-default'
                : 'bg-white/10 backdrop-blur-sm border-gold/40 hover:border-gold hover:bg-gold/10 cursor-pointer'
              }
              ${isCompleting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            whileTap={!habit.completedToday && !isCompleting ? { scale: 0.9 } : {}}
          >
            {habit.completedToday && (
              <span className="text-white text-lg font-bold">✓</span>
            )}
          </motion.button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name and category */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={`font-luckiest text-base leading-tight text-gray-800 ${
                habit.completedToday ? 'line-through' : ''
              }`}>
                {habit.name}
              </h3>

              {/* Category icon */}
              <span className="text-xl flex-shrink-0" title={categoryInfo.label}>
                {categoryInfo.icon}
              </span>
            </div>

            {/* Description (if exists) */}
            {habit.description && (
              <p className="text-xs text-gray-600 font-rubik mb-2 line-clamp-2">
                {habit.description}
              </p>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Difficulty */}
              <div className={`inline-flex items-center gap-1 text-xs font-rubik font-medium
                ${getDifficultyColor()}`}>
                <span>{getDifficultyStars(habit.difficulty)}</span>
              </div>

              {/* Streak */}
              {habit.currentStreak > 0 && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 border border-orange-300 text-orange-700 text-xs font-rubik font-medium">
                  <span>🔥</span>
                  <span>{habit.currentStreak} day{habit.currentStreak > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>

          {/* Menu button (optional) */}
          {(onEdit || onDelete) && (
            <div className="relative">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-200/50"
                whileTap={{ scale: 0.9 }}
              >
                <span className="text-lg">⋮</span>
              </motion.button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-8 bg-cream rounded-lg shadow-lg border border-gold/20 overflow-hidden z-20 min-w-[120px]"
                >
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(habit.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm font-rubik text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(habit.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm font-rubik text-red-600 hover:bg-red-50 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
